// Content Selector Component - 5-column multi-select with bidirectional filtering
import { getCatalogs, getRelationships } from '../state.js';
import { escapeHtml } from '../utils/dom.js';

const CATEGORIES = [
    { value: 'sports_car', label: 'Sports Car' },
    { value: 'formula', label: 'Formula' },
    { value: 'oval', label: 'Oval' },
    { value: 'dirt_road', label: 'Dirt Road' },
    { value: 'dirt_oval', label: 'Dirt Oval' }
];

/**
 * Renders the content selector.
 * @param {Object} selected - Pre-selected values for editing
 * @param {string[]} selected.categories
 * @param {number[]} selected.series_ids
 * @param {number[]} selected.car_class_ids
 * @param {number[]} selected.car_ids
 * @param {number[]} selected.track_ids
 * @param {string} mode - 'normal' (Category/Series/CarClass + Car/Track) or 'event' (CarClass + Car/Track)
 */
export function renderContentSelector(selected = {}, mode = 'normal') {
    const selCarClasses = selected.car_class_ids || [];
    const selCars = selected.car_ids || [];
    const selTracks = selected.track_ids || [];

    if (mode === 'event') {
        return `
            <div id="content-selector" class="content-selector" data-mode="event">
                <div class="content-selector-grid">
                    ${renderColumn('Car Class', 'cs-car-class', getCatalogs().carClasses, selCarClasses, 'number')}
                    ${renderColumn('Car', 'cs-car', getCatalogs().cars, selCars, 'number')}
                    ${renderColumn('Track', 'cs-track', getCatalogs().tracks, selTracks, 'number')}
                </div>
            </div>
        `;
    }

    const selCats = selected.categories || [];
    const selSeries = selected.series_ids || [];

    return `
        <div id="content-selector" class="content-selector" data-mode="normal">
            <div class="content-selector-grid">
                ${renderColumn('Category', 'cs-category', CATEGORIES.map(c => ({
                    id: c.value, name: c.label
                })), selCats, 'string')}
                ${renderColumn('Series', 'cs-series', getCatalogs().series, selSeries, 'number')}
                ${renderColumn('Car Class', 'cs-car-class', getCatalogs().carClasses, selCarClasses, 'number')}
            </div>
            <div class="content-selector-grid-bottom">
                ${renderColumn('Car', 'cs-car', getCatalogs().cars, selCars, 'number')}
                ${renderColumn('Track', 'cs-track', getCatalogs().tracks, selTracks, 'number')}
            </div>
        </div>
    `;
}

function renderColumn(title, groupName, items, selectedValues, valueType) {
    return `
        <div class="content-selector-column" data-column="${groupName}">
            <div class="content-selector-header">
                <span class="text-sm font-medium text-content-secondary">${title}</span>
                <span class="content-selector-count text-xs text-content-muted" data-count="${groupName}">
                    ${selectedValues.length > 0 ? selectedValues.length : ''}
                </span>
            </div>
            <div class="content-selector-search">
                <input type="text" placeholder="Filter..."
                    class="content-selector-search-input form-input text-sm"
                    data-search="${groupName}">
            </div>
            <div class="content-selector-items">
                ${items.map(item => {
                    const val = valueType === 'string' ? item.id : item.id;
                    const isChecked = valueType === 'string'
                        ? selectedValues.includes(String(val))
                        : selectedValues.includes(Number(val));
                    return `
                        <label class="content-selector-item" data-item-id="${val}" data-item-name="${escapeHtml(item.name).toLowerCase()}">
                            <input type="checkbox" data-group="${groupName}" value="${val}"
                                ${isChecked ? 'checked' : ''}
                                class="rounded border-surface-300 text-brand-600 focus:ring-brand-500">
                            <span class="text-sm text-content-secondary">${escapeHtml(item.name)}</span>
                        </label>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * Initializes the content selector event listeners and bidirectional filtering.
 * Call this after the HTML has been inserted into the DOM.
 */
export function initContentSelector() {
    const container = document.getElementById('content-selector');
    if (!container) return;

    const mode = container.dataset.mode || 'normal';
    const rels = getRelationships();

    // Build lookup maps for fast filtering
    const carClassesToCars = buildMultiMap(rels.car_class_cars, 'car_class_id', 'car_id');
    const carsToCarClasses = buildMultiMap(rels.car_class_cars, 'car_id', 'car_class_id');

    if (mode === 'event') {
        // Event mode: only CarClass <-> Car filtering
        const eventMaps = { carClassesToCars, carsToCarClasses };

        container.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.dataset.group) {
                applyEventFiltering(container, eventMaps);
            }
        });

        container.addEventListener('input', (e) => {
            if (e.target.dataset.search) {
                handleSearchInput(container, e.target);
            }
        });

        applyEventFiltering(container, eventMaps);
        return;
    }

    // Normal mode: full Category/Series/CarClass/Car filtering
    const seriesToCategories = buildMultiMap(rels.series_categories, 'series_id', 'category');
    const categoriesToSeries = buildMultiMap(rels.series_categories, 'category', 'series_id');
    const seriesToCarClasses = buildMultiMap(rels.series_car_classes, 'series_id', 'car_class_id');
    const carClassesToSeries = buildMultiMap(rels.series_car_classes, 'car_class_id', 'series_id');

    const maps = {
        seriesToCategories, categoriesToSeries,
        seriesToCarClasses, carClassesToSeries,
        carClassesToCars, carsToCarClasses
    };

    container.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.dataset.group) {
            applyFiltering(container, maps);
        }
    });

    container.addEventListener('input', (e) => {
        if (e.target.dataset.search) {
            handleSearchInput(container, e.target);
        }
    });

    // Apply initial filtering if there are pre-selected values
    applyFiltering(container, maps);
}

function handleSearchInput(container, target) {
    const groupName = target.dataset.search;
    const query = target.value.toLowerCase().trim();
    const column = container.querySelector(`[data-column="${groupName}"]`);
    if (!column) return;
    const items = column.querySelectorAll('.content-selector-item');
    items.forEach(item => {
        const name = item.dataset.itemName || '';
        if (!query || name.includes(query)) {
            item.classList.remove('search-hidden');
        } else {
            item.classList.add('search-hidden');
        }
    });
}

function applyEventFiltering(container, maps) {
    const selected = getSelectedValues(container);
    const { carClassesToCars, carsToCarClasses } = maps;

    // CarClass <-> Car bidirectional filtering
    let visibleCarClasses = null;
    if (selected.carIds.size > 0) {
        visibleCarClasses = expand(selected.carIds, carsToCarClasses);
    }

    let visibleCars = null;
    if (selected.carClassIds.size > 0) {
        visibleCars = expand(selected.carClassIds, carClassesToCars);
    }

    applyColumnVisibility(container, 'cs-car-class', visibleCarClasses);
    applyColumnVisibility(container, 'cs-car', visibleCars);

    updateCounts(container);
}

function applyFiltering(container, maps) {
    const selected = getSelectedValues(container);
    const { seriesToCategories, categoriesToSeries, seriesToCarClasses, carClassesToSeries, carClassesToCars, carsToCarClasses } = maps;

    // Each column is filtered by constraints from all OTHER columns that have selections.
    // We compute constraints independently from each direction and intersect them.

    // --- Visible Categories ---
    let visibleCategories = null;
    if (selected.seriesIds.size > 0) {
        visibleCategories = expand(selected.seriesIds, seriesToCategories);
    }
    if (selected.carClassIds.size > 0) {
        const fromCC = expandChain(selected.carClassIds, carClassesToSeries, seriesToCategories);
        visibleCategories = visibleCategories ? intersect(visibleCategories, fromCC) : fromCC;
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
    if (selected.carClassIds.size > 0) {
        const fromCC = expand(selected.carClassIds, carClassesToSeries);
        visibleSeries = visibleSeries ? intersect(visibleSeries, fromCC) : fromCC;
    }
    if (selected.carIds.size > 0) {
        const fromCar = expandChain(selected.carIds, carsToCarClasses, carClassesToSeries);
        visibleSeries = visibleSeries ? intersect(visibleSeries, fromCar) : fromCar;
    }

    // --- Visible Car Classes ---
    let visibleCarClasses = null;
    if (selected.categories.size > 0) {
        const fromCat = expand(selected.categories, categoriesToSeries);
        visibleCarClasses = expandSet(fromCat, seriesToCarClasses);
    }
    if (selected.seriesIds.size > 0) {
        const fromSeries = expand(selected.seriesIds, seriesToCarClasses);
        visibleCarClasses = visibleCarClasses ? intersect(visibleCarClasses, fromSeries) : fromSeries;
    }
    if (selected.carIds.size > 0) {
        const fromCar = expand(selected.carIds, carsToCarClasses);
        visibleCarClasses = visibleCarClasses ? intersect(visibleCarClasses, fromCar) : fromCar;
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
    if (selected.carClassIds.size > 0) {
        const fromCC = expand(selected.carClassIds, carClassesToCars);
        visibleCars = visibleCars ? intersect(visibleCars, fromCC) : fromCC;
    }

    // Apply visibility to all 4 columns (Track is always fully visible)
    applyColumnVisibility(container, 'cs-category', visibleCategories);
    applyColumnVisibility(container, 'cs-series', visibleSeries);
    applyColumnVisibility(container, 'cs-car-class', visibleCarClasses);
    applyColumnVisibility(container, 'cs-car', visibleCars);

    // Update counts
    updateCounts(container);
}

function getSelectedValues(container) {
    const categories = new Set();
    const seriesIds = new Set();
    const carClassIds = new Set();
    const carIds = new Set();
    const trackIds = new Set();

    container.querySelectorAll('input[data-group="cs-category"]:checked').forEach(el => {
        categories.add(el.value);
    });
    container.querySelectorAll('input[data-group="cs-series"]:checked').forEach(el => {
        seriesIds.add(Number(el.value));
    });
    container.querySelectorAll('input[data-group="cs-car-class"]:checked').forEach(el => {
        carClassIds.add(Number(el.value));
    });
    container.querySelectorAll('input[data-group="cs-car"]:checked').forEach(el => {
        carIds.add(Number(el.value));
    });
    container.querySelectorAll('input[data-group="cs-track"]:checked').forEach(el => {
        trackIds.add(Number(el.value));
    });

    return { categories, seriesIds, carClassIds, carIds, trackIds };
}

function applyColumnVisibility(container, groupName, visibleIds) {
    const column = container.querySelector(`[data-column="${groupName}"]`);
    if (!column) return;

    const items = column.querySelectorAll('.content-selector-item');
    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (!checkbox) return;

        if (visibleIds === null) {
            // No filter: show all
            item.classList.remove('filter-hidden');
        } else {
            const val = groupName === 'cs-category' ? checkbox.value : Number(checkbox.value);
            if (visibleIds.has(val)) {
                item.classList.remove('filter-hidden');
            } else {
                item.classList.add('filter-hidden');
                // Uncheck hidden items to prevent invalid selections
                if (checkbox.checked) {
                    checkbox.checked = false;
                }
            }
        }
    });
}

function updateCounts(container) {
    const groups = ['cs-category', 'cs-series', 'cs-car-class', 'cs-car', 'cs-track'];
    groups.forEach(group => {
        const count = container.querySelectorAll(`input[data-group="${group}"]:checked`).length;
        const countEl = container.querySelector(`[data-count="${group}"]`);
        if (countEl) {
            countEl.textContent = count > 0 ? count : '';
        }
    });
}

/**
 * Extracts the selected values from the content selector.
 * @returns {Object} { categories, series_ids, car_class_ids, car_ids, track_ids }
 */
export function getContentSelectorValues() {
    const container = document.getElementById('content-selector');
    if (!container) return { categories: [], series_ids: [], car_class_ids: [], car_ids: [], track_ids: [] };

    const mode = container.dataset.mode || 'normal';
    const selected = getSelectedValues(container);

    if (mode === 'event') {
        return {
            categories: [],
            series_ids: [],
            car_class_ids: [...selected.carClassIds],
            car_ids: [...selected.carIds],
            track_ids: [...selected.trackIds]
        };
    }

    return {
        categories: [...selected.categories],
        series_ids: [...selected.seriesIds],
        car_class_ids: [...selected.carClassIds],
        car_ids: [...selected.carIds],
        track_ids: [...selected.trackIds]
    };
}

// --- Utility functions ---

/** Expand a set of keys through a single map. Returns union of all mapped values. */
function expand(keys, map) {
    const result = new Set();
    for (const key of keys) {
        const vals = map.get(key);
        if (vals) vals.forEach(v => result.add(v));
    }
    return result;
}

/** Expand a computed set (not user-selected) through a map. */
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

function intersect(setA, setB) {
    const result = new Set();
    for (const item of setA) {
        if (setB.has(item)) {
            result.add(item);
        }
    }
    return result;
}
