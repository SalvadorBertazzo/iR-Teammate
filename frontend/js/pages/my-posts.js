// My posts page
import { isLoggedIn } from '../state.js';
import { listMyPosts } from '../api/posts.js';
import { renderPostCard, attachPostCardListeners } from '../components/post-card.js';
import { renderLoading, renderError, renderEmpty } from '../components/loading.js';

export async function render(container) {
    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <h1 class="text-2xl font-bold text-content-primary mb-4">Login Required</h1>
                <p class="text-content-secondary mb-6">You need to be logged in to view your posts.</p>
                <a href="#/" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                    Go to Home
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-bold text-content-primary">My Posts</h1>
                <a href="#/posts/create" class="btn-primary font-medium py-2 px-4 rounded-lg">
                    Create New Post
                </a>
            </div>

            <!-- Status filter -->
            <div class="flex flex-wrap gap-2 mb-6">
                <button class="status-filter-btn px-4 py-2 rounded-md btn-primary" data-status="">
                    All
                </button>
                <button class="status-filter-btn px-4 py-2 rounded-md btn-secondary" data-status="open">
                    Open
                </button>
                <button class="status-filter-btn px-4 py-2 rounded-md btn-secondary" data-status="closed">
                    Closed
                </button>
                <button class="status-filter-btn px-4 py-2 rounded-md btn-secondary" data-status="filled">
                    Filled
                </button>
            </div>

            <div id="posts-list" class="space-y-4">
                ${renderLoading('Loading your posts...')}
            </div>
        </div>
    `;

    const postsList = document.getElementById('posts-list');
    let currentStatus = '';

    async function loadPosts(status = '') {
        postsList.innerHTML = renderLoading('Loading posts...');

        try {
            const filters = {};
            if (status) {
                filters.status = [status];
            }

            const response = await listMyPosts(filters);
            const posts = response.posts || [];

            if (posts.length === 0) {
                postsList.innerHTML = renderEmpty(
                    status ? `No ${status} posts found.` : 'You haven\'t created any posts yet.',
                    'Create Your First Post',
                    '#/posts/create'
                );
                return;
            }

            postsList.innerHTML = posts.map(post => `
                <div class="relative">
                    ${renderPostCard(post)}
                    <div class="absolute top-4 right-4 flex gap-2">
                        <a href="#/posts/${post.id}/edit" class="bg-white hover:bg-surface-50 text-content-secondary hover:text-brand-600 text-sm px-3 py-1 rounded-lg border border-surface-200 z-10 transition-colors shadow-soft"
                            onclick="event.stopPropagation()">
                            Edit
                        </a>
                        <a href="#/posts/${post.id}/applications" class="bg-white hover:bg-surface-50 text-content-secondary hover:text-brand-600 text-sm px-3 py-1 rounded-lg border border-surface-200 z-10 transition-colors shadow-soft"
                            onclick="event.stopPropagation()">
                            Applications
                        </a>
                    </div>
                </div>
            `).join('');

            attachPostCardListeners(postsList);
        } catch (error) {
            console.error('Failed to load posts:', error);
            postsList.innerHTML = renderError('Failed to load posts. Please try again.');
        }
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
            await loadPosts(currentStatus);
        });
    });

    // Initial load
    await loadPosts();
}
