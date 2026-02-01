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
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
                <p class="text-gray-500 mb-6">You need to be logged in to view applications.</p>
                <a href="#/" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md">
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
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p class="text-gray-500 mb-6">You can only view applications for your own posts.</p>
                    <a href="#/posts/${postId}" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md">
                        View Post
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="mb-6">
                    <a href="#/posts/${postId}" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Back to post
                    </a>
                    <h1 class="text-2xl font-bold text-gray-900">Applications for "${escapeHtml(post.title)}"</h1>
                </div>

                <!-- Status filter -->
                <div class="flex gap-2 mb-6">
                    <button class="status-filter-btn px-4 py-2 rounded-md bg-blue-600 text-white" data-status="">
                        All
                    </button>
                    <button class="status-filter-btn px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200" data-status="pending">
                        Pending
                    </button>
                    <button class="status-filter-btn px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200" data-status="accepted">
                        Accepted
                    </button>
                    <button class="status-filter-btn px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200" data-status="rejected">
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
                    b.classList.remove('bg-blue-600', 'text-white');
                    b.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
                });
                btn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
                btn.classList.add('bg-blue-600', 'text-white');

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
