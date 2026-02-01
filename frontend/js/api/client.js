// Fetch wrapper with credentials and error handling

const API_BASE = '';

async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    const config = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    // Stringify body if it's an object
    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    // Handle no content responses
    if (response.status === 204) {
        return null;
    }

    // Parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
        const error = new Error(data?.error || data || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

export function get(endpoint, params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                searchParams.set(key, value.join(','));
            } else {
                searchParams.set(key, value);
            }
        }
    });

    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return request(url, { method: 'GET' });
}

export function post(endpoint, body) {
    return request(endpoint, { method: 'POST', body });
}

export function put(endpoint, body) {
    return request(endpoint, { method: 'PUT', body });
}

export function patch(endpoint, body) {
    return request(endpoint, { method: 'PATCH', body });
}

export function del(endpoint) {
    return request(endpoint, { method: 'DELETE' });
}

export default { get, post, put, patch, del };
