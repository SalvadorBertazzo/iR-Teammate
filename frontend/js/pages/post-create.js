// Post create page
import { isLoggedIn } from '../state.js';
import { createPost } from '../api/posts.js';
import { loadRelationships } from '../api/catalogs.js';
import { renderPostForm, getPostFormValues } from '../components/post-form.js';
import { initContentSelector, renderContentSelector } from '../components/content-selector.js';
import toast from '../components/toast.js';
import { navigate } from '../router.js';

export async function render(container) {
    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <h1 class="text-2xl font-bold text-content-primary mb-4">Login Required</h1>
                <p class="text-content-secondary mb-6">You need to be logged in to create a post.</p>
                <a href="#/" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                    Go to Home
                </a>
            </div>
        `;
        return;
    }

    // Load relationships before rendering the form
    await loadRelationships();

    container.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <h1 class="text-2xl font-bold text-content-primary mb-6">Create Post</h1>
            <div class="bg-white rounded-xl border border-surface-200 p-6 shadow-soft">
                ${renderPostForm()}
            </div>
        </div>
    `;

    // Initialize content selector for the active tab (normal by default)
    initContentSelector();

    // Initialize post type tab switching
    initPostTypeTabs();

    const form = document.getElementById('post-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        try {
            const data = getPostFormValues(form);
            data.status = 'open';
            const post = await createPost(data);
            toast.success('Post created successfully!');
            navigate(`/posts/${post.id}`);
        } catch (error) {
            console.error('Failed to create post:', error);
            toast.error(error.message || 'Failed to create post');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Post';
        }
    });
}

function initPostTypeTabs() {
    const form = document.getElementById('post-form');
    if (!form) return;

    const tabs = form.querySelectorAll('.post-type-tab');
    const normalSection = document.getElementById('content-section-normal');
    const eventSection = document.getElementById('content-section-event');
    let eventSelectorRendered = false;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const postType = tab.dataset.postType;
            form.dataset.postType = postType;

            // Update tab styles
            tabs.forEach(t => {
                if (t.dataset.postType === postType) {
                    t.className = 'post-type-tab px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-brand-600 text-white';
                } else {
                    t.className = 'post-type-tab px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-surface-100 text-content-secondary hover:bg-surface-200';
                }
            });

            // Show/hide sections and swap the content-selector id so
            // getContentSelectorValues() always reads the visible one
            if (postType === 'special_event') {
                normalSection.classList.add('hidden');
                eventSection.classList.remove('hidden');

                // Render event content selector on first switch
                if (!eventSelectorRendered) {
                    const wrap = document.getElementById('content-selector-event-wrap');
                    wrap.innerHTML = renderContentSelector({}, 'event');
                    // The new element has id="content-selector" from render,
                    // rename the normal one first
                    const normalCS = normalSection.querySelector('[data-mode="normal"]');
                    if (normalCS) normalCS.id = 'content-selector-inactive';
                    initContentSelector();
                    eventSelectorRendered = true;
                } else {
                    const normalCS = normalSection.querySelector('[data-mode="normal"]');
                    const eventCS = eventSection.querySelector('[data-mode="event"]');
                    if (normalCS) normalCS.id = 'content-selector-inactive';
                    if (eventCS) eventCS.id = 'content-selector';
                }
            } else {
                normalSection.classList.remove('hidden');
                eventSection.classList.add('hidden');

                const normalCS = normalSection.querySelector('[data-mode="normal"]');
                const eventCS = eventSection.querySelector('[data-mode="event"]');
                if (normalCS) normalCS.id = 'content-selector';
                if (eventCS) eventCS.id = 'content-selector-inactive';
            }
        });
    });
}
