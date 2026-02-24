// Application card component
import { escapeHtml } from '../utils/dom.js';
import { formatRelativeTime, formatStatus, getStatusClass } from '../utils/format.js';

const STATUS_CONFIG = {
    pending: {
        cardClass: 'application-card--pending',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
               </svg>`,
        label: 'Pending review',
        labelClass: 'application-status-label--pending',
    },
    accepted: {
        cardClass: 'application-card--accepted',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
               </svg>`,
        label: 'Accepted',
        labelClass: 'application-status-label--accepted',
    },
    rejected: {
        cardClass: 'application-card--rejected',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
               </svg>`,
        label: 'Rejected',
        labelClass: 'application-status-label--rejected',
    },
};

export function renderApplicationCard(application, showPost = false, showActions = false) {
    const included = application.included || {};
    const applicant = included.applicant;
    const post = included.post;
    const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;

    return `
        <div class="application-card ${config.cardClass}" data-application-id="${application.id}">
            <!-- Header: avatar + name + time -->
            <div class="flex items-center gap-3 mb-3">
                ${applicant ? `
                    <div class="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center flex-shrink-0">
                        <span class="text-sm font-semibold text-brand-600">
                            ${applicant.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <a href="#/users/${applicant.id}" class="font-semibold text-content-primary hover:text-brand-600 transition-colors text-sm">
                            ${escapeHtml(applicant.username)}
                        </a>
                        <p class="text-xs text-content-muted">${formatRelativeTime(application.created_at)}</p>
                    </div>
                ` : `
                    <div class="text-content-muted text-sm">Unknown applicant</div>
                `}
            </div>

            ${application.message ? `
                <p class="text-sm text-content-secondary mb-4 whitespace-pre-wrap leading-relaxed">${escapeHtml(application.message)}</p>
            ` : ''}

            ${showPost && post ? `
                <div class="bg-surface-50 rounded-lg p-3 mb-4 border border-surface-200 flex items-center justify-between gap-2">
                    <a href="#/posts/${post.id}" class="text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors min-w-0 truncate">
                        ${escapeHtml(post.title)}
                    </a>
                    ${application.status === 'accepted' ? `
                        <a href="#/my-teams/${post.id}" class="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors whitespace-nowrap">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Team Space
                        </a>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Footer: current status (left) + actions (right) -->
            <div class="flex items-center justify-between pt-3 border-t ${config.cardClass === 'application-card--accepted' ? 'border-green-200' : config.cardClass === 'application-card--rejected' ? 'border-red-200' : 'border-surface-200'}">
                <span class="application-status-label ${config.labelClass}">
                    ${config.icon}
                    ${config.label}
                </span>

                ${showActions ? `
                    <div class="flex gap-2">
                        ${application.status === 'pending' ? `
                            <button class="accept-application-btn btn-success-outline text-xs font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                                data-post-id="${application.post_id}" data-application-id="${application.id}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                                </svg>
                                Accept
                            </button>
                            <button class="reject-application-btn btn-danger-outline text-xs font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                                data-post-id="${application.post_id}" data-application-id="${application.id}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Reject
                            </button>
                        ` : application.status === 'accepted' ? `
                            <button class="reject-application-btn btn-danger-outline text-xs font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                                data-post-id="${application.post_id}" data-application-id="${application.id}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Reject
                            </button>
                            <button class="pending-application-btn btn-secondary text-xs font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                                data-post-id="${application.post_id}" data-application-id="${application.id}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                                </svg>
                                Undo
                            </button>
                        ` : application.status === 'rejected' ? `
                            <button class="accept-application-btn btn-success-outline text-xs font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                                data-post-id="${application.post_id}" data-application-id="${application.id}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                                </svg>
                                Accept
                            </button>
                            <button class="pending-application-btn btn-secondary text-xs font-medium py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                                data-post-id="${application.post_id}" data-application-id="${application.id}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                                </svg>
                                Undo
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

export function renderApplicationsList(applications, showPost = false, showActions = false) {
    if (!applications || applications.length === 0) {
        return `
            <div class="text-center py-8 text-content-muted">
                No applications yet.
            </div>
        `;
    }

    return applications.map(app => renderApplicationCard(app, showPost, showActions)).join('');
}
