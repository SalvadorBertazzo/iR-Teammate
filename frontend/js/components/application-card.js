// Application card component
import { escapeHtml } from '../utils/dom.js';
import { formatRelativeTime, formatStatus, getStatusClass } from '../utils/format.js';

export function renderApplicationCard(application, showPost = false, showActions = false) {
    const included = application.included || {};
    const applicant = included.applicant;
    const post = included.post;
    const statusClass = getStatusClass(application.status);
    const statusLabel = formatStatus(application.status);

    return `
        <div class="bg-white rounded-xl p-4 border border-surface-200 shadow-soft" data-application-id="${application.id}">
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                    ${applicant ? `
                        <div class="w-10 h-10 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center">
                            <span class="text-lg font-medium text-brand-600">
                                ${applicant.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <a href="#/users/${applicant.id}" class="font-medium text-content-primary hover:text-brand-600 transition-colors">
                                ${escapeHtml(applicant.username)}
                            </a>
                            <p class="text-sm text-content-muted">${formatRelativeTime(application.created_at)}</p>
                        </div>
                    ` : `
                        <div class="text-content-muted">Applicant</div>
                    `}
                </div>
                <span class="px-2.5 py-1 rounded-md text-xs font-medium ${statusClass}">
                    ${statusLabel}
                </span>
            </div>

            ${application.message ? `
                <p class="text-content-secondary mb-3 whitespace-pre-wrap">${escapeHtml(application.message)}</p>
            ` : ''}

            ${showPost && post ? `
                <div class="bg-surface-50 rounded-lg p-3 mb-3 border border-surface-200">
                    <a href="#/posts/${post.id}" class="text-brand-600 hover:text-brand-700 font-medium transition-colors">
                        ${escapeHtml(post.title)}
                    </a>
                </div>
            ` : ''}

            ${showActions && application.status === 'pending' ? `
                <div class="flex gap-2 pt-3 border-t border-surface-200">
                    <button class="accept-application-btn flex-1 btn-success font-medium py-2 px-4 rounded-lg"
                        data-post-id="${application.post_id}" data-application-id="${application.id}">
                        Accept
                    </button>
                    <button class="reject-application-btn flex-1 btn-danger font-medium py-2 px-4 rounded-lg"
                        data-post-id="${application.post_id}" data-application-id="${application.id}">
                        Reject
                    </button>
                </div>
            ` : ''}
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
