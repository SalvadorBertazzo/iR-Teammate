// Profile page - view and edit own profile
import { isLoggedIn } from '../state.js';
import { getMyProfile, updateProfile, upsertLicense, upsertLanguages } from '../api/profile.js';
import { getCatalogs } from '../state.js';
import { escapeHtml } from '../utils/dom.js';
import { formatCategory } from '../utils/format.js';
import { renderLoading, renderError } from '../components/loading.js';
import toast from '../components/toast.js';

export async function render(container) {
    if (!isLoggedIn()) {
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-12">
                <h1 class="text-2xl font-bold text-content-primary mb-4">Login Required</h1>
                <p class="text-content-secondary mb-6">You need to be logged in to view your profile.</p>
                <a href="#/" class="btn-primary font-medium py-2 px-6 rounded-lg inline-block">
                    Go to Home
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = renderLoading('Loading profile...');

    try {
        const profile = await getMyProfile();
        const catalogs = getCatalogs();

        if (!profile) {
            container.innerHTML = `
                <div class="max-w-2xl mx-auto text-center py-12">
                    <h1 class="text-2xl font-bold text-content-primary mb-4">Profile Not Found</h1>
                    <p class="text-content-secondary">Your iRacing profile hasn't been set up yet.</p>
                </div>
            `;
            return;
        }

        const licenses = profile.licenses || [];
        const languages = profile.languages || [];

        const categories = ['sports_car', 'formula', 'oval', 'dirt_road', 'dirt_oval'];
        const licenseLevels = ['R', 'D', 'C', 'B', 'A', 'P'];

        const timezones = [
            'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7',
            'UTC-6', 'UTC-5', 'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1',
            'UTC',
            'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC+6',
            'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
        ];

        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <h1 class="text-2xl font-bold text-content-primary mb-6">My Profile</h1>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Basic Info -->
                    <div class="bg-white rounded-xl border border-surface-200 p-6 shadow-soft">
                        <h2 class="text-lg font-semibold text-content-primary mb-4">Basic Information</h2>
                        <form id="profile-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-content-secondary mb-1">Display Name</label>
                                <input type="text" name="display_name" value="${escapeHtml(profile.display_name || '')}"
                                    class="w-full form-input rounded-lg px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-content-secondary mb-1">iRacing ID</label>
                                <input type="number" name="iracing_id" value="${profile.iracing_id || ''}"
                                    class="w-full form-input rounded-lg px-3 py-2"
                                    placeholder="Your iRacing customer ID">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-content-secondary mb-1">Club</label>
                                <input type="text" name="club" value="${escapeHtml(profile.club || '')}"
                                    class="w-full form-input rounded-lg px-3 py-2"
                                    placeholder="e.g., DE-AT-CH Club">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-content-secondary mb-1">Timezone</label>
                                <select name="timezone"
                                    class="w-full form-input rounded-lg px-3 py-2">
                                    <option value="">-- Select Timezone --</option>
                                    ${timezones.map(tz => `
                                        <option value="${tz}" ${profile.timezone === tz ? 'selected' : ''}>
                                            ${tz}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-content-secondary mb-1">Preferred Racing Time</label>
                                <input type="text" name="preferred_racing_time" value="${escapeHtml(profile.preferred_racing_time || '')}"
                                    class="w-full form-input rounded-lg px-3 py-2"
                                    placeholder="e.g., Evenings (19:00-23:00 UTC)">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-content-secondary mb-1">Contact Hint</label>
                                <input type="text" name="contact_hint" value="${escapeHtml(profile.contact_hint || '')}"
                                    class="w-full form-input rounded-lg px-3 py-2"
                                    placeholder="e.g., Discord: username#1234">
                            </div>
                            <button type="submit" class="w-full btn-primary font-medium py-2 px-4 rounded-lg">
                                Save Profile
                            </button>
                        </form>
                    </div>

                    <!-- Languages -->
                    <div class="bg-white rounded-xl border border-surface-200 p-6 shadow-soft flex flex-col">
                        <h2 class="text-lg font-semibold text-content-primary mb-4">Languages</h2>
                        <form id="languages-form" class="flex flex-col flex-1">
                            <div class="space-y-2 mb-4 overflow-y-auto border border-surface-200 rounded-lg p-2 bg-surface-50 flex-1">
                                ${catalogs.languages.map(lang => `
                                    <label class="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="languages" value="${lang.code}"
                                            ${languages.some(l => l.code === lang.code) ? 'checked' : ''}
                                            class="rounded border-surface-300 text-brand-600 focus:ring-brand-500">
                                        <span class="text-content-secondary group-hover:text-content-primary transition-colors">${escapeHtml(lang.name)}</span>
                                    </label>
                                `).join('')}
                            </div>
                            <button type="submit" class="w-full btn-primary font-medium py-2 px-4 rounded-lg">
                                Save Languages
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Licenses -->
                <div class="bg-white rounded-xl border border-surface-200 p-6 mt-6 shadow-soft">
                    <h2 class="text-lg font-semibold text-content-primary mb-4">Licenses</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        ${categories.map(category => {
                            const license = licenses.find(l => l.category === category);
                            return `
                                <div class="bg-surface-50 rounded-lg p-4 border border-surface-200">
                                    <h3 class="font-medium text-brand-600 mb-3">${formatCategory(category)}</h3>
                                    <form class="license-form space-y-3" data-category="${category}">
                                        <div>
                                            <label class="block text-xs text-content-muted mb-1">License</label>
                                            <select name="license_level"
                                                class="w-full form-input rounded-lg px-2 py-1 text-sm">
                                                ${licenseLevels.map(level => `
                                                    <option value="${level}" ${license?.license_level === level ? 'selected' : ''}>
                                                        ${level}
                                                    </option>
                                                `).join('')}
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-xs text-content-muted mb-1">Safety Rating</label>
                                            <input type="number" name="safety_rating" step="0.01" min="0" max="4.99"
                                                value="${license?.safety_rating || ''}"
                                                class="w-full form-input rounded-lg px-2 py-1 text-sm"
                                                placeholder="e.g., 2.50">
                                        </div>
                                        <div>
                                            <label class="block text-xs text-content-muted mb-1">iRating</label>
                                            <input type="number" name="irating" min="0"
                                                value="${license?.irating || ''}"
                                                class="w-full form-input rounded-lg px-2 py-1 text-sm"
                                                placeholder="e.g., 2000">
                                        </div>
                                        <button type="submit" class="w-full btn-primary text-sm py-1.5 px-2 rounded-lg">
                                            Save
                                        </button>
                                    </form>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        // Profile form handler
        document.getElementById('profile-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            const data = {
                display_name: formData.get('display_name'),
                club: formData.get('club') || null,
                timezone: formData.get('timezone') || null,
                preferred_racing_time: formData.get('preferred_racing_time') || null,
                contact_hint: formData.get('contact_hint') || null
            };

            const iracingId = formData.get('iracing_id');
            if (iracingId) {
                data.iracing_id = parseInt(iracingId);
            }

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;

            try {
                await updateProfile(data);
                toast.success('Profile updated');
            } catch (error) {
                console.error('Failed to update profile:', error);
                toast.error('Failed to update profile');
            } finally {
                btn.disabled = false;
            }
        });

        // Languages form handler
        document.getElementById('languages-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const selectedLanguages = formData.getAll('languages');

            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;

            try {
                await upsertLanguages(selectedLanguages);
                toast.success('Languages updated');
            } catch (error) {
                console.error('Failed to update languages:', error);
                toast.error('Failed to update languages');
            } finally {
                btn.disabled = false;
            }
        });

        // License forms handlers
        document.querySelectorAll('.license-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const category = form.dataset.category;
                const formData = new FormData(form);

                const data = {
                    category,
                    license_level: formData.get('license_level')
                };

                const safetyRating = formData.get('safety_rating');
                if (safetyRating) {
                    data.safety_rating = parseFloat(safetyRating);
                }

                const irating = formData.get('irating');
                if (irating) {
                    data.irating = parseInt(irating);
                }

                const btn = form.querySelector('button[type="submit"]');
                btn.disabled = true;

                try {
                    await upsertLicense(data);
                    toast.success(`${formatCategory(category)} license updated`);
                } catch (error) {
                    console.error('Failed to update license:', error);
                    toast.error('Failed to update license');
                } finally {
                    btn.disabled = false;
                }
            });
        });

    } catch (error) {
        console.error('Failed to load profile:', error);
        container.innerHTML = renderError('Failed to load profile. Please try again.');
    }
}
