// Filter panel component
import { getCatalogs, getRelationships } from '../state.js';
import { escapeHtml } from '../utils/dom.js';

function renderFilterGroup(label, groupName, items, selectedValues, nameAttr, valueType = 'number', defaultOpen = false) {
    const count = selectedValues.length;
    const isOpen = defaultOpen || count > 0;
    return `
        <div class="filter-group" data-filter-group="${groupName}" ${isOpen ? 'data-group-open' : ''}>
            <button type="button" class="filter-group-header">
                <span class="text-sm font-medium text-content-secondary">${label}</span>
                <span class="flex items-center gap-1.5">
                    <span class="text-xs text-brand-600 font-medium" data-filter-count="${groupName}">${count > 0 ? count + ' selected' : ''}</span>
                    <svg class="filter-group-chevron w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </span>
            </button>
            <div class="filter-group-content">
                <div class="filter-group-items space-y-1 border border-surface-200 rounded-lg p-2 bg-surface-50">
                    ${items.map(item => {
                        const itemVal = valueType === 'string' ? (item.value !== undefined ? item.value : item.id) : item.id;
                        const itemLabel = valueType === 'string' ? (item.label || item.name || '') : (item.name || '');
                        const isChecked = valueType === 'string'
                            ? selectedValues.includes(String(itemVal))
                            : selectedValues.includes(Number(itemVal));
                        return `
                            <label class="flex items-center gap-2 cursor-pointer filter-item" data-item-id="${itemVal}">
                                <input type="checkbox" name="${nameAttr}" value="${itemVal}"
                                    ${isChecked ? 'checked' : ''}
                                    class="rounded border-surface-300 text-brand-600 focus:ring-brand-500">
                                <span class="text-content-secondary text-xs">${escapeHtml(itemLabel)}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

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

    const selectedLicenseLevels = currentFilters.license_levels || [];
    const selectedCategories = currentFilters.category || [];
    const selectedSeriesIds = currentFilters.series_ids || [];
    const selectedCarIds = currentFilters.car_ids || [];
    const selectedTrackIds = currentFilters.track_ids || [];
    const selectedLanguageCodes = currentFilters.language_codes || [];
    const selectedEventIds = currentFilters.event_ids || [];

    // Determine active post type tab
    const postType = currentFilters.has_event === true ? 'special_event'
        : currentFilters.has_event === false ? 'normal'
        : 'all';

    return `
        <div class="bg-white rounded-xl p-4 border border-surface-200 h-full flex flex-col overflow-hidden">
            <div class="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 class="text-base font-semibold text-content-primary">Filters</h3>
                <button id="clear-filters" class="text-sm text-brand-600 hover:text-brand-700 transition-colors">
                    Clear all
                </button>
            </div>

            <form id="filter-form" class="flex-1 flex flex-col gap-1 min-h-0 overflow-y-auto">
                <!-- Post Type Tabs -->
                <div class="flex gap-1 mb-2 flex-shrink-0">
                    <button type="button" data-filter-type="all"
                        class="filter-type-tab flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${postType === 'all' ? 'bg-brand-600 text-white' : 'bg-surface-100 text-content-secondary hover:bg-surface-200'}">
                        All
                    </button>
                    <button type="button" data-filter-type="normal"
                        class="filter-type-tab flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${postType === 'normal' ? 'bg-brand-600 text-white' : 'bg-surface-100 text-content-secondary hover:bg-surface-200'}">
                        Normal
                    </button>
                    <button type="button" data-filter-type="special_event"
                        class="filter-type-tab flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${postType === 'special_event' ? 'bg-brand-600 text-white' : 'bg-surface-100 text-content-secondary hover:bg-surface-200'}">
                        Special Event
                    </button>
                </div>

                <!-- Hidden field to track post type -->
                <input type="hidden" name="filter_post_type" value="${postType}">

                <!-- License Level -->
                ${renderFilterGroup('License', 'license', licenseLevels, selectedLicenseLevels, 'license_levels', 'string', true)}

                <!-- iRating Range -->
                <div class="grid grid-cols-2 gap-2 py-2 flex-shrink-0">
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

                <!-- Normal-only filters: Category, Series -->
                <div id="filter-normal-section" class="${postType === 'special_event' ? 'hidden' : ''}">
                    <!-- Category -->
                    ${renderFilterGroup('Category', 'category', categories, selectedCategories, 'category', 'string', true)}

                    <!-- Series -->
                    ${renderFilterGroup('Series', 'series', catalogs.series, selectedSeriesIds, 'series_ids')}
                </div>

                <!-- Special Event-only filter: Event -->
                <div id="filter-event-section" class="${postType !== 'special_event' ? 'hidden' : ''}">
                    ${renderFilterGroup('Event', 'events', catalogs.events, selectedEventIds, 'event_ids')}
                </div>

                <!-- Cars -->
                ${renderFilterGroup('Car', 'cars', catalogs.cars, selectedCarIds, 'car_ids')}

                <!-- Track -->
                ${renderFilterGroup('Track', 'tracks', catalogs.tracks, selectedTrackIds, 'track_ids')}

                <!-- Languages -->
                ${renderFilterGroup('Language', 'languages', catalogs.languages.map(l => ({ value: l.code, label: l.name })), selectedLanguageCodes, 'language_codes', 'string')}

                <!-- Sort -->
                <div class="grid grid-cols-2 gap-2 py-2 flex-shrink-0">
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

    // Post type
    const filterPostType = formData.get('filter_post_type');
    if (filterPostType === 'normal') {
        filters.has_event = false;
    } else if (filterPostType === 'special_event') {
        filters.has_event = true;
    }

    // License levels (checkboxes)
    const licenseLevels = formData.getAll('license_levels').filter(Boolean);
    if (licenseLevels.length > 0) filters.license_levels = licenseLevels;

    // Number fields
    const minIRating = formData.get('min_irating');
    if (minIRating) filters.min_irating = parseInt(minIRating);

    const maxIRating = formData.get('max_irating');
    if (maxIRating) filters.max_irating = parseInt(maxIRating);

    // Checkboxes (category) - only if not in special_event mode
    if (filterPostType !== 'special_event') {
        const categories = formData.getAll('category');
        if (categories.length > 0) filters.category = categories;

        const seriesIds = formData.getAll('series_ids').map(id => parseInt(id)).filter(Boolean);
        if (seriesIds.length > 0) filters.series_ids = seriesIds;
    }

    // Event IDs - only if in special_event mode
    if (filterPostType === 'special_event') {
        const eventIds = formData.getAll('event_ids').map(id => parseInt(id)).filter(Boolean);
        if (eventIds.length > 0) filters.event_ids = eventIds;
    }

    const carIds = formData.getAll('car_ids').map(id => parseInt(id)).filter(Boolean);
    if (carIds.length > 0) filters.car_ids = carIds;

    const trackIds = formData.getAll('track_ids').map(id => parseInt(id)).filter(Boolean);
    if (trackIds.length > 0) filters.track_ids = trackIds;

    // Language codes
    const languageCodes = formData.getAll('language_codes').filter(Boolean);
    if (languageCodes.length > 0) filters.language_codes = languageCodes;

    // Sort
    const sortBy = formData.get('sort_by');
    if (sortBy) filters.sort_by = sortBy;

    const sortOrder = formData.get('sort_order');
    if (sortOrder) filters.sort_order = sortOrder;

    return filters;
}

// --- Bidirectional filtering for filter panel ---

/** Build a multi-map from a list of relationship objects. */
function buildMultiMap(items, keyField, valueField) {
    const map = new Map();
    if (!items) return map;
    for (const item of items) {
        const key = item[keyField];
        const val = item[valueField];
        if (!map.has(key)) {
            map.set(key, new Set());
        }
        map.get(key).add(val);
    }
    return map;
}

/** Expand a set of keys through a single map. Returns union of all mapped values. */
function expand(keys, map) {
    const result = new Set();
    for (const key of keys) {
        const vals = map.get(key);
        if (vals) vals.forEach(v => result.add(v));
    }
    return result;
}

/** Expand a computed set through a map. */
function expandSet(sourceSet, map) {
    const result = new Set();
    for (const key of sourceSet) {
        const vals = map.get(key);
        if (vals) vals.forEach(v => result.add(v));
    }
    return result;
}

/** Expand keys through 2 maps: keys -> map1 -> map2. */
function expandChain(keys, map1, map2) {
    return expandSet(expand(keys, map1), map2);
}

/** Expand keys through 3 maps: keys -> map1 -> map2 -> map3. */
function expandChain3(keys, map1, map2, map3) {
    return expandSet(expandChain(keys, map1, map2), map3);
}

function intersect(setA, setB) {
    const result = new Set();
    for (const item of setA) {
        if (setB.has(item)) {
            result.add(item);
        }
    }
    return result;
}

/**
 * Initialize bidirectional filtering, post type tabs, and accordion on the filter panel.
 * Call after the filter panel HTML is in the DOM.
 */
export function initFilterPanel() {
    const form = document.getElementById('filter-form');
    if (!form) return;

    // Set up post type tab switching
    initFilterTypeTabs(form);

    // Set up accordion toggles
    form.querySelectorAll('.filter-group-header').forEach(header => {
        header.addEventListener('click', (e) => {
            e.preventDefault();
            const group = header.closest('.filter-group');
            if (group.hasAttribute('data-group-open')) {
                group.removeAttribute('data-group-open');
            } else {
                group.setAttribute('data-group-open', '');
            }
        });
    });

    const rels = getRelationships();
    if (!rels.loaded) return;

    // Build lookup maps
    const seriesToCategories = buildMultiMap(rels.series_categories, 'series_id', 'category');
    const categoriesToSeries = buildMultiMap(rels.series_categories, 'category', 'series_id');
    const seriesToCarClasses = buildMultiMap(rels.series_car_classes, 'series_id', 'car_class_id');
    const carClassesToSeries = buildMultiMap(rels.series_car_classes, 'car_class_id', 'series_id');
    const carClassesToCars = buildMultiMap(rels.car_class_cars, 'car_class_id', 'car_id');
    const carsToCarClasses = buildMultiMap(rels.car_class_cars, 'car_id', 'car_class_id');

    const maps = { seriesToCategories, categoriesToSeries, seriesToCarClasses, carClassesToSeries, carClassesToCars, carsToCarClasses };

    // Listen for all checkbox changes (filtering + counts)
    form.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            // Update bidirectional filtering for related groups
            if (e.target.name === 'category' || e.target.name === 'series_ids' || e.target.name === 'car_ids') {
                applyFilterPanelFiltering(form, maps);
            }
            // Always update counts
            updateFilterCounts(form);
        }
    });

    // Apply initial filtering and counts
    applyFilterPanelFiltering(form, maps);
    updateFilterCounts(form);
}

function initFilterTypeTabs(form) {
    const tabs = form.querySelectorAll('.filter-type-tab');
    const normalSection = document.getElementById('filter-normal-section');
    const eventSection = document.getElementById('filter-event-section');
    const hiddenInput = form.querySelector('input[name="filter_post_type"]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.filterType;
            hiddenInput.value = type;

            // Update tab styles
            tabs.forEach(t => {
                if (t.dataset.filterType === type) {
                    t.className = 'filter-type-tab flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors bg-brand-600 text-white';
                } else {
                    t.className = 'filter-type-tab flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors bg-surface-100 text-content-secondary hover:bg-surface-200';
                }
            });

            // Show/hide sections
            if (type === 'special_event') {
                normalSection.classList.add('hidden');
                eventSection.classList.remove('hidden');
            } else if (type === 'normal') {
                normalSection.classList.remove('hidden');
                eventSection.classList.add('hidden');
            } else {
                // "All" - show both normal filters (category/series) but hide event-specific
                normalSection.classList.remove('hidden');
                eventSection.classList.add('hidden');
            }
        });
    });
}

const FILTER_COUNT_MAP = [
    { group: 'license', name: 'license_levels' },
    { group: 'category', name: 'category' },
    { group: 'series', name: 'series_ids' },
    { group: 'events', name: 'event_ids' },
    { group: 'cars', name: 'car_ids' },
    { group: 'tracks', name: 'track_ids' },
    { group: 'languages', name: 'language_codes' },
];

function updateFilterCounts(form) {
    for (const { group, name } of FILTER_COUNT_MAP) {
        const count = form.querySelectorAll(`input[name="${name}"]:checked`).length;
        const countEl = form.querySelector(`[data-filter-count="${group}"]`);
        if (countEl) {
            countEl.textContent = count > 0 ? count + ' selected' : '';
        }
    }
}

function getFilterPanelSelected(form) {
    const categories = new Set();
    const seriesIds = new Set();
    const carIds = new Set();

    form.querySelectorAll('input[name="category"]:checked').forEach(el => {
        categories.add(el.value);
    });
    form.querySelectorAll('input[name="series_ids"]:checked').forEach(el => {
        seriesIds.add(Number(el.value));
    });
    form.querySelectorAll('input[name="car_ids"]:checked').forEach(el => {
        carIds.add(Number(el.value));
    });

    return { categories, seriesIds, carIds };
}

function applyFilterPanelFiltering(form, maps) {
    const selected = getFilterPanelSelected(form);
    const { seriesToCategories, categoriesToSeries, seriesToCarClasses, carClassesToSeries, carClassesToCars, carsToCarClasses } = maps;

    // --- Visible Categories ---
    let visibleCategories = null;
    if (selected.seriesIds.size > 0) {
        visibleCategories = expand(selected.seriesIds, seriesToCategories);
    }
    if (selected.carIds.size > 0) {
        const fromCar = expandChain3(selected.carIds, carsToCarClasses, carClassesToSeries, seriesToCategories);
        visibleCategories = visibleCategories ? intersect(visibleCategories, fromCar) : fromCar;
    }

    // --- Visible Series ---
    let visibleSeries = null;
    if (selected.categories.size > 0) {
        visibleSeries = expand(selected.categories, categoriesToSeries);
    }
    if (selected.carIds.size > 0) {
        const fromCar = expandChain(selected.carIds, carsToCarClasses, carClassesToSeries);
        visibleSeries = visibleSeries ? intersect(visibleSeries, fromCar) : fromCar;
    }

    // --- Visible Cars ---
    let visibleCars = null;
    if (selected.categories.size > 0) {
        const series = expand(selected.categories, categoriesToSeries);
        const cc = expandSet(series, seriesToCarClasses);
        visibleCars = expandSet(cc, carClassesToCars);
    }
    if (selected.seriesIds.size > 0) {
        const cc = expand(selected.seriesIds, seriesToCarClasses);
        const fromSeries = expandSet(cc, carClassesToCars);
        visibleCars = visibleCars ? intersect(visibleCars, fromSeries) : fromSeries;
    }

    // Apply visibility
    applyGroupVisibility(form, 'category', visibleCategories, 'string');
    applyGroupVisibility(form, 'series', visibleSeries, 'number');
    applyGroupVisibility(form, 'cars', visibleCars, 'number');
    // Tracks are always fully visible (no relationship data for tracks)
}

function applyGroupVisibility(form, groupName, visibleIds, valueType) {
    const group = form.querySelector(`[data-filter-group="${groupName}"]`);
    if (!group) return;

    const items = group.querySelectorAll('.filter-item');
    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (!checkbox) return;

        if (visibleIds === null) {
            item.classList.remove('filter-hidden');
        } else {
            const val = valueType === 'string' ? String(item.dataset.itemId) : Number(item.dataset.itemId);
            if (visibleIds.has(val)) {
                item.classList.remove('filter-hidden');
            } else {
                item.classList.add('filter-hidden');
                if (checkbox.checked) {
                    checkbox.checked = false;
                }
            }
        }
    });
}
