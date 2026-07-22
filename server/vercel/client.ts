import { getVercelEnv, withTeamQuery } from './env.js';
import type {
    CreateEnvVarInput,
    CreateProjectInput,
    UpdateEnvVarInput,
    VercelDeploymentDto,
    VercelEnvTarget,
    VercelEnvVarDto,
    VercelProjectDto,
} from './types.js';

const VERCEL_API = 'https://api.vercel.com';

type VercelProjectRaw = {
    id: string;
    name: string;
    framework?: string | null;
    createdAt?: number;
    updatedAt?: number;
    targets?: {
        production?: {
            alias?: string | string[];
            url?: string;
        };
    };
    link?: { type?: string; repo?: string };
};

const toAbsoluteHttpUrl = (hostOrUrl: string | null | undefined): string | null => {
    if (!hostOrUrl?.trim()) return null;
    const value = hostOrUrl.trim();
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
};

const pickProductionUrl = (project: VercelProjectRaw): string | null => {
    const production = project.targets?.production;
    if (!production) return null;

    const alias = production.alias;
    const preferred = Array.isArray(alias)
        ? alias.find((value) => Boolean(value?.trim()))
        : alias;

    return toAbsoluteHttpUrl(preferred || production.url || null);
};

type VercelDeploymentRaw = {
    uid: string;
    url?: string | null;
    inspectorUrl?: string | null;
    state?: string;
    readyState?: string;
    target?: string | null;
    created?: number;
    createdAt?: number;
    meta?: {
        githubCommitRef?: string;
        githubCommitSha?: string;
        gitCommitRef?: string;
        gitCommitSha?: string;
    };
};

type VercelEnvRaw = {
    id: string;
    key: string;
    value?: string;
    type?: string;
    target?: VercelEnvTarget[];
    gitBranch?: string | null;
    configurationId?: string | null;
};

const mapProject = (project: VercelProjectRaw): VercelProjectDto => ({
    id: project.id,
    name: project.name,
    framework: project.framework ?? null,
    createdAt: project.createdAt ?? 0,
    updatedAt: project.updatedAt ?? 0,
    productionUrl: pickProductionUrl(project),
});

const mapDeployment = (deployment: VercelDeploymentRaw): VercelDeploymentDto => ({
    id: deployment.uid,
    url: deployment.url ? `https://${deployment.url}` : null,
    inspectorUrl: deployment.inspectorUrl ?? null,
    state: deployment.readyState ?? deployment.state ?? 'UNKNOWN',
    target: deployment.target ?? null,
    createdAt: deployment.created ?? deployment.createdAt ?? 0,
    branch:
        deployment.meta?.githubCommitRef ??
        deployment.meta?.gitCommitRef ??
        null,
    sha:
        deployment.meta?.githubCommitSha ??
        deployment.meta?.gitCommitSha ??
        null,
});

const mapEnvVar = (env: VercelEnvRaw): VercelEnvVarDto => {
    const isSecret =
        env.type === 'encrypted' ||
        env.type === 'secret' ||
        env.type === 'sensitive';

    return {
        id: env.id,
        key: env.key,
        value: isSecret ? null : env.value ?? null,
        type: env.type ?? 'plain',
        targets: env.target ?? [],
        gitBranch: env.gitBranch ?? null,
        configured: Boolean(env.configurationId) || !isSecret,
    };
};

const vercelFetch = async <T>(
    path: string,
    init?: RequestInit,
): Promise<T> => {
    const { token, teamId } = getVercelEnv();
    const response = await fetch(`${VERCEL_API}${withTeamQuery(path, teamId)}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    if (!response.ok) {
        let message = `Vercel API error (${response.status})`;
        try {
            const body = (await response.json()) as {
                error?: { message?: string };
                message?: string;
            };
            message = body.error?.message ?? body.message ?? message;
        }
        catch {
            // ignore parse errors
        }
        const error = new Error(message) as Error & { status?: number };
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
};

export const listProjects = async (): Promise<VercelProjectDto[]> => {
    const data = await vercelFetch<{ projects: VercelProjectRaw[] }>(
        '/v9/projects?limit=100',
    );
    return (data.projects ?? []).map(mapProject);
};

export const createProject = async (
    input: CreateProjectInput,
): Promise<VercelProjectDto> => {
    const body: Record<string, unknown> = {
        name: input.name.trim(),
        ...(input.framework ? { framework: input.framework } : {}),
    };

    if (input.gitRepository?.trim()) {
        body.gitRepository = {
            type: 'github',
            repo: input.gitRepository.trim(),
        };
    }

    const project = await vercelFetch<VercelProjectRaw>('/v9/projects', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return mapProject(project);
};

export const redeployDeployment = async (input: {
    projectName: string;
    deploymentId: string;
}): Promise<VercelDeploymentDto> => {
    const deployment = await vercelFetch<VercelDeploymentRaw>(
        '/v13/deployments',
        {
            method: 'POST',
            body: JSON.stringify({
                name: input.projectName,
                deploymentId: input.deploymentId,
            }),
        },
    );
    return mapDeployment(deployment);
};

export const listDeployments = async (
    projectId: string,
    limit = 50,
): Promise<VercelDeploymentDto[]> => {
    const data = await vercelFetch<{ deployments: VercelDeploymentRaw[] }>(
        `/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=${limit}`,
    );
    return (data.deployments ?? []).map(mapDeployment);
};

export const listEnvVars = async (
    projectId: string,
): Promise<VercelEnvVarDto[]> => {
    const data = await vercelFetch<{ envs: VercelEnvRaw[] }>(
        `/v9/projects/${encodeURIComponent(projectId)}/env`,
    );
    return (data.envs ?? []).map(mapEnvVar);
};

export const createEnvVar = async (
    projectId: string,
    input: CreateEnvVarInput,
): Promise<VercelEnvVarDto> => {
    const env = await vercelFetch<VercelEnvRaw>(
        `/v9/projects/${encodeURIComponent(projectId)}/env`,
        {
            method: 'POST',
            body: JSON.stringify({
                key: input.key.trim(),
                value: input.value,
                type: 'encrypted',
                target: input.targets,
            }),
        },
    );
    return mapEnvVar(env);
};

export const updateEnvVar = async (
    projectId: string,
    envId: string,
    input: UpdateEnvVarInput,
): Promise<VercelEnvVarDto> => {
    const env = await vercelFetch<VercelEnvRaw>(
        `/v9/projects/${encodeURIComponent(projectId)}/env/${encodeURIComponent(envId)}`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                ...(input.key !== undefined ? { key: input.key.trim() } : {}),
                ...(input.value !== undefined ? { value: input.value } : {}),
                ...(input.targets !== undefined ? { target: input.targets } : {}),
            }),
        },
    );
    return mapEnvVar(env);
};

export const deleteEnvVar = async (
    projectId: string,
    envId: string,
): Promise<void> => {
    await vercelFetch<void>(
        `/v9/projects/${encodeURIComponent(projectId)}/env/${encodeURIComponent(envId)}`,
        { method: 'DELETE' },
    );
};
