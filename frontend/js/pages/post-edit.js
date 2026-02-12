// Post edit page
import { getUser, isLoggedIn } from '../state.js';
import { getPost, updatePost, deletePost } from '../api/posts.js';
import { loadRelationships } from '../api/catalogs.js';
import { renderPostForm, getPostFormValues } from '../components/post-form.js';
import { initContentSelector, renderContentSelector } from '../components/content-selector.js';
import { renderLoading, renderError } from '../components/loading.js';
import { showConfirm } from '../components/modal.js';
import toast from '../components/toast.js';
import { navigate } from '../router.js';

export async function render(container, params) {
    const postId = parseInt(params.id);

    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <h1 class="text-2xl font-bold text-content-primary mb-4">Login Required</h1>
                <p class="text-content-secondary mb-6">You need to be logged in to edit posts.</p>
                <a href="#/" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                    Go to Home
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = renderLoading('Loading post...');

    try {
        // Load relationships and post data in parallel
        const [post] = await Promise.all([
            getPost(postId),
            loadRelationships()
        ]);

        if (!post) {
            container.innerHTML = renderError('Post not found');
            return;
        }

        const user = getUser();
        if (user.user_id !== post.user_id) {
            container.innerHTML = `
                <div class="max-w-2xl mx-auto text-center py-12">
                    <h1 class="text-2xl font-bold text-content-primary mb-4">Access Denied</h1>
                    <p class="text-content-secondary mb-6">You can only edit your own posts.</p>
                    <a href="#/posts/${postId}" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                        View Post
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="max-w-5xl mx-auto">
                <div class="flex items-center justify-between mb-6">
                    <h1 class="text-2xl font-bold text-content-primary">Edit Post</h1>
                    <button id="delete-post-btn" class="btn-danger font-medium py-2 px-4 rounded-lg">
                        Delete Post
                    </button>
                </div>
                <div class="bg-white rounded-xl border border-surface-200 p-6 shadow-soft">
                    ${renderPostForm(post)}
                </div>
            </div>
        `;

        // Determine initial post type
        const isSpecialEvent = !!post.event_id;

        if (isSpecialEvent) {
            // Render event content selector into the wrap
            const wrap = document.getElementById('content-selector-event-wrap');
            const eventSelectorValues = {
                car_class_ids: post.car_class_ids || (post.car_class_id ? [post.car_class_id] : []),
                car_ids: post.car_ids || [],
                track_ids: post.track_ids || (post.track_id ? [post.track_id] : [])
            };
            // Rename the normal selector so the event one gets the id
            const normalCS = document.querySelector('#content-section-normal [data-mode="normal"]');
            if (normalCS) normalCS.id = 'content-selector-inactive';
            wrap.innerHTML = renderContentSelector(eventSelectorValues, 'event');
            initContentSelector();
        } else {
            // Initialize normal content selector
            initContentSelector();
        }

        // Initialize post type tab switching
        initPostTypeTabs(isSpecialEvent);

        const form = document.getElementById('post-form');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';

            try {
                const data = getPostFormValues(form);
                await updatePost(postId, data);
                toast.success('Post updated successfully!');
                navigate(`/posts/${postId}`);
            } catch (error) {
                console.error('Failed to update post:', error);
                toast.error(error.message || 'Failed to update post');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Post';
            }
        });

        // Delete button
        document.getElementById('delete-post-btn').addEventListener('click', () => {
            showConfirm({
                title: 'Delete Post',
                message: 'Are you sure you want to delete this post? This action cannot be undone.',
                confirmText: 'Delete',
                danger: true,
                onConfirm: async () => {
                    try {
                        await deletePost(postId);
                        toast.success('Post deleted successfully');
                        navigate('/my-posts');
                    } catch (error) {
                        console.error('Failed to delete post:', error);
                        toast.error(error.message || 'Failed to delete post');
                    }
                }
            });
        });

    } catch (error) {
        console.error('Failed to load post:', error);
        container.innerHTML = renderError('Failed to load post. Please try again.');
    }
}

function initPostTypeTabs(eventSelectorRendered) {
    const form = document.getElementById('post-form');
    if (!form) return;

    const tabs = form.querySelectorAll('.post-type-tab');
    const normalSection = document.getElementById('content-section-normal');
    const eventSection = document.getElementById('content-section-event');
    let eventRendered = eventSelectorRendered;

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

            if (postType === 'special_event') {
                normalSection.classList.add('hidden');
                eventSection.classList.remove('hidden');

                if (!eventRendered) {
                    const wrap = document.getElementById('content-selector-event-wrap');
                    const normalCS = normalSection.querySelector('[data-mode="normal"]');
                    if (normalCS) normalCS.id = 'content-selector-inactive';
                    wrap.innerHTML = renderContentSelector({}, 'event');
                    initContentSelector();
                    eventRendered = true;
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
