// Comment tree component (2 levels of nesting)
import { escapeHtml } from '../utils/dom.js';
import { formatRelativeTime } from '../utils/format.js';
import { getUser, isLoggedIn } from '../state.js';

export function renderCommentTree(comments, postId) {
    if (!comments || comments.length === 0) {
        return `
            <div class="text-center py-8 text-content-muted">
                No comments yet. Be the first to comment!
            </div>
        `;
    }

    return comments.map(comment => renderComment(comment, postId)).join('');
}

function renderComment(comment, postId, isReply = false) {
    const user = getUser();
    const isOwner = user && user.user_id === comment.user_id;
    const isDeleted = !!comment.deleted_at;
    const included = comment.included || {};
    const username = included.user?.username || 'Unknown';
    const replies = included.replies || [];

    if (isDeleted) {
        return `
            <div class="comment ${isReply ? 'comment-reply' : ''} py-3">
                <p class="text-content-muted italic">[Comment deleted]</p>
                ${!isReply && replies.length > 0 ? `
                    <div class="mt-3">
                        ${replies.map(reply => renderComment(reply, postId, true)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    return `
        <div class="comment ${isReply ? 'comment-reply' : ''} py-3" data-comment-id="${comment.id}">
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-medium text-brand-600">
                        ${username.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <a href="#/users/${comment.user_id}" class="font-medium text-content-primary hover:text-brand-600 transition-colors">
                            ${escapeHtml(username)}
                        </a>
                        <span class="text-content-muted text-sm">${formatRelativeTime(comment.created_at)}</span>
                    </div>
                    <p class="text-content-secondary whitespace-pre-wrap break-words">${escapeHtml(comment.body)}</p>
                    <div class="flex items-center gap-4 mt-2">
                        ${!isReply && isLoggedIn() ? `
                            <button class="reply-btn text-sm text-content-muted hover:text-brand-600 transition-colors"
                                data-comment-id="${comment.id}">
                                Reply
                            </button>
                        ` : ''}
                        ${isOwner ? `
                            <button class="delete-comment-btn text-sm text-content-muted hover:text-red-500 transition-colors"
                                data-post-id="${postId}" data-comment-id="${comment.id}">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                    <!-- Reply form (hidden by default) -->
                    <div class="reply-form hidden mt-3" data-parent-id="${comment.id}">
                        <textarea class="reply-input w-full form-input rounded-lg px-3 py-2 text-sm"
                            rows="2" placeholder="Write a reply..."></textarea>
                        <div class="flex gap-2 mt-2">
                            <button class="submit-reply-btn btn-primary text-sm px-3 py-1.5 rounded-lg"
                                data-post-id="${postId}" data-comment-id="${comment.id}">
                                Reply
                            </button>
                            <button class="cancel-reply-btn text-content-muted hover:text-content-primary text-sm px-3 py-1.5 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            ${!isReply && replies.length > 0 ? `
                <div class="mt-3">
                    ${replies.map(reply => renderComment(reply, postId, true)).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

export function renderCommentForm(postId) {
    if (!isLoggedIn()) {
        return `
            <div class="bg-surface-50 rounded-xl p-4 border border-surface-200 text-center">
                <p class="text-content-secondary">
                    <a href="#" class="text-brand-600 hover:text-brand-700 transition-colors" id="login-to-comment">Log in</a>
                    to leave a comment.
                </p>
            </div>
        `;
    }

    return `
        <div class="bg-surface-50 rounded-xl p-4 border border-surface-200">
            <textarea id="new-comment-input"
                class="w-full form-input rounded-lg px-3 py-2"
                rows="3" placeholder="Write a comment..."></textarea>
            <div class="flex justify-end mt-2">
                <button id="submit-comment-btn" data-post-id="${postId}"
                    class="btn-primary font-medium px-4 py-2 rounded-lg">
                    Post Comment
                </button>
            </div>
        </div>
    `;
}
