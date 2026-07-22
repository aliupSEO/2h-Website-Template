/** Ensure Vercel hostnames open as absolute URLs (not in-app relative paths). */
export const toVercelAbsoluteUrl = (hostOrUrl: string | null | undefined) => {
    if (!hostOrUrl?.trim()) return null;
    const value = hostOrUrl.trim();
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
};

export const formatVercelDate = (value: number) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatVercelDateTime = (value: number) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatVercelRelative = (value: number) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    const diffMs = Date.now() - date.getTime();
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diffMs < minute) return 'Just now';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
    if (diffMs < week) return `${Math.floor(diffMs / day)}d ago`;
    return formatVercelDate(value);
};
