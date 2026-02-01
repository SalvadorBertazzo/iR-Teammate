// Post edit page
import { getUser, isLoggedIn } from '../state.js';
import { getPost, updatePost, deletePost } from '../api/posts.js';
import { renderPostForm, getPostFormValues } from '../components/post-form.js';
import { renderLoading, renderError } from '../components/loading.js';
import { showConfirm } from '../components/modal.js';
import toast from '../components/toast.js';
import { navigate } from '../router.js';

export async function render(container, params) {
    const postId = parseInt(params.id);

    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
                <p class="text-gray-500 mb-6">You need to be logged in to edit posts.</p>
                <a href="#/" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md">
                    Go to Home
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = renderLoading('Loading post...');

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
                    <p class="text-gray-500 mb-6">You can only edit your own posts.</p>
                    <a href="#/posts/${postId}" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md">
                        View Post
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="max-w-3xl mx-auto">
                <div class="flex items-center justify-between mb-6">
                    <h1 class="text-2xl font-bold text-gray-900">Edit Post</h1>
                    <button id="delete-post-btn" class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                        Delete Post
                    </button>
                </div>
                <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    ${renderPostForm(post)}
                </div>
            </div>
        `;

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
