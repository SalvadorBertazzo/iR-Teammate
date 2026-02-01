// Home page - List public posts
import { listPublicPosts } from '../api/posts.js';
import { renderPostCard, attachPostCardListeners } from '../components/post-card.js';
import { renderFilterPanel, getFilterValues } from '../components/filter-panel.js';
import { renderLoading, renderError, renderEmpty } from '../components/loading.js';

let currentFilters = {};

export async function render(container) {
    container.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-6">
            <main class="flex-1 order-2 lg:order-1">
                <div class="flex items-center justify-between mb-4">
                    <h1 class="text-2xl font-bold text-gray-900">Find Teammates</h1>
                    <div id="results-count" class="text-gray-500"></div>
                </div>
                <!-- Search bar -->
                <div class="mb-6">
                    <div class="relative">
                        <input type="text" id="search-input"
                            class="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pl-10 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Search posts...">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </div>
                </div>
                <div id="posts-list" class="space-y-4"></div>
                <div id="pagination" class="mt-6"></div>
            </main>
            <aside class="lg:w-72 flex-shrink-0 order-1 lg:order-2 lg:h-[calc(100vh-6rem)] lg:sticky lg:top-20">
                <div id="filter-panel" class="h-full"></div>
            </aside>
        </div>
    `;

    const filterPanel = document.getElementById('filter-panel');
    const postsList = document.getElementById('posts-list');
    const resultsCount = document.getElementById('results-count');
    const pagination = document.getElementById('pagination');
    const searchInput = document.getElementById('search-input');

    // Set initial search value if exists
    if (currentFilters.search) {
        searchInput.value = currentFilters.search;
    }

    // Render filter panel
    filterPanel.innerHTML = renderFilterPanel(currentFilters);

    // Attach filter handlers
    attachFilterHandlers();

    // Search on Enter key
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const filterForm = document.getElementById('filter-form');
            currentFilters = getFilterValues(filterForm, searchInput);
            currentFilters.offset = 0;
            await loadPosts();
        }
    });

    function attachFilterHandlers() {
        const filterForm = document.getElementById('filter-form');
        filterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            currentFilters = getFilterValues(filterForm, searchInput);
            currentFilters.offset = 0;
            await loadPosts();
        });

        const clearFiltersBtn = document.getElementById('clear-filters');
        clearFiltersBtn.addEventListener('click', async () => {
            currentFilters = {};
            searchInput.value = '';
            filterPanel.innerHTML = renderFilterPanel({});
            attachFilterHandlers();
            await loadPosts();
        });
    }

    async function loadPosts() {
        postsList.innerHTML = renderLoading('Loading posts...');

        try {
            const response = await listPublicPosts(currentFilters);
            const posts = response.posts || [];
            const total = response.total || 0;

            resultsCount.textContent = `${total} post${total !== 1 ? 's' : ''} found`;

            if (posts.length === 0) {
                postsList.innerHTML = renderEmpty(
                    'No posts found matching your criteria.',
                    'Create a Post',
                    '#/posts/create'
                );
                pagination.innerHTML = '';
                return;
            }

            postsList.innerHTML = posts.map(post => renderPostCard(post)).join('');
            attachPostCardListeners(postsList);

            // Render pagination
            renderPagination(response);
        } catch (error) {
            console.error('Failed to load posts:', error);
            postsList.innerHTML = renderError('Failed to load posts. Please try again.');
            const retryBtn = document.getElementById('retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', loadPosts);
            }
        }
    }

    function renderPagination(response) {
        const { total, limit, offset } = response;
        const totalPages = Math.ceil(total / (limit || 20));
        const currentPage = Math.floor((offset || 0) / (limit || 20)) + 1;

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        pagination.innerHTML = `
            <div class="flex items-center justify-center gap-2">
                <button class="pagination-btn px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
                    Previous
                </button>
                ${pages.map(page => {
                    if (page === '...') {
                        return '<span class="px-2 text-gray-400">...</span>';
                    }
                    const isActive = page === currentPage;
                    return `
                        <button class="pagination-btn px-3 py-1 rounded ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                            data-page="${page}" ${isActive ? 'disabled' : ''}>
                            ${page}
                        </button>
                    `;
                }).join('')}
                <button class="pagination-btn px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
                    Next
                </button>
            </div>
        `;

        pagination.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= totalPages) {
                    currentFilters.offset = (page - 1) * (limit || 20);
                    await loadPosts();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    // Initial load
    await loadPosts();
}
