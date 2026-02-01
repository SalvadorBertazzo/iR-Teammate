// Post create page
import { isLoggedIn } from '../state.js';
import { createPost } from '../api/posts.js';
import { renderPostForm, getPostFormValues } from '../components/post-form.js';
import toast from '../components/toast.js';
import { navigate } from '../router.js';

export async function render(container) {
    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
                <p class="text-gray-500 mb-6">You need to be logged in to create a post.</p>
                <a href="#/" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md">
                    Go to Home
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="max-w-3xl mx-auto">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Create Post</h1>
            <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                ${renderPostForm()}
            </div>
        </div>
    `;

    const form = document.getElementById('post-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        try {
            const data = getPostFormValues(form);
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
