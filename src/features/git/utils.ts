export const formatRepoUpdatedAt = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatRepoRelativeUpdatedAt = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    const diffMs = Date.now() - date.getTime();
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diffMs < minute) return 'Just now';
    if (diffMs < hour) {
        const mins = Math.floor(diffMs / minute);
        return `${mins}m ago`;
    }
    if (diffMs < day) {
        const hours = Math.floor(diffMs / hour);
        return `${hours}h ago`;
    }
    if (diffMs < week) {
        const days = Math.floor(diffMs / day);
        return `${days}d ago`;
    }

    return formatRepoUpdatedAt(value);
};

export const getRepoOwnerInitial = (owner: string) => {
    const trimmed = owner.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
};
