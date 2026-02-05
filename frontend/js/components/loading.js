// Loading component

export function renderLoading(text = 'Loading...') {
    return `
        <div class="flex flex-col items-center justify-center py-12">
            <div class="spinner spinner-lg mb-4"></div>
            <p class="text-content-muted text-sm">${text}</p>
        </div>
    `;
}

export function renderLoadingInline() {
    return `<div class="spinner inline-block"></div>`;
}

export function renderError(message, retryCallback = null) {
    return `
        <div class="flex flex-col items-center justify-center py-12">
            <svg class="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p class="text-content-secondary mb-4">${message}</p>
            ${retryCallback ? `
                <button id="retry-btn" class="btn-secondary px-4 py-2 rounded-lg text-sm">
                    Try Again
                </button>
            ` : ''}
        </div>
    `;
}

export function renderEmpty(message, actionText = null, actionHref = null) {
    return `
        <div class="flex flex-col items-center justify-center py-12">
            <svg class="w-12 h-12 text-surface-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <p class="text-content-muted mb-4">${message}</p>
            ${actionText && actionHref ? `
                <a href="${actionHref}" class="btn-primary px-4 py-2 rounded-lg text-sm">
                    ${actionText}
                </a>
            ` : ''}
        </div>
    `;
}
