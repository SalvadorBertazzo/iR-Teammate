const BASE = '/posts';

/**
 * GET /teams/mine
 * Returns [{ post_id, title, role }] for all teams the current user belongs to
 */
export async function getMyTeams() {
    const res = await fetch('/teams/mine', { credentials: 'include' });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to load teams');
    return res.json();
}

/**
 * DELETE /posts/:id/team
 * Owner deletes the entire team (and its post).
 */
export async function deleteTeam(postId) {
    const res = await fetch(`${BASE}/${postId}/team`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok && res.status !== 204) throw new Error((await res.json()).error || 'Failed to delete team');
}

/**
 * DELETE /posts/:id/team/members/:userId
 * Owner removes a member, or member leaves themselves.
 */
export async function removeMember(postId, userId) {
    const res = await fetch(`${BASE}/${postId}/team/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok && res.status !== 204) throw new Error((await res.json()).error || 'Failed to remove member');
}

/**
 * GET /posts/:id/team
 * Returns team info: { post_id, title, members: [{ user_id, username, role, joined_at }] }
 */
export async function getTeam(postId) {
    const res = await fetch(`${BASE}/${postId}/team`, { credentials: 'include' });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to load team');
    return res.json();
}

/**
 * GET /posts/:id/team/messages?after=<id>
 * Returns array of messages since afterId (0 = all)
 */
export async function getMessages(postId, afterId = 0) {
    const url = afterId > 0
        ? `${BASE}/${postId}/team/messages?after=${afterId}`
        : `${BASE}/${postId}/team/messages`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to load messages');
    return res.json();
}

/**
 * POST /posts/:id/team/messages
 * Sends a chat message. Returns the created message.
 */
export async function sendMessage(postId, body) {
    const res = await fetch(`${BASE}/${postId}/team/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to send message');
    return res.json();
}
