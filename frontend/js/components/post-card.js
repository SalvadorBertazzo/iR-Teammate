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
    const carClasses = included.car_classes || (included.car_class ? [included.car_class] : []);
    const cars = included.cars || [];

    const isSpecialEvent = !!post.event_id || !!included.event;

    const categoryBadges = categories.map(cat => {
        const label = formatCategory(cat);
        const cls = getCategoryClass(cat);
        return `<span class="px-2.5 py-1 rounded-md text-xs font-semibold ${cls}">${label}</span>`;
    }).join('');

    return `
        <article class="post-card cursor-pointer" data-post-id="${post.id}">

            <!-- ── Content area ── -->
            <div class="px-5 pt-4 pb-3">

                <!-- Row 1: badges + status + time -->
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex flex-wrap items-center gap-1.5">
                        ${isSpecialEvent ? `
                            <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">Special Event</span>
                        ` : ''}
                        ${categoryBadges}
                    </div>
                    <span class="text-content-muted text-xs flex-shrink-0">
                        ${formatRelativeTime(post.created_at)}
                    </span>
                </div>

                <!-- Title -->
                <h3 class="font-bold text-content-primary mb-2 leading-snug hover:text-brand-600 transition-colors text-base">
                    ${escapeHtml(post.title)}
                </h3>

                <!-- Body preview -->
                <p class="text-content-secondary text-sm line-clamp-2 leading-relaxed">
                    ${escapeHtml(post.body).substring(0, 220)}${post.body.length > 220 ? '…' : ''}
                </p>
            </div>

            <!-- ── Footer metadata strip ── -->
            <div class="post-card-footer px-5 py-3 flex items-center justify-between gap-4">

                <!-- Left: racing context -->
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-content-secondary min-w-0">
                    ${included.event ? `
                        <span class="flex items-center gap-1.5 text-purple-600 font-medium">
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            </svg>
                            <span class="truncate max-w-[130px]">${escapeHtml(included.event.name)}</span>
                        </span>
                    ` : ''}
                    ${series.length > 0 ? `
                        <span class="flex items-center gap-1.5 truncate max-w-[180px]">
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                            <span class="truncate">${series.map(s => escapeHtml(s.name)).join(', ')}</span>
                        </span>
                    ` : ''}
                    ${carClasses.length > 0 ? `
                        <span class="flex items-center gap-1.5 truncate max-w-[160px]">
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                            </svg>
                            <span class="truncate">${carClasses.map(c => escapeHtml(c.name)).join(', ')}</span>
                        </span>
                    ` : ''}
                    ${cars.length > 0 ? `
                        <span class="flex items-center gap-1.5 truncate max-w-[180px]">
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                            </svg>
                            <span class="truncate">${cars.map(c => escapeHtml(c.name)).join(', ')}</span>
                        </span>
                    ` : ''}
                    ${tracks.length > 0 ? `
                        <span class="flex items-center gap-1.5 truncate max-w-[160px]">
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span class="truncate">${tracks.map(t => escapeHtml(t.name)).join(', ')}</span>
                        </span>
                    ` : ''}
                    ${languages.length > 0 ? `
                        <span class="flex items-center gap-1">
                            ${languages.map(l => `<span class="px-2 py-0.5 rounded text-xs font-medium bg-surface-200 text-content-muted">${escapeHtml(l.name)}</span>`).join('')}
                        </span>
                    ` : ''}
                    ${post.event_start_at ? `
                        <span class="flex items-center gap-1.5 text-amber-600 font-medium">
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            ${formatDateTime(post.event_start_at)}
                        </span>
                    ` : ''}
                </div>

                <!-- Right: iRating + license + slots -->
                <div class="flex items-center gap-2.5 flex-shrink-0">
                    <span class="text-sm font-bold text-brand-600 tabular-nums">
                        ${formatIRating(post.min_irating)}+ iR
                    </span>
                    <span class="w-px h-4 bg-surface-300 flex-shrink-0"></span>
                    <span class="px-2 py-0.5 rounded text-xs font-bold ${licenseClass}">
                        ${formatLicenseLevel(post.min_license_level)}+
                    </span>
                    <span class="w-px h-4 bg-surface-300 flex-shrink-0"></span>
                    <span class="text-sm text-content-muted">
                        ${post.slots_total} slot${post.slots_total !== 1 ? 's' : ''}
                    </span>
                </div>
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
