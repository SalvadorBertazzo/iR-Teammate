// Theme management — persists to localStorage, applies data-theme on <html>

const STORAGE_KEY = 'ir-teammate-theme';

export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) || 'light';
    document.documentElement.dataset.theme = saved;
}

export function toggleTheme() {
    const current = document.documentElement.dataset.theme || 'light';
    const next = current === 'dark' ? 'light' : 'dark';

    // Add transition class for smooth color switch
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_KEY, next);
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 300);

    return next;
}

export function isDarkMode() {
    return (document.documentElement.dataset.theme || 'light') === 'dark';
}
