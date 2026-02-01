// Post detail page
import { getPost } from '../api/posts.js';
import { listComments, createComment, createReply, deleteComment } from '../api/comments.js';
import { createApplication } from '../api/applications.js';
import { getUser, isLoggedIn } from '../state.js';
import { escapeHtml } from '../utils/dom.js';
import { formatDateTime, formatRelativeTime, formatCategory, getCategoryClass, formatStatus, getStatusClass, formatIRating, formatLicenseLevel, getLicenseClass } from '../utils/format.js';
import { renderCommentTree, renderCommentForm } from '../components/comment-tree.js';
import { renderLoading, renderError } from '../components/loading.js';
import { showModal, closeModal } from '../components/modal.js';
import toast from '../components/toast.js';
import { login } from '../api/auth.js';

export async function render(container, params) {
    const postId = parseInt(params.id);

    container.innerHTML = renderLoading('Loading post...');

    try {
        const post = await getPost(postId);

        if (!post) {
            container.innerHTML = renderError('Post not found');
            return;
        }

        const user = getUser();
        const isOwner = user && user.user_id === post.user_id;
        const included = post.included || {};

        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Back button -->
                <a href="#/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back to posts
                </a>

                <!-- Post header -->
                <article class="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                    <div class="flex flex-wrap items-center gap-2 mb-4">
                        <span class="px-2 py-1 rounded text-xs font-medium ${getCategoryClass(post.category)}">
                            ${formatCategory(post.category)}
                        </span>
                        <span class="px-2 py-1 rounded text-xs font-medium ${getStatusClass(post.status)}">
                            ${formatStatus(post.status)}
                        </span>
                        <span class="text-gray-400 text-sm ml-auto">
                            Posted ${formatRelativeTime(post.created_at)}
                        </span>
                    </div>

                    <h1 class="text-2xl font-bold text-gray-900 mb-4">${escapeHtml(post.title)}</h1>

                    <div class="prose max-w-none mb-6">
                        <p class="text-gray-700 whitespace-pre-wrap">${escapeHtml(post.body)}</p>
                    </div>

                    <!-- Details grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                        <div>
                            <span class="text-gray-400 text-xs block">Min iRating</span>
                            <span class="text-gray-900 font-medium">${formatIRating(post.min_irating)}+</span>
                        </div>
                        <div>
                            <span class="text-gray-400 text-xs block">Min License</span>
                            <span class="px-2 py-0.5 rounded text-xs font-medium ${getLicenseClass(post.min_license_level)}">
                                ${formatLicenseLevel(post.min_license_level)}+
                            </span>
                        </div>
                        <div>
                            <span class="text-gray-400 text-xs block">Slots</span>
                            <span class="text-gray-900 font-medium">${post.slots_total}</span>
                        </div>
                        <div>
                            <span class="text-gray-400 text-xs block">Timezone</span>
                            <span class="text-gray-900 font-medium">${post.timezone || 'UTC'}</span>
                        </div>
                    </div>

                    <!-- Racing details -->
                    <div class="space-y-2 mb-6">
                        ${included.series ? `
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400 w-24">Series:</span>
                                <span class="text-gray-900">${escapeHtml(included.series.name)}</span>
                            </div>
                        ` : ''}
                        ${included.track ? `
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400 w-24">Track:</span>
                                <span class="text-gray-900">${escapeHtml(included.track.name)}</span>
                            </div>
                        ` : ''}
                        ${included.car_class ? `
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400 w-24">Car Class:</span>
                                <span class="text-gray-900">${escapeHtml(included.car_class.name)}</span>
                            </div>
                        ` : ''}
                        ${included.cars?.length ? `
                            <div class="flex items-start gap-2">
                                <span class="text-gray-400 w-24">Cars:</span>
                                <span class="text-gray-900">${included.cars.map(c => escapeHtml(c.name)).join(', ')}</span>
                            </div>
                        ` : ''}
                        ${included.event ? `
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400 w-24">Event:</span>
                                <span class="text-gray-900">${escapeHtml(included.event.name)}</span>
                            </div>
                        ` : ''}
                        ${post.event_start_at ? `
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400 w-24">Event Start:</span>
                                <span class="text-gray-900">${formatDateTime(post.event_start_at)}</span>
                            </div>
                        ` : ''}
                        ${included.languages?.length ? `
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400 w-24">Languages:</span>
                                <span class="text-gray-900">${included.languages.map(l => escapeHtml(l.name)).join(', ')}</span>
                            </div>
                        ` : ''}
                        ${post.contact_hint ? `
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400 w-24">Contact:</span>
                                <span class="text-gray-900">${escapeHtml(post.contact_hint)}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3 pt-4 border-t border-gray-200">
                        ${isOwner ? `
                            <a href="#/posts/${post.id}/edit" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
                                Edit Post
                            </a>
                            <a href="#/posts/${post.id}/applications" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
                                View Applications
                            </a>
                        ` : `
                            ${post.status === 'open' ? `
                                <button id="apply-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                                    Apply to Join
                                </button>
                            ` : ''}
                        `}
                        <a href="#/users/${post.user_id}" class="text-blue-600 hover:text-blue-700 py-2 px-4">
                            View Author Profile
                        </a>
                    </div>
                </article>

                <!-- Comments section -->
                <section class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h2 class="text-xl font-bold text-gray-900 mb-4">Comments</h2>
                    <div id="comment-form-container" class="mb-6">
                        ${renderCommentForm(postId)}
                    </div>
                    <div id="comments-list">
                        ${renderLoading('Loading comments...')}
                    </div>
                </section>
            </div>
        `;

        // Load comments
        await loadComments(postId);

        // Attach event handlers
        attachHandlers(postId, isOwner);

    } catch (error) {
        console.error('Failed to load post:', error);
        container.innerHTML = renderError('Failed to load post. Please try again.');
    }
}

async function loadComments(postId) {
    const commentsList = document.getElementById('comments-list');

    try {
        const comments = await listComments(postId);
        commentsList.innerHTML = renderCommentTree(comments, postId);
        attachCommentHandlers(postId);
    } catch (error) {
        console.error('Failed to load comments:', error);
        commentsList.innerHTML = `<p class="text-red-600">Failed to load comments.</p>`;
    }
}

function attachHandlers(postId, isOwner) {
    // Login to comment link
    const loginLink = document.getElementById('login-to-comment');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            login();
        });
    }

    // Apply button
    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            if (!isLoggedIn()) {
                toast.warning('Please log in to apply');
                login();
                return;
            }
            showApplyModal(postId);
        });
    }

    // Submit comment
    const submitCommentBtn = document.getElementById('submit-comment-btn');
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', async () => {
            const input = document.getElementById('new-comment-input');
            const body = input.value.trim();

            if (!body) {
                toast.warning('Please enter a comment');
                return;
            }

            submitCommentBtn.disabled = true;
            try {
                await createComment(postId, body);
                input.value = '';
                toast.success('Comment posted');
                await loadComments(postId);
            } catch (error) {
                console.error('Failed to post comment:', error);
                toast.error('Failed to post comment');
            } finally {
                submitCommentBtn.disabled = false;
            }
        });
    }
}

function attachCommentHandlers(postId) {
    const commentsList = document.getElementById('comments-list');

    // Reply buttons
    commentsList.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const commentId = btn.dataset.commentId;
            const replyForm = document.querySelector(`.reply-form[data-parent-id="${commentId}"]`);
            if (replyForm) {
                replyForm.classList.toggle('hidden');
                if (!replyForm.classList.contains('hidden')) {
                    replyForm.querySelector('.reply-input').focus();
                }
            }
        });
    });

    // Cancel reply buttons
    commentsList.querySelectorAll('.cancel-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const replyForm = btn.closest('.reply-form');
            if (replyForm) {
                replyForm.classList.add('hidden');
                replyForm.querySelector('.reply-input').value = '';
            }
        });
    });

    // Submit reply buttons
    commentsList.querySelectorAll('.submit-reply-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const commentId = btn.dataset.commentId;
            const replyForm = btn.closest('.reply-form');
            const input = replyForm.querySelector('.reply-input');
            const body = input.value.trim();

            if (!body) {
                toast.warning('Please enter a reply');
                return;
            }

            btn.disabled = true;
            try {
                await createReply(postId, commentId, body);
                input.value = '';
                replyForm.classList.add('hidden');
                toast.success('Reply posted');
                await loadComments(postId);
            } catch (error) {
                console.error('Failed to post reply:', error);
                toast.error('Failed to post reply');
            } finally {
                btn.disabled = false;
            }
        });
    });

    // Delete comment buttons
    commentsList.querySelectorAll('.delete-comment-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const commentId = btn.dataset.commentId;

            if (!confirm('Are you sure you want to delete this comment?')) {
                return;
            }

            btn.disabled = true;
            try {
                await deleteComment(postId, commentId);
                toast.success('Comment deleted');
                await loadComments(postId);
            } catch (error) {
                console.error('Failed to delete comment:', error);
                toast.error('Failed to delete comment');
            } finally {
                btn.disabled = false;
            }
        });
    });
}

function showApplyModal(postId) {
    const content = `
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
            </label>
            <textarea id="apply-message"
                class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400"
                rows="4" placeholder="Tell them why you'd be a great teammate..."></textarea>
            <div class="flex gap-3 mt-4">
                <button id="submit-apply" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Submit Application
                </button>
                <button id="cancel-apply" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    `;

    showModal({
        title: 'Apply to Join',
        content,
        size: 'md'
    });

    document.getElementById('submit-apply').addEventListener('click', async () => {
        const message = document.getElementById('apply-message').value.trim();
        const btn = document.getElementById('submit-apply');

        btn.disabled = true;
        btn.textContent = 'Submitting...';

        try {
            await createApplication(postId, message);
            closeModal();
            toast.success('Application submitted successfully!');
        } catch (error) {
            console.error('Failed to submit application:', error);
            if (error.status === 409) {
                toast.warning('You have already applied to this post');
            } else if (error.status === 403) {
                toast.warning('You cannot apply to your own post');
            } else {
                toast.error(error.message || 'Failed to submit application');
            }
        } finally {
            btn.disabled = false;
            btn.textContent = 'Submit Application';
        }
    });

    document.getElementById('cancel-apply').addEventListener('click', closeModal);
}
