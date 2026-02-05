// Post applications page - view applications for a post (owner only)
import { getUser, isLoggedIn } from '../state.js';
import { getPost } from '../api/posts.js';
import { listPostApplications, updateApplicationStatus } from '../api/applications.js';
import { renderApplicationCard } from '../components/application-card.js';
import { renderLoading, renderError, renderEmpty } from '../components/loading.js';
import toast from '../components/toast.js';
import { escapeHtml } from '../utils/dom.js';

export async function render(container, params) {
    const postId = parseInt(params.id);

    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <h1 class="text-2xl font-bold text-content-primary mb-4">Login Required</h1>
                <p class="text-content-secondary mb-6">You need to be logged in to view applications.</p>
                <a href="#/" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                    Go to Home
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = renderLoading('Loading...');

    try {
        const post = await getPost(postId);

        if (!post) {
            container.innerHTML = renderError('Post not found');
            return;
        }

        const user = getUser();
        if (user.user_id !== post.user_id) {
            container.innerHTML = `
                <div class="max-w-2xl mx-auto text-center py-12">
                    <h1 class="text-2xl font-bold text-content-primary mb-4">Access Denied</h1>
                    <p class="text-content-secondary mb-6">You can only view applications for your own posts.</p>
                    <a href="#/posts/${postId}" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                        View Post
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="mb-6">
                    <a href="#/posts/${postId}" class="inline-flex items-center gap-2 text-content-secondary hover:text-brand-600 mb-4 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Back to post
                    </a>
                    <h1 class="text-2xl font-bold text-content-primary">Applications for "${escapeHtml(post.title)}"</h1>
                </div>

                <!-- Status filter -->
                <div class="flex flex-wrap gap-2 mb-6">
                    <button class="status-filter-btn px-4 py-2 rounded-md btn-primary" data-status="">
                        All
                    </button>
                    <button class="status-filter-btn px-4 py-2 rounded-md btn-secondary" data-status="pending">
                        Pending
                    </button>
                    <button class="status-filter-btn px-4 py-2 rounded-md btn-secondary" data-status="accepted">
                        Accepted
                    </button>
                    <button class="status-filter-btn px-4 py-2 rounded-md btn-secondary" data-status="rejected">
                        Rejected
                    </button>
                </div>

                <div id="applications-list" class="space-y-4">
                    ${renderLoading('Loading applications...')}
                </div>
            </div>
        `;

        const applicationsList = document.getElementById('applications-list');
        let currentStatus = '';

        async function loadApplications(status = null) {
            applicationsList.innerHTML = renderLoading('Loading applications...');

            try {
                const applications = await listPostApplications(postId, status);

                if (!applications || applications.length === 0) {
                    applicationsList.innerHTML = renderEmpty(
                        status ? `No ${status} applications.` : 'No applications yet.'
                    );
                    return;
                }

                applicationsList.innerHTML = applications
                    .map(app => renderApplicationCard(app, false, true))
                    .join('');

                attachApplicationHandlers(postId);
            } catch (error) {
                console.error('Failed to load applications:', error);
                applicationsList.innerHTML = renderError('Failed to load applications.');
            }
        }

        function attachApplicationHandlers(postId) {
            // Accept buttons
            applicationsList.querySelectorAll('.accept-application-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const applicationId = btn.dataset.applicationId;
                    btn.disabled = true;

                    try {
                        await updateApplicationStatus(postId, applicationId, 'accepted');
                        toast.success('Application accepted');
                        await loadApplications(currentStatus || null);
                    } catch (error) {
                        console.error('Failed to accept application:', error);
                        toast.error('Failed to accept application');
                        btn.disabled = false;
                    }
                });
            });

            // Reject buttons
            applicationsList.querySelectorAll('.reject-application-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const applicationId = btn.dataset.applicationId;
                    btn.disabled = true;

                    try {
                        await updateApplicationStatus(postId, applicationId, 'rejected');
                        toast.success('Application rejected');
                        await loadApplications(currentStatus || null);
                    } catch (error) {
                        console.error('Failed to reject application:', error);
                        toast.error('Failed to reject application');
                        btn.disabled = false;
                    }
                });
            });
        }

        // Status filter buttons
        document.querySelectorAll('.status-filter-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                // Update active state
                document.querySelectorAll('.status-filter-btn').forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-secondary');
                });
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');

                currentStatus = btn.dataset.status;
                await loadApplications(currentStatus || null);
            });
        });

        // Initial load
        await loadApplications();

    } catch (error) {
        console.error('Failed to load post:', error);
        container.innerHTML = renderError('Failed to load post. Please try again.');
    }
}
