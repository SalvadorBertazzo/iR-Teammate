// Filter panel component
import { getCatalogs } from '../state.js';
import { escapeHtml } from '../utils/dom.js';

export function renderFilterPanel(currentFilters = {}) {
    const catalogs = getCatalogs();

    const categories = [
        { value: 'sports_car', label: 'Sports Car' },
        { value: 'formula', label: 'Formula Car' },
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

    const sortOptions = [
        { value: 'created_at', label: 'Created Date' },
        { value: 'event_start_at', label: 'Event Date' },
        { value: 'min_irating', label: 'iRating' }
    ];

    const selectedCategories = currentFilters.category || [];
    const selectedSeriesIds = currentFilters.series_ids || [];
    const selectedCarIds = currentFilters.car_ids || [];
    const selectedTrackIds = currentFilters.track_ids || [];

    return `
        <div class="bg-white rounded-xl p-4 border border-surface-200 h-full flex flex-col overflow-hidden">
            <div class="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 class="text-base font-semibold text-content-primary">Filters</h3>
                <button id="clear-filters" class="text-sm text-brand-600 hover:text-brand-700 transition-colors">
                    Clear all
                </button>
            </div>

            <form id="filter-form" class="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                <!-- Category -->
                <div class="flex-shrink-0">
                    <label class="block text-sm font-medium text-content-secondary mb-2">Category</label>
                    <div class="space-y-1.5">
                        ${categories.map(cat => `
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="category" value="${cat.value}"
                                    ${selectedCategories.includes(cat.value) ? 'checked' : ''}
                                    class="rounded border-surface-300 text-brand-600 focus:ring-brand-500">
                                <span class="text-content-secondary text-sm">${cat.label}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- iRating Range -->
                <div class="grid grid-cols-2 gap-2 flex-shrink-0">
                    <div>
                        <label class="block text-xs font-medium text-content-secondary mb-1">Min iRating</label>
                        <input type="number" name="min_irating" value="${currentFilters.min_irating || ''}"
                            class="w-full form-input rounded-lg px-2.5 py-1.5 text-sm"
                            placeholder="0" min="0" step="100">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-content-secondary mb-1">Max iRating</label>
                        <input type="number" name="max_irating" value="${currentFilters.max_irating || ''}"
                            class="w-full form-input rounded-lg px-2.5 py-1.5 text-sm"
                            placeholder="Any" min="0" step="100">
                    </div>
                </div>

                <!-- License Level -->
                <div class="flex-shrink-0">
                    <label class="block text-xs font-medium text-content-secondary mb-1">Min License</label>
                    <select name="min_license_level"
                        class="w-full form-input rounded-lg px-2.5 py-1.5 text-sm">
                        <option value="">Any</option>
                        ${licenseLevels.map(level => `
                            <option value="${level.value}" ${currentFilters.min_license_level === level.value ? 'selected' : ''}>
                                ${level.label}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Series -->
                <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <label class="block text-sm font-medium text-content-secondary mb-1 flex-shrink-0">Series</label>
                    <div class="space-y-1 flex-1 overflow-y-auto border border-surface-200 rounded-lg p-2 bg-surface-50">
                        ${catalogs.series.map(series => `
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="series_ids" value="${series.id}"
                                    ${selectedSeriesIds.includes(series.id) ? 'checked' : ''}
                                    class="rounded border-surface-300 text-brand-600 focus:ring-brand-500">
                                <span class="text-content-secondary text-xs">${escapeHtml(series.name)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Cars -->
                <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <label class="block text-sm font-medium text-content-secondary mb-1 flex-shrink-0">Car</label>
                    <div class="space-y-1 flex-1 overflow-y-auto border border-surface-200 rounded-lg p-2 bg-surface-50">
                        ${catalogs.cars.map(car => `
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="car_ids" value="${car.id}"
                                    ${selectedCarIds.includes(car.id) ? 'checked' : ''}
                                    class="rounded border-surface-300 text-brand-600 focus:ring-brand-500">
                                <span class="text-content-secondary text-xs">${escapeHtml(car.name)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Track -->
                <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <label class="block text-sm font-medium text-content-secondary mb-1 flex-shrink-0">Track</label>
                    <div class="space-y-1 flex-1 overflow-y-auto border border-surface-200 rounded-lg p-2 bg-surface-50">
                        ${catalogs.tracks.map(track => `
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="track_ids" value="${track.id}"
                                    ${selectedTrackIds.includes(track.id) ? 'checked' : ''}
                                    class="rounded border-surface-300 text-brand-600 focus:ring-brand-500">
                                <span class="text-content-secondary text-xs">${escapeHtml(track.name)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Sort -->
                <div class="grid grid-cols-2 gap-2 flex-shrink-0">
                    <div>
                        <label class="block text-xs font-medium text-content-secondary mb-1">Sort By</label>
                        <select name="sort_by"
                            class="w-full form-input rounded-lg px-2.5 py-1.5 text-sm">
                            ${sortOptions.map(opt => `
                                <option value="${opt.value}" ${currentFilters.sort_by === opt.value ? 'selected' : ''}>
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-content-secondary mb-1">Order</label>
                        <select name="sort_order"
                            class="w-full form-input rounded-lg px-2.5 py-1.5 text-sm">
                            <option value="desc" ${currentFilters.sort_order === 'desc' ? 'selected' : ''}>Newest</option>
                            <option value="asc" ${currentFilters.sort_order === 'asc' ? 'selected' : ''}>Oldest</option>
                        </select>
                    </div>
                </div>

                <button type="submit"
                    class="w-full btn-primary py-2 px-4 rounded-lg text-sm flex-shrink-0">
                    Apply Filters
                </button>
            </form>
        </div>
    `;
}

export function getFilterValues(form, searchInput = null) {
    const formData = new FormData(form);
    const filters = {};

    // Search from external input
    if (searchInput && searchInput.value) {
        filters.search = searchInput.value;
    }

    // Checkboxes (category)
    const categories = formData.getAll('category');
    if (categories.length > 0) filters.category = categories;

    // Number fields
    const minIRating = formData.get('min_irating');
    if (minIRating) filters.min_irating = parseInt(minIRating);

    const maxIRating = formData.get('max_irating');
    if (maxIRating) filters.max_irating = parseInt(maxIRating);

    // Select fields
    const minLicenseLevel = formData.get('min_license_level');
    if (minLicenseLevel) filters.min_license_level = minLicenseLevel;

    // Multi-select (series_ids, car_ids, track_ids)
    const seriesIds = formData.getAll('series_ids').map(id => parseInt(id)).filter(Boolean);
    if (seriesIds.length > 0) filters.series_ids = seriesIds;

    const carIds = formData.getAll('car_ids').map(id => parseInt(id)).filter(Boolean);
    if (carIds.length > 0) filters.car_ids = carIds;

    const trackIds = formData.getAll('track_ids').map(id => parseInt(id)).filter(Boolean);
    if (trackIds.length > 0) filters.track_ids = trackIds;

    // Sort
    const sortBy = formData.get('sort_by');
    if (sortBy) filters.sort_by = sortBy;

    const sortOrder = formData.get('sort_order');
    if (sortOrder) filters.sort_order = sortOrder;

    return filters;
}
