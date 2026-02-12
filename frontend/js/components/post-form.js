// Post form component
import { getCatalogs } from '../state.js';
import { escapeHtml } from '../utils/dom.js';
import { toISOLocal } from '../utils/format.js';
import { renderContentSelector, getContentSelectorValues } from './content-selector.js';

export function renderPostForm(post = null) {
    const catalogs = getCatalogs();
    const isEdit = !!post;

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
        { value: 'filled', label: 'Filled' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    // Get current values or defaults
    const title = post?.title || '';
    const body = post?.body || '';
    const minLicenseLevel = post?.min_license_level || 'R';
    const minIRating = post?.min_irating || 0;
    const maxIRating = post?.max_irating || '';
    const slotsTotal = post?.slots_total || 1;
    const status = post?.status || 'open';
    const eventStartAt = post?.event_start_at ? toISOLocal(post.event_start_at) : '';
    const eventId = post?.event_id || '';
    const languageCodes = post?.language_codes || [];

    // Determine initial post type
    const initialPostType = post?.event_id ? 'special_event' : 'normal';

    // Multi-select values for content selector
    const selectorValues = {
        categories: post?.categories || (post?.category ? [post.category] : []),
        series_ids: post?.series_ids || (post?.series_id ? [post.series_id] : []),
        car_class_ids: post?.car_class_ids || (post?.car_class_id ? [post.car_class_id] : []),
        car_ids: post?.car_ids || [],
        track_ids: post?.track_ids || (post?.track_id ? [post.track_id] : [])
    };

    return `
        <form id="post-form" class="space-y-8" data-post-type="${initialPostType}">
            <!-- Post Type Tabs -->
            <div class="flex gap-2">
                <button type="button" data-post-type="normal"
                    class="post-type-tab px-4 py-2 rounded-lg text-sm font-medium transition-colors ${initialPostType === 'normal' ? 'bg-brand-600 text-white' : 'bg-surface-100 text-content-secondary hover:bg-surface-200'}">
                    Normal
                </button>
                <button type="button" data-post-type="special_event"
                    class="post-type-tab px-4 py-2 rounded-lg text-sm font-medium transition-colors ${initialPostType === 'special_event' ? 'bg-brand-600 text-white' : 'bg-surface-100 text-content-secondary hover:bg-surface-200'}">
                    Special Event
                </button>
            </div>

            <!-- Title -->
            <div>
                <label class="block text-sm font-medium text-content-secondary mb-1.5">
                    Title <span class="text-red-500">*</span>
                </label>
                <input type="text" name="title" value="${escapeHtml(title)}" required
                    class="w-full form-input rounded-lg px-3 py-2.5"
                    placeholder="Looking for teammates for...">
            </div>

            <!-- Body -->
            <div>
                <label class="block text-sm font-medium text-content-secondary mb-1.5">
                    Description <span class="text-red-500">*</span>
                </label>
                <textarea name="body" rows="5" required
                    class="w-full form-input rounded-lg px-3 py-2.5"
                    placeholder="Describe what you're looking for...">${escapeHtml(body)}</textarea>
            </div>

            <!-- Normal Content Selector (Category, Series, CarClass, Car, Track) -->
            <div id="content-section-normal" class="pt-2 ${initialPostType !== 'normal' ? 'hidden' : ''}">
                <label class="block text-sm font-medium text-content-secondary mb-3">
                    Content Selection
                </label>
                ${renderContentSelector(selectorValues, 'normal')}
            </div>

            <!-- Special Event Section -->
            <div id="content-section-event" class="${initialPostType !== 'special_event' ? 'hidden' : ''}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label class="block text-sm font-medium text-content-secondary mb-1.5">Event</label>
                        <select name="event_id"
                            class="w-full form-input rounded-lg px-3 py-2.5">
                            <option value="">-- Select Event --</option>
                            ${catalogs.events.map(e => `
                                <option value="${e.id}" ${eventId == e.id ? 'selected' : ''}>
                                    ${escapeHtml(e.name)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-content-secondary mb-1.5">
                            Event Start <span class="text-content-muted font-normal">(UTC)</span>
                        </label>
                        <input type="datetime-local" name="event_start_at" value="${eventStartAt}"
                            class="w-full form-input rounded-lg px-3 py-2.5">
                        <p class="text-xs text-content-muted mt-1.5">All times are in UTC for consistency</p>
                    </div>
                </div>
                <label class="block text-sm font-medium text-content-secondary mb-3">
                    Content Selection
                </label>
                <div id="content-selector-event-wrap">
                    <!-- Event mode content selector rendered by initPostTypeTabs -->
                </div>
            </div>

            <!-- Status (edit mode only) -->
            ${isEdit ? `
            <div>
                <label class="block text-sm font-medium text-content-secondary mb-1.5">Status</label>
                <select name="status"
                    class="w-full form-input rounded-lg px-3 py-2.5">
                    ${statuses.map(s => `
                        <option value="${s.value}" ${status === s.value ? 'selected' : ''}>
                            ${s.label}
                        </option>
                    `).join('')}
                </select>
            </div>
            ` : ''}

            <!-- Requirements -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                    <label class="block text-sm font-medium text-content-secondary mb-1.5">Min License</label>
                    <select name="min_license_level"
                        class="w-full form-input rounded-lg px-3 py-2.5">
                        ${licenseLevels.map(level => `
                            <option value="${level.value}" ${minLicenseLevel === level.value ? 'selected' : ''}>
                                ${level.label}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-content-secondary mb-1.5">Min iRating</label>
                    <input type="number" name="min_irating" value="${minIRating}"
                        class="w-full form-input rounded-lg px-3 py-2.5"
                        min="0" step="100" placeholder="0">
                </div>
                <div>
                    <label class="block text-sm font-medium text-content-secondary mb-1.5">Max iRating</label>
                    <input type="number" name="max_irating" value="${maxIRating}"
                        class="w-full form-input rounded-lg px-3 py-2.5"
                        min="0" step="100" placeholder="No limit">
                </div>
                <div>
                    <label class="block text-sm font-medium text-content-secondary mb-1.5">Slots Total</label>
                    <input type="number" name="slots_total" value="${slotsTotal}"
                        class="w-full form-input rounded-lg px-3 py-2.5"
                        min="1" max="64">
                </div>
            </div>

            <!-- Languages -->
            <div>
                <label class="block text-sm font-medium text-content-secondary mb-1.5">Languages</label>
                <div class="flex flex-wrap gap-2 border border-surface-200 rounded-lg p-2.5 bg-surface-50">
                    ${catalogs.languages.map(l => `
                        <label class="flex items-center gap-1.5 cursor-pointer group">
                            <input type="checkbox" name="language_codes" value="${l.code}"
                                ${languageCodes.includes(l.code) ? 'checked' : ''}
                                class="rounded border-surface-300 text-brand-600 focus:ring-brand-500">
                            <span class="text-content-secondary text-sm group-hover:text-content-primary transition-colors">${escapeHtml(l.name)}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <!-- Submit -->
            <div class="flex gap-4 pt-2">
                <button type="submit"
                    class="flex-1 btn-primary font-semibold py-2.5 px-4 rounded-lg">
                    ${isEdit ? 'Update Post' : 'Create Post'}
                </button>
                <a href="#/my-posts"
                    class="px-6 py-2.5 btn-secondary rounded-lg text-center">
                    Cancel
                </a>
            </div>
        </form>
    `;
}

export function getPostFormValues(form) {
    const formData = new FormData(form);
    const postType = form.dataset.postType || 'normal';

    // Get content selector values
    const selectorValues = getContentSelectorValues();

    const data = {
        title: formData.get('title'),
        body: formData.get('body'),
        categories: selectorValues.categories,
        series_ids: selectorValues.series_ids,
        car_class_ids: selectorValues.car_class_ids,
        car_ids: selectorValues.car_ids,
        track_ids: selectorValues.track_ids,
        // Legacy category field: use first selected category (empty if none)
        category: selectorValues.categories.length > 0 ? selectorValues.categories[0] : '',
        min_license_level: formData.get('min_license_level'),
        min_irating: parseInt(formData.get('min_irating')) || 0,
        max_irating: formData.get('max_irating') ? parseInt(formData.get('max_irating')) : null,
        slots_total: parseInt(formData.get('slots_total')) || 1,
        is_public: true
    };

    // Status only present in edit mode
    const statusVal = formData.get('status');
    if (statusVal) {
        data.status = statusVal;
    }

    if (postType === 'special_event') {
        // Special Event: include event fields, clear category/series
        const eventId = formData.get('event_id');
        if (eventId) data.event_id = parseInt(eventId);

        const eventStartAt = formData.get('event_start_at');
        if (eventStartAt) {
            data.event_start_at = new Date(eventStartAt).toISOString();
        }

        data.categories = [];
        data.series_ids = [];
        data.category = '';
    } else {
        // Normal: no event fields
        data.event_id = null;
        data.event_start_at = null;
    }

    // Multi-select language codes
    const languageCodes = formData.getAll('language_codes').filter(Boolean);
    if (languageCodes.length > 0) data.language_codes = languageCodes;

    return data;
}
