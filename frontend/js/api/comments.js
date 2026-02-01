// Comments API functions
import { get, post, del } from './client.js';

export async function listComments(postId) {
    return get(`/posts/${postId}/comments`, {
        expand: 'user,replies'
    });
}

export async function createComment(postId, body) {
    return post(`/posts/${postId}/comments`, { body });
}

export async function createReply(postId, commentId, body) {
    return post(`/posts/${postId}/comments/${commentId}/replies`, { body });
}

export async function deleteComment(postId, commentId) {
    return del(`/posts/${postId}/comments/${commentId}`);
}
