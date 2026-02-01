// Applications API functions
import { get, post, patch } from './client.js';

export async function createApplication(postId, message) {
    return post(`/posts/${postId}/applications`, { message });
}

export async function getApplication(postId, applicationId) {
    return get(`/posts/${postId}/applications/${applicationId}`, {
        expand: 'applicant,post'
    });
}

export async function listPostApplications(postId, status = null) {
    const params = { expand: 'applicant' };
    if (status) params.status = status;
    return get(`/posts/${postId}/applications`, params);
}

export async function listMyApplications() {
    return get('/applications/mine', { expand: 'post' });
}

export async function updateApplicationStatus(postId, applicationId, status) {
    return patch(`/posts/${postId}/applications/${applicationId}/status`, { status });
}

export async function getApplicationCount(postId, status) {
    return get(`/posts/${postId}/applications/count`, { status });
}
