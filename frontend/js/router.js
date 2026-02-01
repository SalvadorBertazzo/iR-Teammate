// Hash-based router

const routes = [];
let notFoundHandler = null;

export function addRoute(pattern, handler) {
    // Convert :param patterns to regex
    const paramNames = [];
    const regexPattern = pattern.replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
    });

    routes.push({
        pattern: new RegExp(`^${regexPattern}$`),
        paramNames,
        handler
    });
}

export function setNotFound(handler) {
    notFoundHandler = handler;
}

export function navigate(path) {
    window.location.hash = path;
}

export function getCurrentPath() {
    return window.location.hash.slice(1) || '/';
}

export function getParams() {
    const path = getCurrentPath();
    for (const route of routes) {
        const match = path.match(route.pattern);
        if (match) {
            const params = {};
            route.paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });
            return params;
        }
    }
    return {};
}

async function handleRoute() {
    const path = getCurrentPath();
    const main = document.getElementById('main');

    for (const route of routes) {
        const match = path.match(route.pattern);
        if (match) {
            const params = {};
            route.paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });

            try {
                await route.handler(main, params);
            } catch (error) {
                console.error('Route handler error:', error);
                main.innerHTML = `
                    <div class="text-center py-12">
                        <h1 class="text-2xl font-bold text-red-500">Error</h1>
                        <p class="text-gray-400 mt-2">${error.message}</p>
                    </div>
                `;
            }
            return;
        }
    }

    // No route matched
    if (notFoundHandler) {
        await notFoundHandler(main);
    } else {
        main.innerHTML = `
            <div class="text-center py-12">
                <h1 class="text-4xl font-bold">404</h1>
                <p class="text-gray-400 mt-2">Page not found</p>
            </div>
        `;
    }
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

export function refresh() {
    handleRoute();
}
