// Profile API functions
import { get, put } from './client.js';

export async function getMyProfile() {
    return get('/profile/iracing');
}

export async function getUserProfile(userId) {
    return get(`/profile/iracing/${userId}`);
}

export async function updateProfile(data) {
    return put('/profile/iracing', data);
}

export async function getLicenses() {
    return get('/profile/iracing/licenses');
}

export async function upsertLicense(data) {
    return put('/profile/iracing/licenses', data);
}

export async function getLanguages() {
    return get('/profile/iracing/languages');
}

export async function upsertLanguages(languages) {
    return put('/profile/iracing/languages', { languages });
}
