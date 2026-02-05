// Post card component
import { escapeHtml } from '../utils/dom.js';
import { formatRelativeTime, formatCategory, getCategoryClass, formatStatus, getStatusClass, formatIRating, formatLicenseLevel, getLicenseClass, formatDateTime } from '../utils/format.js';

export function renderPostCard(post) {
    const included = post.included || {};

    const categoryLabel = formatCategory(post.category);
    const categoryClass = getCategoryClass(post.category);
    const statusLabel = formatStatus(post.status);
    const statusClass = getStatusClass(post.status);
    const licenseClass = getLicenseClass(post.min_license_level);

    const seriesName = included.series?.name || '';
    const trackName = included.track?.name || '';

    return `
        <article class="post-card p-5 cursor-pointer" data-post-id="${post.id}">
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded-md text-xs font-medium ${categoryClass}">
                        ${categoryLabel}
                    </span>
                    <span class="px-2 py-1 rounded-md text-xs font-medium ${statusClass}">
                        ${statusLabel}
                    </span>
                </div>
                <span class="text-content-muted text-sm">${formatRelativeTime(post.created_at)}</span>
            </div>

            <h3 class="text-base font-semibold text-content-primary mb-2 hover:text-brand-600 transition-colors">
                ${escapeHtml(post.title)}
            </h3>

            <p class="text-content-secondary text-sm mb-4 line-clamp-2">
                ${escapeHtml(post.body).substring(0, 150)}${post.body.length > 150 ? '...' : ''}
            </p>

            <div class="flex flex-wrap gap-4 text-sm text-content-secondary mb-4">
                ${seriesName ? `
                    <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                        <span>${escapeHtml(seriesName)}</span>
                    </div>
                ` : ''}
                ${trackName ? `
                    <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>${escapeHtml(trackName)}</span>
                    </div>
                ` : ''}
            </div>

            <div class="flex flex-wrap items-center gap-4 pt-3 border-t border-surface-200">
                <div class="flex items-center gap-1.5">
                    <span class="text-content-muted text-xs">iRating:</span>
                    <span class="text-content-primary text-sm font-medium">${formatIRating(post.min_irating)}+</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <span class="text-content-muted text-xs">License:</span>
                    <span class="px-1.5 py-0.5 rounded text-xs font-medium ${licenseClass}">
                        ${formatLicenseLevel(post.min_license_level)}+
                    </span>
                </div>
                <div class="flex items-center gap-1.5">
                    <span class="text-content-muted text-xs">Slots:</span>
                    <span class="text-content-primary text-sm font-medium">${post.slots_total}</span>
                </div>
                ${post.event_start_at ? `
                    <div class="flex items-center gap-1.5 ml-auto">
                        <svg class="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span class="text-content-secondary text-sm">${formatDateTime(post.event_start_at)}</span>
                    </div>
                ` : ''}
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
