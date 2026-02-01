// Post form component
import { getCatalogs } from '../state.js';
import { escapeHtml } from '../utils/dom.js';
import { toISOLocal } from '../utils/format.js';

export function renderPostForm(post = null) {
    const catalogs = getCatalogs();
    const isEdit = !!post;

    const categories = [
        { value: 'sports_car', label: 'Sports Car' },
        { value: 'formula_car', label: 'Formula Car' },
        { value: 'oval', label: 'Oval' },
        { value: 'dirt_road', label: 'Dirt Road' },
        { value: 'dirt_oval', label: 'Dirt Oval' }
    ];

    const licenseLevels = [
        { value: 'R', label: 'Rookie (R)' },
        { value: 'D', label: 'D Class' },
        { value: 'C', label: 'C Class' },
        { value: 'B', label: 'B Class' },
        { value: 'A', label: 'A Class' },
        { value: 'P', label: 'Pro' }
    ];

    const statuses = [
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
        { value: 'filled', label: 'Filled' }
    ];

    // Get current values or defaults
    const title = post?.title || '';
    const body = post?.body || '';
    const category = post?.category || 'sports_car';
    const minLicenseLevel = post?.min_license_level || 'R';
    const minIRating = post?.min_irating || 0;
    const maxIRating = post?.max_irating || '';
    const slotsTotal = post?.slots_total || 1;
    const status = post?.status || 'open';
    const isPublic = post?.is_public !== false;
    const contactHint = post?.contact_hint || '';
    const eventStartAt = post?.event_start_at ? toISOLocal(post.event_start_at) : '';
    const seriesId = post?.series_id || '';
    const carClassId = post?.car_class_id || '';
    const trackId = post?.track_id || '';
    const eventId = post?.event_id || '';
    const carIds = post?.car_ids || [];
    const languageCodes = post?.language_codes || [];

    return `
        <form id="post-form" class="space-y-6">
            <!-- Title -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Title <span class="text-red-500">*</span>
                </label>
                <input type="text" name="title" value="${escapeHtml(title)}" required
                    class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Looking for teammates for...">
            </div>

            <!-- Body -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Description <span class="text-red-500">*</span>
                </label>
                <textarea name="body" rows="5" required
                    class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Describe what you're looking for...">${escapeHtml(body)}</textarea>
            </div>

            <!-- Category and Status -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        ${categories.map(cat => `
                            <option value="${cat.value}" ${category === cat.value ? 'selected' : ''}>
                                ${cat.label}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        ${statuses.map(s => `
                            <option value="${s.value}" ${status === s.value ? 'selected' : ''}>
                                ${s.label}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>

            <!-- Requirements -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Min License</label>
                    <select name="min_license_level"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        ${licenseLevels.map(level => `
                            <option value="${level.value}" ${minLicenseLevel === level.value ? 'selected' : ''}>
                                ${level.label}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Min iRating</label>
                    <input type="number" name="min_irating" value="${minIRating}"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        min="0" step="100" placeholder="0">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Max iRating</label>
                    <input type="number" name="max_irating" value="${maxIRating}"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        min="0" step="100" placeholder="No limit">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Slots Total</label>
                    <input type="number" name="slots_total" value="${slotsTotal}"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        min="1" max="64">
                </div>
            </div>

            <!-- Series and Track -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Series</label>
                    <select name="series_id"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <option value="">-- Select Series --</option>
                        ${catalogs.series.map(s => `
                            <option value="${s.id}" ${seriesId == s.id ? 'selected' : ''}>
                                ${escapeHtml(s.name)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Track</label>
                    <select name="track_id"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <option value="">-- Select Track --</option>
                        ${catalogs.tracks.map(t => `
                            <option value="${t.id}" ${trackId == t.id ? 'selected' : ''}>
                                ${escapeHtml(t.name)}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>

            <!-- Car Class and Event -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Car Class</label>
                    <select name="car_class_id"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <option value="">-- Select Car Class --</option>
                        ${catalogs.carClasses.map(c => `
                            <option value="${c.id}" ${carClassId == c.id ? 'selected' : ''}>
                                ${escapeHtml(c.name)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Event</label>
                    <select name="event_id"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <option value="">-- Select Event --</option>
                        ${catalogs.events.map(e => `
                            <option value="${e.id}" ${eventId == e.id ? 'selected' : ''}>
                                ${escapeHtml(e.name)}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>

            <!-- Cars and Languages -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Cars</label>
                    <div class="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                        ${catalogs.cars.map(c => `
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="car_ids" value="${c.id}"
                                    ${carIds.includes(c.id) ? 'checked' : ''}
                                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="text-gray-700 text-sm">${escapeHtml(c.name)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                    <div class="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                        ${catalogs.languages.map(l => `
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="language_codes" value="${l.code}"
                                    ${languageCodes.includes(l.code) ? 'checked' : ''}
                                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                <span class="text-gray-700 text-sm">${escapeHtml(l.name)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Event Date -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Event Start <span class="text-gray-400 font-normal">(UTC)</span>
                </label>
                <input type="datetime-local" name="event_start_at" value="${eventStartAt}"
                    class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <p class="text-xs text-gray-500 mt-1">All times are in UTC for consistency</p>
            </div>

            <!-- Contact and Visibility -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contact Hint</label>
                    <input type="text" name="contact_hint" value="${escapeHtml(contactHint)}"
                        class="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., Discord: username#1234">
                </div>
                <div class="flex items-center pt-6">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="is_public" ${isPublic ? 'checked' : ''}
                            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <span class="text-gray-700">Make this post public</span>
                    </label>
                </div>
            </div>

            <!-- Submit -->
            <div class="flex gap-4 pt-4">
                <button type="submit"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    ${isEdit ? 'Update Post' : 'Create Post'}
                </button>
                <a href="#/my-posts"
                    class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-center">
                    Cancel
                </a>
            </div>
        </form>
    `;
}

export function getPostFormValues(form) {
    const formData = new FormData(form);

    const data = {
        title: formData.get('title'),
        body: formData.get('body'),
        category: formData.get('category'),
        min_license_level: formData.get('min_license_level'),
        min_irating: parseInt(formData.get('min_irating')) || 0,
        max_irating: formData.get('max_irating') ? parseInt(formData.get('max_irating')) : null,
        slots_total: parseInt(formData.get('slots_total')) || 1,
        status: formData.get('status'),
        is_public: formData.has('is_public'),
        contact_hint: formData.get('contact_hint') || ''
    };

    // Optional ID fields
    const seriesId = formData.get('series_id');
    if (seriesId) data.series_id = parseInt(seriesId);

    const trackId = formData.get('track_id');
    if (trackId) data.track_id = parseInt(trackId);

    const carClassId = formData.get('car_class_id');
    if (carClassId) data.car_class_id = parseInt(carClassId);

    const eventId = formData.get('event_id');
    if (eventId) data.event_id = parseInt(eventId);

    // Multi-select fields
    const carIds = formData.getAll('car_ids').map(id => parseInt(id)).filter(Boolean);
    if (carIds.length > 0) data.car_ids = carIds;

    const languageCodes = formData.getAll('language_codes').filter(Boolean);
    if (languageCodes.length > 0) data.language_codes = languageCodes;

    // Event start date
    const eventStartAt = formData.get('event_start_at');
    if (eventStartAt) {
        data.event_start_at = new Date(eventStartAt).toISOString();
    }

    return data;
}
