// Formatting utilities

export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatRelativeTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return formatDate(dateString);
}

export function formatIRating(irating) {
    if (!irating && irating !== 0) return '-';
    return irating.toLocaleString();
}

export function formatLicenseLevel(level) {
    if (!level) return '-';
    // Format: "A 4.99" or "R 2.00"
    return level.toUpperCase();
}

export function getLicenseClass(level) {
    if (!level) return '';
    const letter = level.charAt(0).toUpperCase();
    return `license-${letter}`;
}

export function formatCategory(category) {
    if (!category) return '';
    const labels = {
        sports_car: 'Sports Car',
        formula: 'Formula Car',
        oval: 'Oval',
        dirt_road: 'Dirt Road',
        dirt_oval: 'Dirt Oval'
    };
    return labels[category] || category;
}

export function getCategoryClass(category) {
    if (!category) return '';
    return `category-${category}`;
}

export function formatStatus(status) {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getStatusClass(status) {
    if (!status) return '';
    return `status-${status}`;
}

export function truncate(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

export function pluralize(count, singular, plural = null) {
    if (count === 1) return singular;
    return plural || singular + 's';
}

export function toISOLocal(date) {
    if (!date) return '';
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
}

export function fromISOLocal(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toISOString();
}
