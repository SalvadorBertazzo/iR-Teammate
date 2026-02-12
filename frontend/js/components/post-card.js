// Post card component
import { escapeHtml } from '../utils/dom.js';
import { formatRelativeTime, formatCategory, getCategoryClass, formatStatus, getStatusClass, formatIRating, formatLicenseLevel, getLicenseClass, formatDateTime } from '../utils/format.js';

export function renderPostCard(post) {
    const included = post.included || {};

    const statusLabel = formatStatus(post.status);
    const statusClass = getStatusClass(post.status);
    const licenseClass = getLicenseClass(post.min_license_level);

    // Multi-select categories
    const categories = post.categories && post.categories.length > 0
        ? post.categories
        : (post.category ? [post.category] : []);

    // Multi-select display
    const series = included.all_series || (included.series ? [included.series] : []);
    const tracks = included.tracks || (included.track ? [included.track] : []);
    const languages = included.languages || [];

    const isSpecialEvent = !!post.event_id || !!included.event;

    const categoryBadges = categories.map(cat => {
        const label = formatCategory(cat);
        const cls = getCategoryClass(cat);
        return `<span class="px-2 py-0.5 rounded-md text-xs font-medium ${cls}">${label}</span>`;
    }).join('');

    return `
        <article class="post-card p-5 cursor-pointer" data-post-id="${post.id}">
            <!-- Header: badges + stats + time -->
            <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2 flex-wrap">
                    ${isSpecialEvent ? `
                        <span class="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">Special Event</span>
                    ` : ''}
                    ${categoryBadges}
                    <span class="px-2 py-0.5 rounded-md text-xs font-medium ${statusClass}">
                        ${statusLabel}
                    </span>
                    <span class="text-content-muted text-xs mx-0.5 hidden sm:inline">·</span>
                    <div class="hidden sm:flex items-center gap-3">
                        <span class="text-content-primary text-xs font-semibold">${formatIRating(post.min_irating)}+ iR</span>
                        <span class="px-1.5 py-0.5 rounded text-xs font-medium ${licenseClass}">
                            ${formatLicenseLevel(post.min_license_level)}+
                        </span>
                        <span class="text-content-secondary text-xs">${post.slots_total} slot${post.slots_total !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <span class="text-content-muted text-xs flex-shrink-0">${formatRelativeTime(post.created_at)}</span>
            </div>

            <!-- Title -->
            <h3 class="text-base font-semibold text-content-primary mb-1.5 hover:text-brand-600 transition-colors">
                ${escapeHtml(post.title)}
            </h3>

            <!-- Body -->
            <p class="text-content-secondary text-sm mb-3 line-clamp-2">
                ${escapeHtml(post.body).substring(0, 200)}${post.body.length > 200 ? '...' : ''}
            </p>

            <!-- Bottom: series/track/languages + event date -->
            <div class="flex items-end justify-between gap-4 flex-wrap">
                <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-content-secondary">
                    ${included.event ? `
                        <div class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            </svg>
                            <span class="text-purple-700 font-medium">${escapeHtml(included.event.name)}</span>
                        </div>
                    ` : ''}
                    ${series.length > 0 ? `
                        <div class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-content-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                            <span>${series.map(s => escapeHtml(s.name)).join(', ')}</span>
                        </div>
                    ` : ''}
                    ${tracks.length > 0 ? `
                        <div class="flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5 text-content-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span>${tracks.map(t => escapeHtml(t.name)).join(', ')}</span>
                        </div>
                    ` : ''}
                    ${languages.length > 0 ? `
                        <div class="flex items-center gap-1">
                            ${languages.map(l => `
                                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-100 text-content-muted">
                                    ${escapeHtml(l.name)}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                ${post.event_start_at ? `
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <svg class="w-3.5 h-3.5 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span class="text-content-secondary text-xs">${formatDateTime(post.event_start_at)}</span>
                    </div>
                ` : ''}
            </div>

            <!-- Mobile stats row (hidden on sm+) -->
            <div class="sm:hidden flex flex-wrap items-center gap-3 pt-3 border-t border-surface-200 mt-3">
                <span class="text-content-primary text-xs font-semibold">${formatIRating(post.min_irating)}+ iR</span>
                <span class="px-1.5 py-0.5 rounded text-xs font-medium ${licenseClass}">
                    ${formatLicenseLevel(post.min_license_level)}+
                </span>
                <span class="text-content-secondary text-xs">${post.slots_total} slot${post.slots_total !== 1 ? 's' : ''}</span>
            </div>
        </article>
    `;
}

export function attachPostCardListeners(container) {
    container.addEventListener('click', (e) => {
        const card = e.target.closest('[data-post-id]');
        if (card) {
            const postId = card.dataset.postId;
            window.location.hash = `/posts/${postId}`;
        }
    });
}
