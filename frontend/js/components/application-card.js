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
        <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm" data-application-id="${application.id}">
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                    ${applicant ? `
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span class="text-lg font-medium text-gray-600">
                                ${applicant.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <a href="#/users/${applicant.id}" class="font-medium text-gray-900 hover:text-blue-600">
                                ${escapeHtml(applicant.username)}
                            </a>
                            <p class="text-sm text-gray-400">${formatRelativeTime(application.created_at)}</p>
                        </div>
                    ` : `
                        <div class="text-gray-500">Applicant</div>
                    `}
                </div>
                <span class="px-2 py-1 rounded text-xs font-medium ${statusClass}">
                    ${statusLabel}
                </span>
            </div>

            ${application.message ? `
                <p class="text-gray-700 mb-3 whitespace-pre-wrap">${escapeHtml(application.message)}</p>
            ` : ''}

            ${showPost && post ? `
                <div class="bg-gray-50 rounded-md p-3 mb-3">
                    <a href="#/posts/${post.id}" class="text-blue-600 hover:text-blue-700 font-medium">
                        ${escapeHtml(post.title)}
                    </a>
                </div>
            ` : ''}

            ${showActions && application.status === 'pending' ? `
                <div class="flex gap-2 pt-3 border-t border-gray-100">
                    <button class="accept-application-btn flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        data-post-id="${application.post_id}" data-application-id="${application.id}">
                        Accept
                    </button>
                    <button class="reject-application-btn flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
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
            <div class="text-center py-8 text-gray-400">
                No applications yet.
            </div>
        `;
    }

    return applications.map(app => renderApplicationCard(app, showPost, showActions)).join('');
}
