// Simple pub/sub state management

const state = {
    user: null,
    catalogs: {
        series: [],
        carClasses: [],
        cars: [],
        events: [],
        tracks: [],
        languages: [],
        loaded: false
    }
};

const listeners = new Map();

export function getState() {
    return state;
}

export function setState(key, value) {
    if (key.includes('.')) {
        const keys = key.split('.');
        let obj = state;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
    } else {
        state[key] = value;
    }
    notify(key);
}

export function subscribe(key, callback) {
    if (!listeners.has(key)) {
        listeners.set(key, new Set());
    }
    listeners.get(key).add(callback);
    return () => listeners.get(key).delete(callback);
}

function notify(key) {
    // Notify exact key listeners
    if (listeners.has(key)) {
        listeners.get(key).forEach(cb => cb(state));
    }
    // Notify parent key listeners (e.g., 'catalogs' when 'catalogs.series' changes)
    const parentKey = key.split('.')[0];
    if (parentKey !== key && listeners.has(parentKey)) {
        listeners.get(parentKey).forEach(cb => cb(state));
    }
    // Notify global listeners
    if (listeners.has('*')) {
        listeners.get('*').forEach(cb => cb(state));
    }
}

export function getUser() {
    return state.user;
}

export function setUser(user) {
    setState('user', user);
}

export function isLoggedIn() {
    return state.user !== null;
}

export function getCatalogs() {
    return state.catalogs;
}

export function setCatalogs(catalogs) {
    state.catalogs = { ...catalogs, loaded: true };
    notify('catalogs');
}

// Helper to find catalog item by ID
export function findInCatalog(catalogName, id) {
    const catalog = state.catalogs[catalogName];
    if (!catalog) return null;
    return catalog.find(item => item.id === id);
}
