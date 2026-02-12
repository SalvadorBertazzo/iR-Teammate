// Posts API functions
import { get, post, put, del } from './client.js';

const EXPAND_ALL = 'event,series,car_class,track,cars,languages';

export async function listPublicPosts(filters = {}) {
    const params = {
        expand: EXPAND_ALL,
        ...filters
    };
    return get('/posts', params);
}

export async function getPost(id, expand = EXPAND_ALL) {
    return get(`/posts/${id}`, { expand });
}

export async function createPost(data) {
    return post('/posts', data);
}

export async function updatePost(id, data) {
    return put(`/posts/${id}`, data);
}

export async function deletePost(id) {
    return del(`/posts/${id}`);
}

export async function updatePostStatus(id, status) {
    return put(`/posts/${id}`, { status });
}

export async function listMyPosts(filters = {}) {
    const params = {
        expand: EXPAND_ALL,
        ...filters
    };
    return get('/posts/mine', params);
}

// Build query params from filter form
export function buildPostFilters(formData) {
    const filters = {};

    if (formData.search) filters.search = formData.search;
    if (formData.category?.length) filters.category = formData.category;
    if (formData.min_irating) filters.min_irating = formData.min_irating;
    if (formData.max_irating) filters.max_irating = formData.max_irating;
    if (formData.min_license_level) filters.min_license_level = formData.min_license_level;
    if (formData.license_levels?.length) filters.license_levels = formData.license_levels;
    if (formData.series_ids?.length) filters.series_ids = formData.series_ids;
    if (formData.car_ids?.length) filters.car_ids = formData.car_ids;
    if (formData.track_ids?.length) filters.track_ids = formData.track_ids;
    if (formData.language_codes?.length) filters.language_codes = formData.language_codes;
    if (formData.status?.length) filters.status = formData.status;
    if (formData.event_start_from) filters.event_start_from = formData.event_start_from;
    if (formData.event_start_to) filters.event_start_to = formData.event_start_to;
    if (formData.sort_by) filters.sort_by = formData.sort_by;
    if (formData.sort_order) filters.sort_order = formData.sort_order;
    if (formData.limit) filters.limit = formData.limit;
    if (formData.offset) filters.offset = formData.offset;

    return filters;
}
