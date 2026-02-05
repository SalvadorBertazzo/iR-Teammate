// 404 Not Found page

export async function render(container) {
    container.innerHTML = `
        <div class="max-w-2xl mx-auto text-center py-16">
            <h1 class="text-6xl font-bold text-brand-600 mb-4">404</h1>
            <h2 class="text-2xl font-bold text-content-primary mb-4">Page Not Found</h2>
            <p class="text-content-secondary mb-8">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <a href="#/" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                Go to Home
            </a>
        </div>
    `;
}
