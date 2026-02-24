// My Teams page — 3-column layout: team list | chat | members
import { getUser, isLoggedIn } from '../state.js';
import { getMyTeams, getTeam, getMessages, sendMessage, deleteTeam, removeMember } from '../api/teams.js';
import toast from '../components/toast.js';

let pollInterval   = null;
let lastMessageId  = 0;
let activePostId   = null;
let currentUserId  = null;
let currentTeams   = [];
let currentMembers = [];

export async function render(container, params) {
    stopPolling();

    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="my-teams-empty-screen">
                <p class="text-content-muted">You need to be logged in to view your teams.</p>
                <a href="#/" class="btn-primary mt-4">Go Home</a>
            </div>
        `;
        return;
    }

    const user = getUser();
    currentUserId = user?.user_id ?? user?.id;

    container.innerHTML = `<div class="my-teams-shell"><div class="my-teams-loading"><div class="spinner spinner-lg"></div></div></div>`;

    try {
        currentTeams = await getMyTeams();
    } catch (err) {
        container.innerHTML = `<div class="my-teams-empty-screen"><p class="text-content-muted">${err.message}</p></div>`;
        return;
    }

    // Determine the initially selected team
    const preselect = params?.id ? parseInt(params.id, 10) : null;
    activePostId = (preselect && currentTeams.find(t => t.post_id === preselect))
        ? preselect
        : (currentTeams[0]?.post_id ?? null);

    renderShell(container);

    if (activePostId) {
        await selectTeam(activePostId);
    } else {
        showNoneSelected();
    }
}

// ─── Shell layout ────────────────────────────────────────────────────────────

function renderShell(container) {
    container.innerHTML = `
        <div class="my-teams-shell">

            <!-- Left: team list -->
            <aside class="my-teams-left">
                <div class="my-teams-panel-header">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    My Teams
                </div>
                <nav class="my-teams-nav" id="teams-nav">
                    ${currentTeams.length === 0
                        ? `<p class="my-teams-nav-empty">No teams yet.<br>Apply to posts or create your own!</p>`
                        : currentTeams.map(t => renderTeamNavItem(t)).join('')
                    }
                </nav>
            </aside>

            <!-- Center: chat -->
            <div class="my-teams-center" id="teams-center">
                <!-- filled by selectTeam() -->
            </div>

            <!-- Right: members -->
            <aside class="my-teams-right" id="teams-right">
                <!-- filled by selectTeam() -->
            </aside>

        </div>
    `;

    // Attach nav click listeners
    document.getElementById('teams-nav')?.querySelectorAll('.my-teams-nav-item').forEach(el => {
        el.addEventListener('click', () => {
            const pid = parseInt(el.dataset.postId, 10);
            if (pid !== activePostId) selectTeam(pid);
        });
    });
}

function renderTeamNavItem(team) {
    const active = team.post_id === activePostId ? 'my-teams-nav-item--active' : '';
    return `
        <button class="my-teams-nav-item ${active}" data-post-id="${team.post_id}">
            <div class="my-teams-nav-icon ${team.role === 'owner' ? 'my-teams-nav-icon--owner' : ''}">
                ${team.role === 'owner'
                    ? `<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`
                    : `<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
                }
            </div>
            <span class="my-teams-nav-title">${esc(team.title)}</span>
            <span class="my-teams-nav-role ${team.role === 'owner' ? 'my-teams-nav-role--owner' : ''}">${team.role}</span>
        </button>
    `;
}

function refreshTeamNav() {
    const nav = document.getElementById('teams-nav');
    if (!nav) return;
    nav.innerHTML = currentTeams.length === 0
        ? `<p class="my-teams-nav-empty">No teams yet.</p>`
        : currentTeams.map(t => renderTeamNavItem(t)).join('');
    nav.querySelectorAll('.my-teams-nav-item').forEach(el => {
        el.addEventListener('click', () => {
            const pid = parseInt(el.dataset.postId, 10);
            if (pid !== activePostId) selectTeam(pid);
        });
    });
}

// ─── Team selection ──────────────────────────────────────────────────────────

async function selectTeam(postId) {
    stopPolling();
    activePostId = postId;
    lastMessageId = 0;

    // Highlight active item
    document.querySelectorAll('.my-teams-nav-item').forEach(el => {
        el.classList.toggle('my-teams-nav-item--active', parseInt(el.dataset.postId, 10) === postId);
    });

    // Show loading in center + right
    const center = document.getElementById('teams-center');
    const right  = document.getElementById('teams-right');
    if (center) center.innerHTML = `<div class="my-teams-loading"><div class="spinner"></div></div>`;
    if (right)  right.innerHTML  = `<div class="my-teams-loading"><div class="spinner"></div></div>`;

    try {
        const [team, messages] = await Promise.all([
            getTeam(postId),
            getMessages(postId, 0),
        ]);
        currentMembers = team.members;

        if (messages.length > 0) lastMessageId = messages[messages.length - 1].id;

        renderCenter(center, team, messages);
        renderRight(right, team);

        scrollChat();
        attachChatListeners(postId, team);
        startPolling(postId);

    } catch (err) {
        if (center) center.innerHTML = `<div class="my-teams-loading"><p class="text-content-muted">${err.message}</p></div>`;
        if (right)  right.innerHTML  = '';
    }
}

function showNoneSelected() {
    const center = document.getElementById('teams-center');
    const right  = document.getElementById('teams-right');
    if (center) center.innerHTML = `<div class="my-teams-loading"><p class="text-content-muted text-sm">Select a team on the left.</p></div>`;
    if (right)  right.innerHTML  = '';
}

// ─── Center (chat) ────────────────────────────────────────────────────────────

function renderCenter(el, team, messages) {
    el.innerHTML = `
        <div class="my-teams-chat-header">
            <div>
                <h2 class="my-teams-chat-title">${esc(team.title)}</h2>
                <a href="#/posts/${team.post_id}" class="my-teams-chat-postlink">View post →</a>
            </div>
        </div>
        <div class="my-teams-messages" id="chat-messages">
            ${messages.length === 0
                ? `<div class="my-teams-msg-empty">No messages yet — say hello!</div>`
                : messages.map(renderMsgHTML).join('')
            }
        </div>
        <form class="my-teams-chat-form" id="chat-form">
            <input id="chat-input" class="my-teams-chat-input"
                   type="text" placeholder="Send a message…" autocomplete="off" maxlength="1000"/>
            <button type="submit" id="chat-send" class="my-teams-chat-send">
                <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
            </button>
        </form>
    `;
}

function renderMsgHTML(msg) {
    const own = msg.user_id === currentUserId;
    return `
        <div class="my-teams-msg ${own ? 'my-teams-msg--own' : ''}">
            <div class="my-teams-msg-avatar">${avatarLetter(msg.username)}</div>
            <div class="my-teams-msg-bubble">
                <div class="my-teams-msg-meta ${own ? 'my-teams-msg-meta--own' : ''}">
                    <a href="#/users/${msg.user_id}" class="my-teams-msg-author">${esc(msg.username)}</a>
                    <span class="my-teams-msg-time">${fmtTime(msg.created_at)}</span>
                </div>
                <p class="my-teams-msg-body ${own ? 'my-teams-msg-body--own' : ''}">${esc(msg.body)}</p>
            </div>
        </div>
    `;
}

function appendMessages(newMsgs) {
    const el = document.getElementById('chat-messages');
    if (!el) return;
    el.querySelector('.my-teams-msg-empty')?.remove();
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    newMsgs.forEach(msg => {
        const d = document.createElement('div');
        d.innerHTML = renderMsgHTML(msg);
        el.appendChild(d.firstElementChild);
    });
    if (atBottom) scrollChat();
}

function attachChatListeners(postId, team) {
    const form  = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const send  = document.getElementById('chat-send');
    if (!form || !input) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = input.value.trim();
        if (!body) return;
        input.disabled = true;
        send.disabled  = true;
        try {
            const msg = await sendMessage(postId, body);
            input.value = '';
            appendMessages([msg]);
            lastMessageId = msg.id;
        } catch (err) {
            toast.error(err.message || 'Failed to send');
        } finally {
            input.disabled = false;
            send.disabled  = false;
            input.focus();
        }
    });
}

// ─── Right (members) ─────────────────────────────────────────────────────────

function renderRight(el, team) {
    const myTeam = currentTeams.find(t => t.post_id === team.post_id);
    const isOwner = myTeam?.role === 'owner';

    el.innerHTML = `
        <div class="my-teams-panel-header">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Members · ${team.members.length}
        </div>

        <ul class="my-teams-member-list" id="member-list">
            ${team.members.map(m => renderMemberItem(m, isOwner, team.post_id)).join('')}
        </ul>

        <div class="my-teams-right-footer">
            ${isOwner
                ? `<button id="delete-team-btn" class="my-teams-danger-btn">
                       <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                       </svg>
                       Delete Team
                   </button>`
                : `<button id="leave-team-btn" class="my-teams-leave-btn">
                       <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                 d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                       </svg>
                       Leave Team
                   </button>`
            }
        </div>
    `;

    attachMemberListeners(team.post_id, isOwner);
}

function renderMemberItem(member, isOwner, postId) {
    const isSelf   = member.user_id === currentUserId;
    const canRemove = isOwner && !isSelf;
    return `
        <li class="my-teams-member-item" data-user-id="${member.user_id}">
            <a href="#/users/${member.user_id}" class="my-teams-member-link">
                <div class="my-teams-member-avatar">${avatarLetter(member.username)}</div>
                <div class="my-teams-member-info">
                    <span class="my-teams-member-name">${esc(member.username)}${isSelf ? ' <span class="my-teams-you">(you)</span>' : ''}</span>
                    <span class="my-teams-member-role my-teams-member-role--${member.role}">${member.role}</span>
                </div>
            </a>
            ${canRemove
                ? `<button class="my-teams-kick-btn" data-user-id="${member.user_id}" title="Remove from team">
                       <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                       </svg>
                   </button>`
                : ''
            }
        </li>
    `;
}

function attachMemberListeners(postId, isOwner) {
    // Remove member (owner)
    document.querySelectorAll('.my-teams-kick-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const uid = parseInt(btn.dataset.userId, 10);
            const member = currentMembers.find(m => m.user_id === uid);
            if (!confirm(`Remove ${member?.username ?? 'this member'} from the team?`)) return;
            btn.disabled = true;
            try {
                await removeMember(postId, uid);
                toast.success('Member removed');
                await reloadTeamRight(postId);
            } catch (err) {
                toast.error(err.message || 'Failed to remove member');
                btn.disabled = false;
            }
        });
    });

    // Delete team (owner)
    const deleteBtn = document.getElementById('delete-team-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Delete this team? This will permanently delete the post and all messages.')) return;
            deleteBtn.disabled = true;
            try {
                await deleteTeam(postId);
                toast.success('Team deleted');
                stopPolling();
                // Remove from local list and re-render
                currentTeams = currentTeams.filter(t => t.post_id !== postId);
                activePostId = currentTeams[0]?.post_id ?? null;
                refreshTeamNav();
                if (activePostId) {
                    await selectTeam(activePostId);
                } else {
                    const center = document.getElementById('teams-center');
                    const right  = document.getElementById('teams-right');
                    if (center) center.innerHTML = `<div class="my-teams-loading"><p class="text-content-muted text-sm">No teams left.</p></div>`;
                    if (right)  right.innerHTML  = '';
                }
            } catch (err) {
                toast.error(err.message || 'Failed to delete team');
                deleteBtn.disabled = false;
            }
        });
    }

    // Leave team (non-owner)
    const leaveBtn = document.getElementById('leave-team-btn');
    if (leaveBtn) {
        leaveBtn.addEventListener('click', async () => {
            if (!confirm('Leave this team?')) return;
            leaveBtn.disabled = true;
            try {
                await removeMember(postId, currentUserId);
                toast.success('You left the team');
                stopPolling();
                currentTeams = currentTeams.filter(t => t.post_id !== postId);
                activePostId = currentTeams[0]?.post_id ?? null;
                refreshTeamNav();
                if (activePostId) {
                    await selectTeam(activePostId);
                } else {
                    const center = document.getElementById('teams-center');
                    const right  = document.getElementById('teams-right');
                    if (center) center.innerHTML = `<div class="my-teams-loading"><p class="text-content-muted text-sm">No teams left.</p></div>`;
                    if (right)  right.innerHTML  = '';
                }
            } catch (err) {
                toast.error(err.message || 'Failed to leave team');
                leaveBtn.disabled = false;
            }
        });
    }
}

async function reloadTeamRight(postId) {
    try {
        const team = await getTeam(postId);
        currentMembers = team.members;
        const right = document.getElementById('teams-right');
        if (right) renderRight(right, team);
    } catch (_) {}
}

// ─── Polling ──────────────────────────────────────────────────────────────────

function startPolling(postId) {
    pollInterval = setInterval(async () => {
        if (!document.getElementById('chat-messages')) { stopPolling(); return; }
        try {
            const newMsgs = await getMessages(postId, lastMessageId);
            if (newMsgs.length > 0) {
                appendMessages(newMsgs);
                lastMessageId = newMsgs[newMsgs.length - 1].id;
            }
        } catch (_) {}
    }, 4000);
}

function stopPolling() {
    if (pollInterval !== null) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

window.addEventListener('hashchange', stopPolling);

// ─── Utils ────────────────────────────────────────────────────────────────────

function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function avatarLetter(u) { return (u?.[0] ?? '?').toUpperCase(); }
function fmtTime(iso) {
    const d = new Date(iso), now = new Date(), diff = (now - d) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function scrollChat() {
    const el = document.getElementById('chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
}
