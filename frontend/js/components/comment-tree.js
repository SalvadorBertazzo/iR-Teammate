// Comment tree component (2 levels of nesting)
import { escapeHtml } from '../utils/dom.js';
import { formatRelativeTime } from '../utils/format.js';
import { getUser, isLoggedIn } from '../state.js';

export function renderCommentTree(comments, postId) {
    if (!comments || comments.length === 0) {
        return `
            <div class="text-center py-8 text-gray-400">
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
                <p class="text-gray-400 italic">[Comment deleted]</p>
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
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-medium text-gray-600">
                        ${username.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <a href="#/users/${comment.user_id}" class="font-medium text-gray-900 hover:text-blue-600">
                            ${escapeHtml(username)}
                        </a>
                        <span class="text-gray-400 text-sm">${formatRelativeTime(comment.created_at)}</span>
                    </div>
                    <p class="text-gray-700 whitespace-pre-wrap break-words">${escapeHtml(comment.body)}</p>
                    <div class="flex items-center gap-4 mt-2">
                        ${!isReply && isLoggedIn() ? `
                            <button class="reply-btn text-sm text-gray-400 hover:text-blue-600"
                                data-comment-id="${comment.id}">
                                Reply
                            </button>
                        ` : ''}
                        ${isOwner ? `
                            <button class="delete-comment-btn text-sm text-gray-400 hover:text-red-600"
                                data-post-id="${postId}" data-comment-id="${comment.id}">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                    <!-- Reply form (hidden by default) -->
                    <div class="reply-form hidden mt-3" data-parent-id="${comment.id}">
                        <textarea class="reply-input w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 text-sm"
                            rows="2" placeholder="Write a reply..."></textarea>
                        <div class="flex gap-2 mt-2">
                            <button class="submit-reply-btn bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-md transition-colors"
                                data-post-id="${postId}" data-comment-id="${comment.id}">
                                Reply
                            </button>
                            <button class="cancel-reply-btn text-gray-500 hover:text-gray-700 text-sm px-3 py-1">
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
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                <p class="text-gray-500">
                    <a href="#" class="text-blue-600 hover:text-blue-700" id="login-to-comment">Log in</a>
                    to leave a comment.
                </p>
            </div>
        `;
    }

    return `
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <textarea id="new-comment-input"
                class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400"
                rows="3" placeholder="Write a comment..."></textarea>
            <div class="flex justify-end mt-2">
                <button id="submit-comment-btn" data-post-id="${postId}"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors">
                    Post Comment
                </button>
            </div>
        </div>
    `;
}
