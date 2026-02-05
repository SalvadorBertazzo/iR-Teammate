// User profile page - view another user's public profile
import { getUserProfile } from '../api/profile.js';
import { escapeHtml } from '../utils/dom.js';
import { formatLicenseLevel, getLicenseClass, formatIRating, formatCategory } from '../utils/format.js';
import { renderLoading, renderError } from '../components/loading.js';

export async function render(container, params) {
    const userId = parseInt(params.id);

    container.innerHTML = renderLoading('Loading profile...');

    try {
        const profile = await getUserProfile(userId);

        if (!profile) {
            container.innerHTML = `
                <div class="max-w-2xl mx-auto text-center py-12">
                    <h1 class="text-2xl font-bold text-content-primary mb-4">Profile Not Found</h1>
                    <p class="text-content-secondary mb-6">This user's profile doesn't exist or is not public.</p>
                    <a href="#/" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                        Go to Home
                    </a>
                </div>
            `;
            return;
        }

        const licenses = profile.licenses || [];
        const languages = profile.languages || [];

        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <!-- Back button -->
                <a href="#/" class="inline-flex items-center gap-2 text-content-secondary hover:text-brand-600 mb-6 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Back
                </a>

                <!-- Profile header -->
                <div class="bg-white rounded-xl border border-surface-200 p-6 mb-6 shadow-soft">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
                            <span class="text-2xl font-bold text-brand-600">
                                ${profile.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                        <div class="flex-1">
                            <h1 class="text-2xl font-bold text-content-primary mb-1">
                                ${escapeHtml(profile.display_name || 'Unknown User')}
                            </h1>
                            ${profile.club ? `
                                <p class="text-content-secondary mb-2">${escapeHtml(profile.club)}</p>
                            ` : ''}
                            <div class="flex flex-wrap gap-4 text-sm text-content-muted">
                                ${profile.iracing_id ? `
                                    <span>iRacing ID: <span class="text-brand-600">${profile.iracing_id}</span></span>
                                ` : ''}
                                ${profile.timezone ? `
                                    <span>Timezone: ${profile.timezone}</span>
                                ` : ''}
                                ${profile.preferred_racing_time ? `
                                    <span>Preferred Time: ${escapeHtml(profile.preferred_racing_time)}</span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Languages -->
                ${languages.length > 0 ? `
                    <div class="bg-white rounded-xl border border-surface-200 p-6 mb-6 shadow-soft">
                        <h2 class="text-lg font-semibold text-content-primary mb-3">Languages</h2>
                        <div class="flex flex-wrap gap-2">
                            ${languages.map(lang => `
                                <span class="px-3 py-1 bg-surface-100 border border-surface-200 rounded-full text-content-secondary text-sm">
                                    ${escapeHtml(lang.name)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Licenses -->
                ${licenses.length > 0 ? `
                    <div class="bg-white rounded-xl border border-surface-200 p-6 shadow-soft">
                        <h2 class="text-lg font-semibold text-content-primary mb-4">Licenses</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            ${licenses.map(license => `
                                <div class="bg-surface-50 rounded-lg p-4 border border-surface-200">
                                    <h3 class="font-medium text-brand-600 mb-2">${formatCategory(license.category)}</h3>
                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between">
                                            <span class="text-content-muted text-sm">License:</span>
                                            <span class="px-2 py-0.5 rounded text-xs font-medium ${getLicenseClass(license.license_level)}">
                                                ${formatLicenseLevel(license.license_level)}
                                            </span>
                                        </div>
                                        ${license.safety_rating !== null && license.safety_rating !== undefined ? `
                                            <div class="flex items-center justify-between">
                                                <span class="text-content-muted text-sm">Safety:</span>
                                                <span class="text-content-primary font-medium">${license.safety_rating.toFixed(2)}</span>
                                            </div>
                                        ` : ''}
                                        ${license.irating ? `
                                            <div class="flex items-center justify-between">
                                                <span class="text-content-muted text-sm">iRating:</span>
                                                <span class="text-brand-600 font-bold">${formatIRating(license.irating)}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${licenses.length === 0 && languages.length === 0 ? `
                    <div class="bg-white rounded-xl border border-surface-200 p-6 text-center shadow-soft">
                        <p class="text-content-secondary">This user hasn't added any profile details yet.</p>
                    </div>
                ` : ''}
            </div>
        `;

    } catch (error) {
        console.error('Failed to load profile:', error);
        if (error.status === 404) {
            container.innerHTML = `
                <div class="max-w-2xl mx-auto text-center py-12">
                    <h1 class="text-2xl font-bold text-content-primary mb-4">Profile Not Found</h1>
                    <p class="text-content-secondary mb-6">This user's profile doesn't exist.</p>
                    <a href="#/" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                        Go to Home
                    </a>
                </div>
            `;
        } else {
            container.innerHTML = renderError('Failed to load profile. Please try again.');
        }
    }
}
