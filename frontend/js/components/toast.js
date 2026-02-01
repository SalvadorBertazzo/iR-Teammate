// Toast notification component

const TOAST_DURATION = 4000;

export function showToast(options) {
    const { message, type = 'info', duration = TOAST_DURATION } = options;

    const container = document.getElementById('toast-container');

    const typeStyles = {
        success: 'bg-green-600 border-green-500',
        error: 'bg-red-600 border-red-500',
        warning: 'bg-yellow-600 border-yellow-500',
        info: 'bg-blue-600 border-blue-500'
    };

    const icons = {
        success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>`,
        error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>`,
        warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>`,
        info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`
    };

    const toast = document.createElement('div');
    toast.className = `toast-enter flex items-center gap-3 px-4 py-3 rounded-lg border text-white shadow-lg ${typeStyles[type]}`;
    toast.innerHTML = `
        ${icons[type]}
        <span class="flex-1">${message}</span>
        <button class="toast-close hover:opacity-75">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    const remove = () => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', remove);

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(remove, duration);
    }

    return { remove };
}

export function success(message, duration) {
    return showToast({ message, type: 'success', duration });
}

export function error(message, duration) {
    return showToast({ message, type: 'error', duration });
}

export function warning(message, duration) {
    return showToast({ message, type: 'warning', duration });
}

export function info(message, duration) {
    return showToast({ message, type: 'info', duration });
}

export default { showToast, success, error, warning, info };
