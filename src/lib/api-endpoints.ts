export const apiEndpoints = {
    github: {
        base: '/api/github',
        repos: (params?: { page?: number; perPage?: number }) => {
            const base = '/api/github/repos';
            if (!params?.page && !params?.perPage) return base;

            const search = new URLSearchParams();
            if (params.page) search.set('page', String(params.page));
            if (params.perPage) search.set('per_page', String(params.perPage));
            return `${base}?${search.toString()}`;
        },
        repo: (owner: string, repo: string) =>
            `/api/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    },
} as const;

export const isGitHubApiPath = (pathname: string) => {
    return pathname === '/api/github' ||
        pathname === '/api/github/repos' ||
        pathname.startsWith(`${apiEndpoints.github.base}/`);
};

export const parseGitHubRepoPath = (pathname: string) => {
    const match = pathname.match(/^\/api\/github\/repos\/([^/]+)\/([^/]+)\/?$/);
    if (!match) return null;

    return {
        owner: decodeURIComponent(match[1]!),
        repo: decodeURIComponent(match[2]!),
    };
};
