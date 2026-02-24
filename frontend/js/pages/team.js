// Team page — members list + chat
import { getUser, isLoggedIn } from '../state.js';
import { getTeam, getMessages, sendMessage } from '../api/teams.js';

let pollInterval = null;
let lastMessageId = 0;
let currentPostId = null;
let currentUserId = null;

export async function render(container, params) {
    // Clean up any previous poll
    stopPolling();

    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="page-error-state">
                <p class="text-content-muted">You must be logged in to view this page.</p>
                <a href="#/browse" class="btn-primary mt-4">Browse Posts</a>
            </div>
        `;
        return;
    }

    const postId = params?.id;
    if (!postId) {
        container.innerHTML = `<div class="page-error-state"><p>Invalid team ID.</p></div>`;
        return;
    }

    currentPostId = postId;
    const user = getUser();
    currentUserId = user?.user_id ?? user?.id;

    container.innerHTML = `
        <div class="team-page">
            <div class="team-spinner">
                <div class="spinner spinner-lg"></div>
            </div>
        </div>
    `;

    try {
        const [team, messages] = await Promise.all([
            getTeam(postId),
            getMessages(postId, 0),
        ]);

        if (messages.length > 0) {
            lastMessageId = messages[messages.length - 1].id;
        }

        renderTeamPage(container, team, messages);
        startPolling(postId);

    } catch (err) {
        container.innerHTML = `
            <div class="page-error-state">
                <p class="text-content-muted">${err.message || 'Could not load team.'}</p>
                <a href="#/browse" class="btn-secondary mt-4">Go Back</a>
            </div>
        `;
    }
}

function renderTeamPage(container, team, messages) {
    container.innerHTML = `
        <div class="team-page">

            <!-- Header -->
            <div class="team-header">
                <div class="team-header-inner">
                    <a href="#/posts/${team.post_id}" class="team-back-link">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        Back to post
                    </a>
                    <h1 class="team-title">${escapeHtml(team.title)}</h1>
                    <p class="team-subtitle">Team Space</p>
                </div>
            </div>

            <!-- Body: 2-column layout -->
            <div class="team-body">

                <!-- Left: members sidebar -->
                <aside class="team-sidebar">
                    <div class="team-sidebar-header">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Members · ${team.members.length}
                    </div>
                    <ul class="team-member-list">
                        ${team.members.map(m => `
                            <li class="team-member-item">
                                <a href="#/users/${m.user_id}" class="team-member-link">
                                    <div class="team-member-avatar">${avatarLetter(m.username)}</div>
                                    <div class="team-member-info">
                                        <span class="team-member-name">${escapeHtml(m.username)}</span>
                                        <span class="team-member-role team-member-role--${m.role}">${m.role}</span>
                                    </div>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </aside>

                <!-- Right: chat area -->
                <div class="team-chat">
                    <div class="team-chat-messages" id="chat-messages">
                        ${messages.length === 0
                            ? `<div class="team-chat-empty">No messages yet. Say hello!</div>`
                            : messages.map(m => renderMessageHTML(m)).join('')
                        }
                    </div>

                    <form class="team-chat-form" id="chat-form">
                        <input
                            type="text"
                            id="chat-input"
                            class="team-chat-input"
                            placeholder="Send a message…"
                            autocomplete="off"
                            maxlength="1000"
                        />
                        <button type="submit" class="team-chat-send" id="chat-send">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                            </svg>
                        </button>
                    </form>
                </div>

            </div>
        </div>
    `;

    scrollChatToBottom();
    attachChatListeners();
}

function renderMessageHTML(msg) {
    const isOwn = msg.user_id === currentUserId;
    return `
        <div class="team-msg ${isOwn ? 'team-msg--own' : ''}">
            <div class="team-msg-avatar">${avatarLetter(msg.username)}</div>
            <div class="team-msg-bubble">
                <div class="team-msg-meta">
                    <a href="#/users/${msg.user_id}" class="team-msg-author">${escapeHtml(msg.username)}</a>
                    <span class="team-msg-time">${formatTime(msg.created_at)}</span>
                </div>
                <p class="team-msg-body">${escapeHtml(msg.body)}</p>
            </div>
        </div>
    `;
}

function appendMessages(newMessages) {
    const chatEl = document.getElementById('chat-messages');
    if (!chatEl) return;

    const emptyEl = chatEl.querySelector('.team-chat-empty');
    if (emptyEl) emptyEl.remove();

    const wasAtBottom = isScrolledToBottom(chatEl);

    newMessages.forEach(msg => {
        const div = document.createElement('div');
        div.innerHTML = renderMessageHTML(msg);
        chatEl.appendChild(div.firstElementChild);
    });

    if (wasAtBottom) scrollChatToBottom();
}

function attachChatListeners() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    if (!form || !input) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = input.value.trim();
        if (!body) return;

        input.disabled = true;
        sendBtn.disabled = true;

        try {
            const msg = await sendMessage(currentPostId, body);
            input.value = '';
            appendMessages([msg]);
            lastMessageId = msg.id;
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    });
}

function startPolling(postId) {
    pollInterval = setInterval(async () => {
        const chatEl = document.getElementById('chat-messages');
        if (!chatEl) { stopPolling(); return; }

        try {
            const newMsgs = await getMessages(postId, lastMessageId);
            if (newMsgs.length > 0) {
                appendMessages(newMsgs);
                lastMessageId = newMsgs[newMsgs.length - 1].id;
            }
        } catch (_) {
            // Silently ignore poll errors
        }
    }, 4000);
}

function stopPolling() {
    if (pollInterval !== null) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

// Stop polling when navigating away
window.addEventListener('hashchange', stopPolling);

// ─── Helpers ───────────────────────────────────────────────────────────────

function avatarLetter(username) {
    return (username?.[0] ?? '?').toUpperCase();
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function scrollChatToBottom() {
    const chatEl = document.getElementById('chat-messages');
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
}

function isScrolledToBottom(el) {
    return el.scrollHeight - el.scrollTop - el.clientHeight < 40;
}
