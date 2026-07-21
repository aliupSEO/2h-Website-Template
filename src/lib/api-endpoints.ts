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
    vercel: {
        base: '/api/vercel',
        projects: '/api/vercel/projects',
        projectDeployments: (projectId: string) =>
            `/api/vercel/projects/${encodeURIComponent(projectId)}/deployments`,
        projectEnv: (projectId: string) =>
            `/api/vercel/projects/${encodeURIComponent(projectId)}/env`,
        projectEnvVar: (projectId: string, envId: string) =>
            `/api/vercel/projects/${encodeURIComponent(projectId)}/env/${encodeURIComponent(envId)}`,
        redeploy: (deploymentId: string) =>
            `/api/vercel/deployments/${encodeURIComponent(deploymentId)}/redeploy`,
        webhookState: '/api/vercel/webhook-state',
    },
    firebase: {
        base: '/api/firebase',
        status: '/api/firebase/status',
        projects: '/api/firebase/projects',
        availableProjects: '/api/firebase/available-projects',
        project: (projectId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}`,
        projectApps: (projectId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}/apps`,
        projectWebApps: (projectId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}/apps/web`,
        projectApp: (projectId: string, appId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}/apps/${encodeURIComponent(appId)}`,
        projectAppConfig: (projectId: string, appId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}/apps/${encodeURIComponent(appId)}/config`,
        projectAuthConfig: (projectId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}/auth/config`,
        projectAuthProviders: (projectId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}/auth/providers`,
        projectAuthProvider: (projectId: string, idpId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}/auth/providers/${encodeURIComponent(idpId)}`,
        projectFirestoreEnable: (projectId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}/firestore/enable`,
        projectStorageEnable: (projectId: string) =>
            `/api/firebase/projects/${encodeURIComponent(projectId)}/storage/enable`,
    },
    webhooks: {
        vercel: '/api/webhooks/vercel',
    },
} as const;

export const isGitHubApiPath = (pathname: string) => {
    return pathname === '/api/github' ||
        pathname === '/api/github/repos' ||
        pathname.startsWith(`${apiEndpoints.github.base}/`);
};

export const isVercelApiPath = (pathname: string) => {
    return pathname === '/api/vercel' ||
        pathname === '/api/vercel/projects' ||
        pathname === '/api/vercel/webhook-state' ||
        pathname.startsWith(`${apiEndpoints.vercel.base}/`);
};

export const isFirebaseApiPath = (pathname: string) => {
    return pathname === '/api/firebase' ||
        pathname === '/api/firebase/status' ||
        pathname === '/api/firebase/projects' ||
        pathname === '/api/firebase/available-projects' ||
        pathname.startsWith(`${apiEndpoints.firebase.base}/`);
};

export const isVercelWebhookPath = (pathname: string) => {
    return pathname === apiEndpoints.webhooks.vercel ||
        pathname === `${apiEndpoints.webhooks.vercel}/`;
};

export const parseGitHubRepoPath = (pathname: string) => {
    const match = pathname.match(/^\/api\/github\/repos\/([^/]+)\/([^/]+)\/?$/);
    if (!match) return null;

    return {
        owner: decodeURIComponent(match[1]!),
        repo: decodeURIComponent(match[2]!),
    };
};

export const parseVercelProjectDeploymentsPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/vercel\/projects\/([^/]+)\/deployments\/?$/,
    );
    if (!match) return null;

    return { projectId: decodeURIComponent(match[1]!) };
};

export const parseVercelEnvPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/vercel\/projects\/([^/]+)\/env(?:\/([^/]+))?\/?$/,
    );
    if (!match) return null;

    return {
        projectId: decodeURIComponent(match[1]!),
        envId: match[2] ? decodeURIComponent(match[2]) : null,
    };
};

export const parseVercelRedeployPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/vercel\/deployments\/([^/]+)\/redeploy\/?$/,
    );
    if (!match) return null;
    return { deploymentId: decodeURIComponent(match[1]!) };
};

export const parseFirebaseProjectPath = (pathname: string) => {
    const match = pathname.match(/^\/api\/firebase\/projects\/([^/]+)\/?$/);
    if (!match) return null;
    return { projectId: decodeURIComponent(match[1]!) };
};

export const parseFirebaseAppsPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/firebase\/projects\/([^/]+)\/apps\/?$/,
    );
    if (!match) return null;
    return { projectId: decodeURIComponent(match[1]!) };
};

export const parseFirebaseWebAppsPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/firebase\/projects\/([^/]+)\/apps\/web\/?$/,
    );
    if (!match) return null;
    return { projectId: decodeURIComponent(match[1]!) };
};

export const parseFirebaseAppPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/firebase\/projects\/([^/]+)\/apps\/([^/]+)\/?$/,
    );
    if (!match) return null;
    const appId = decodeURIComponent(match[2]!);
    if (appId === 'web') return null;
    return {
        projectId: decodeURIComponent(match[1]!),
        appId,
    };
};

export const parseFirebaseAppConfigPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/firebase\/projects\/([^/]+)\/apps\/([^/]+)\/config\/?$/,
    );
    if (!match) return null;
    return {
        projectId: decodeURIComponent(match[1]!),
        appId: decodeURIComponent(match[2]!),
    };
};

export const parseFirebaseAuthConfigPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/firebase\/projects\/([^/]+)\/auth\/config\/?$/,
    );
    if (!match) return null;
    return { projectId: decodeURIComponent(match[1]!) };
};

export const parseFirebaseAuthProvidersPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/firebase\/projects\/([^/]+)\/auth\/providers\/?$/,
    );
    if (!match) return null;
    return { projectId: decodeURIComponent(match[1]!) };
};

export const parseFirebaseAuthProviderPath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/firebase\/projects\/([^/]+)\/auth\/providers\/([^/]+)\/?$/,
    );
    if (!match) return null;
    return {
        projectId: decodeURIComponent(match[1]!),
        idpId: decodeURIComponent(match[2]!),
    };
};

export const parseFirebaseFirestoreEnablePath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/firebase\/projects\/([^/]+)\/firestore\/enable\/?$/,
    );
    if (!match) return null;
    return { projectId: decodeURIComponent(match[1]!) };
};

export const parseFirebaseStorageEnablePath = (pathname: string) => {
    const match = pathname.match(
        /^\/api\/firebase\/projects\/([^/]+)\/storage\/enable\/?$/,
    );
    if (!match) return null;
    return { projectId: decodeURIComponent(match[1]!) };
};
