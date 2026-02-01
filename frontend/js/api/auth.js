// Auth API functions
import { get, post } from './client.js';
import { setUser } from '../state.js';

export async function getMe() {
    try {
        const user = await get('/auth/me');
        setUser(user);
        return user;
    } catch (error) {
        if (error.status === 401) {
            setUser(null);
            return null;
        }
        throw error;
    }
}

export function login() {
    // Redirect to Discord OAuth
    window.location.href = '/auth/discord/login';
}

export async function logout() {
    try {
        await post('/auth/logout');
    } catch (error) {
        // Ignore logout errors
        console.error('Logout error:', error);
    }
    setUser(null);
    window.location.hash = '/';
}
