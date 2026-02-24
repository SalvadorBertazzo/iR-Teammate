// Main app bootstrap
import { addRoute, setNotFound, initRouter } from './router.js';
import { getMe } from './api/auth.js';
import { loadCatalogs } from './api/catalogs.js';
import { renderNavbar } from './components/navbar.js';
import { renderLoading } from './components/loading.js';
import { initTheme } from './utils/theme.js';

// Import pages
import * as landingPage from './pages/landing.js';
import * as homePage from './pages/home.js';
import * as postDetailPage from './pages/post-detail.js';
import * as postCreatePage from './pages/post-create.js';
import * as postEditPage from './pages/post-edit.js';
import * as myPostsPage from './pages/my-posts.js';
import * as myApplicationsPage from './pages/my-applications.js';
import * as postApplicationsPage from './pages/post-applications.js';
import * as profilePage from './pages/profile.js';
import * as userProfilePage from './pages/user-profile.js';
import * as teamPage from './pages/team.js';
import * as myTeamsPage from './pages/my-teams.js';
import * as notFoundPage from './pages/not-found.js';

async function init() {
    initTheme(); // Apply saved theme before any render to avoid flash
    const main = document.getElementById('main');
    main.innerHTML = renderLoading('Loading...');

    try {
        // Load user session and catalogs in parallel
        await Promise.all([
            getMe().catch(() => null), // Ignore auth errors
            loadCatalogs()
        ]);

        // Render navbar (will update based on auth state)
        renderNavbar();

        // Register routes
        addRoute('/', landingPage.render);
        addRoute('/browse', homePage.render);
        addRoute('/posts/create', postCreatePage.render);
        addRoute('/posts/:id', postDetailPage.render);
        addRoute('/posts/:id/edit', postEditPage.render);
        addRoute('/posts/:id/applications', postApplicationsPage.render);
        addRoute('/my-posts', myPostsPage.render);
        addRoute('/my-applications', myApplicationsPage.render);
        addRoute('/profile', profilePage.render);
        addRoute('/users/:id', userProfilePage.render);
        addRoute('/posts/:id/team', teamPage.render);
        addRoute('/my-teams', myTeamsPage.render);
        addRoute('/my-teams/:id', myTeamsPage.render);

        // Set 404 handler
        setNotFound(notFoundPage.render);

        // Start router
        initRouter();

    } catch (error) {
        console.error('Failed to initialize app:', error);
        main.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <h1 class="text-2xl font-bold text-red-500 mb-4">Failed to Load</h1>
                <p class="text-gray-400 mb-6">There was an error loading the application.</p>
                <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md">
                    Reload Page
                </button>
            </div>
        `;
    }
}

// Start the app
init();
