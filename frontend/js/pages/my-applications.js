// My applications page
import { isLoggedIn } from '../state.js';
import { listMyApplications } from '../api/applications.js';
import { renderApplicationCard } from '../components/application-card.js';
import { renderLoading, renderError, renderEmpty } from '../components/loading.js';

export async function render(container) {
    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <h1 class="text-2xl font-bold text-content-primary mb-4">Login Required</h1>
                <p class="text-content-secondary mb-6">You need to be logged in to view your applications.</p>
                <a href="#/" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                    Go to Home
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <h1 class="text-2xl font-bold text-content-primary mb-6">My Applications</h1>

            <!-- Status filter -->
            <div class="flex flex-wrap gap-2 mb-6">
                <button class="status-filter-btn px-4 py-2 rounded-md btn-primary" data-status="">
                    All
                </button>
                <button class="status-filter-btn px-4 py-2 rounded-md btn-secondary" data-status="pending">
                    Pending
                </button>
                <button class="status-filter-btn px-4 py-2 rounded-md btn-secondary" data-status="accepted">
                    Accepted
                </button>
                <button class="status-filter-btn px-4 py-2 rounded-md btn-secondary" data-status="rejected">
                    Rejected
                </button>
            </div>

            <div id="applications-list" class="space-y-4">
                ${renderLoading('Loading your applications...')}
            </div>
        </div>
    `;

    const applicationsList = document.getElementById('applications-list');
    let allApplications = [];
    let currentStatus = '';

    async function loadApplications() {
        applicationsList.innerHTML = renderLoading('Loading applications...');

        try {
            allApplications = await listMyApplications();
            filterAndRender();
        } catch (error) {
            console.error('Failed to load applications:', error);
            applicationsList.innerHTML = renderError('Failed to load applications. Please try again.');
        }
    }

    function filterAndRender() {
        let filtered = allApplications;

        if (currentStatus) {
            filtered = allApplications.filter(app => app.status === currentStatus);
        }

        if (filtered.length === 0) {
            applicationsList.innerHTML = renderEmpty(
                currentStatus
                    ? `No ${currentStatus} applications found.`
                    : 'You haven\'t applied to any posts yet.',
                'Find Teammates',
                '#/'
            );
            return;
        }

        applicationsList.innerHTML = filtered
            .map(app => renderApplicationCard(app, true, false))
            .join('');
    }

    // Status filter buttons
    document.querySelectorAll('.status-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.status-filter-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');

            currentStatus = btn.dataset.status;
            filterAndRender();
        });
    });

    // Initial load
    await loadApplications();
}
