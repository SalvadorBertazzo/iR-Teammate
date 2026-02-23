// Post detail page
import { getPost, updatePostStatus } from '../api/posts.js';
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

        // Normalise multi-select fields
        const categories = post.categories?.length ? post.categories : (post.category ? [post.category] : []);
        const series     = included.all_series || (included.series ? [included.series] : []);
        const tracks     = included.tracks     || (included.track  ? [included.track]  : []);
        const carClasses = included.car_classes || (included.car_class ? [included.car_class] : []);
        const cars       = included.cars       || [];
        const languages  = included.languages  || [];

        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Back button -->
                <a href="#/" class="inline-flex items-center gap-2 text-content-secondary hover:text-brand-600 mb-6 transition-colors text-sm font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back to posts
                </a>

                <!-- Post article -->
                <article class="bg-white rounded-xl border border-surface-200 shadow-soft mb-6 overflow-hidden">

                    <!-- Header bar -->
                    <div class="px-6 pt-5 pb-4 border-b border-surface-100">
                        <div class="flex flex-wrap items-center gap-2 mb-3">
                            ${categories.map(cat => `
                                <span class="px-2.5 py-1 rounded-md text-xs font-semibold ${getCategoryClass(cat)}">${formatCategory(cat)}</span>
                            `).join('')}
                            ${included.event ? `<span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">Special Event</span>` : ''}
                            <span data-status-badge class="px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusClass(post.status)}">${formatStatus(post.status)}</span>
                            <span class="text-content-muted text-xs ml-auto">Posted ${formatRelativeTime(post.created_at)}</span>
                        </div>
                        <h1 class="text-2xl font-bold text-content-primary leading-snug">${escapeHtml(post.title)}</h1>
                    </div>

                    <!-- Body -->
                    <div class="px-6 py-5 border-b border-surface-100">
                        <p class="text-content-secondary leading-relaxed whitespace-pre-wrap">${escapeHtml(post.body)}</p>
                    </div>

                    <!-- All details -->
                    <div class="px-6 py-5 border-b border-surface-100">
                        <h2 class="text-xs font-semibold text-content-muted uppercase tracking-wider mb-4">Racing Context</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Min iRating</span>
                                    <span class="text-sm text-brand-600 font-bold tabular-nums">${formatIRating(post.min_irating)}+</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Min License</span>
                                    <span class="px-2.5 py-1 rounded-md text-xs font-bold ${getLicenseClass(post.min_license_level)}">${formatLicenseLevel(post.min_license_level)}+</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Open Slots</span>
                                    <span class="text-sm text-content-primary font-bold">${post.slots_total}</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Timezone</span>
                                    <span class="text-sm text-content-primary font-medium">${escapeHtml(post.timezone || 'UTC')}</span>
                                </div>
                            </div>

                            ${series.length > 0 ? `
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Series</span>
                                    <span class="text-sm text-content-primary font-medium">${series.map(s => escapeHtml(s.name)).join(', ')}</span>
                                </div>
                            </div>
                            ` : ''}

                            ${carClasses.length > 0 ? `
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Car Class</span>
                                    <span class="text-sm text-content-primary font-medium">${carClasses.map(c => escapeHtml(c.name)).join(', ')}</span>
                                </div>
                            </div>
                            ` : ''}

                            ${cars.length > 0 ? `
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Car</span>
                                    <span class="text-sm text-content-primary font-medium">${cars.map(c => escapeHtml(c.name)).join(', ')}</span>
                                </div>
                            </div>
                            ` : ''}

                            ${tracks.length > 0 ? `
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Track</span>
                                    <span class="text-sm text-content-primary font-medium">${tracks.map(t => escapeHtml(t.name)).join(', ')}</span>
                                </div>
                            </div>
                            ` : ''}

                            ${included.event ? `
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Special Event</span>
                                    <span class="text-sm text-purple-700 font-medium">${escapeHtml(included.event.name)}</span>
                                </div>
                            </div>
                            ` : ''}

                            ${post.event_start_at ? `
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Event Start</span>
                                    <span class="text-sm text-amber-600 font-medium">${formatDateTime(post.event_start_at)}</span>
                                </div>
                            </div>
                            ` : ''}

                            ${languages.length > 0 ? `
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-surface-50 border border-surface-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Languages</span>
                                    <div class="flex flex-wrap gap-1 mt-1">
                                        ${languages.map(l => `<span class="px-2 py-0.5 rounded text-xs font-medium bg-surface-100 text-content-secondary border border-surface-200">${escapeHtml(l.name)}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                            ` : ''}

                            ${post.contact_hint ? `
                            <div class="flex items-start gap-3">
                                <div class="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                    </svg>
                                </div>
                                <div class="min-w-0">
                                    <span class="text-xs text-content-muted block mb-0.5">Contact</span>
                                    <span class="text-sm text-brand-600 font-medium">${escapeHtml(post.contact_hint)}</span>
                                </div>
                            </div>
                            ` : ''}

                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="px-6 py-4 flex flex-wrap items-center gap-3">
                        ${isOwner ? `
                            <select id="status-select" class="form-input rounded-lg px-3 py-2 text-sm">
                                <option value="open"      ${post.status === 'open'      ? 'selected' : ''}>Open</option>
                                <option value="closed"    ${post.status === 'closed'    ? 'selected' : ''}>Closed</option>
                                <option value="filled"    ${post.status === 'filled'    ? 'selected' : ''}>Filled</option>
                                <option value="cancelled" ${post.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                            <a href="#/posts/${post.id}/edit" class="btn-secondary text-sm font-medium py-2 px-4 rounded-lg">Edit Post</a>
                            <a href="#/posts/${post.id}/applications" class="btn-secondary text-sm font-medium py-2 px-4 rounded-lg">View Applications</a>
                        ` : `
                            ${post.status === 'open' ? `
                                <button id="apply-btn" class="btn-primary text-sm font-medium py-2 px-5 rounded-lg">Apply to Join</button>
                            ` : ''}
                            <a href="#/users/${post.user_id}" class="text-sm text-brand-600 hover:text-brand-700 py-2 px-4 transition-colors font-medium">View Author Profile</a>
                        `}
                    </div>
                </article>

                <!-- Comments section -->
                <section class="bg-white rounded-xl border border-surface-200 p-6 shadow-soft">
                    <h2 class="text-xl font-bold text-content-primary mb-4">Comments</h2>
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
        commentsList.innerHTML = `<p class="text-red-500">Failed to load comments.</p>`;
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

    // Status dropdown for owner
    const statusSelect = document.getElementById('status-select');
    if (statusSelect) {
        statusSelect.addEventListener('change', async () => {
            const newStatus = statusSelect.value;
            try {
                await updatePostStatus(postId, newStatus);
                toast.success(`Status changed to ${newStatus}`);
                // Update the status badge in the header
                const statusBadge = document.querySelector('[data-status-badge]');
                if (statusBadge) {
                    statusBadge.className = `px-2.5 py-1 rounded-md text-xs font-medium ${getStatusClass(newStatus)}`;
                    statusBadge.textContent = formatStatus(newStatus);
                }
            } catch (error) {
                console.error('Failed to update status:', error);
                toast.error(error.message || 'Failed to update status');
            }
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
            <label class="block text-sm font-medium text-content-secondary mb-2">
                Message (optional)
            </label>
            <textarea id="apply-message"
                class="w-full form-input rounded-lg px-3 py-2"
                rows="4" placeholder="Tell them why you'd be a great teammate..."></textarea>
            <div class="flex gap-3 mt-4">
                <button id="submit-apply" class="flex-1 btn-primary font-medium py-2 px-4 rounded-lg">
                    Submit Application
                </button>
                <button id="cancel-apply" class="btn-secondary font-medium py-2 px-4 rounded-lg">
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
