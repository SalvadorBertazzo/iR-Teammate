// My posts page
import { isLoggedIn } from '../state.js';
import { listMyPosts } from '../api/posts.js';
import { renderPostCard, attachPostCardListeners } from '../components/post-card.js';
import { renderLoading, renderError, renderEmpty } from '../components/loading.js';

export async function render(container) {
    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
                <p class="text-gray-500 mb-6">You need to be logged in to view your posts.</p>
                <a href="#/" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md">
                    Go to Home
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-bold text-gray-900">My Posts</h1>
                <a href="#/posts/create" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Create New Post
                </a>
            </div>

            <!-- Status filter -->
            <div class="flex gap-2 mb-6">
                <button class="status-filter-btn px-4 py-2 rounded-md bg-blue-600 text-white" data-status="">
                    All
                </button>
                <button class="status-filter-btn px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200" data-status="open">
                    Open
                </button>
                <button class="status-filter-btn px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200" data-status="closed">
                    Closed
                </button>
                <button class="status-filter-btn px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200" data-status="filled">
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
                        <a href="#/posts/${post.id}/edit" class="bg-white hover:bg-gray-50 text-gray-700 text-sm px-3 py-1 rounded-md border border-gray-200 shadow-sm z-10"
                            onclick="event.stopPropagation()">
                            Edit
                        </a>
                        <a href="#/posts/${post.id}/applications" class="bg-white hover:bg-gray-50 text-gray-700 text-sm px-3 py-1 rounded-md border border-gray-200 shadow-sm z-10"
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
                b.classList.remove('bg-blue-600', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
            btn.classList.add('bg-blue-600', 'text-white');

            currentStatus = btn.dataset.status;
            await loadPosts(currentStatus);
        });
    });

    // Initial load
    await loadPosts();
}
