import type {
    CreateEnvVarInput,
    CreateProjectInput,
    UpdateEnvVarInput,
    VercelDeployment,
    VercelEnvVar,
    VercelProject,
} from '@/features/vercel/types';
import { apiEndpoints } from '@/lib/api-endpoints';

const parseError = async (response: Response) => {
    try {
        const body = (await response.json()) as { error?: string };
        if (body.error) return body.error;
    }
    catch {
        // ignore
    }
    return `Request failed (${response.status})`;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(await parseError(response));
    }

    return (await response.json()) as T;
};

export const vercelService = {
    listProjects: async (): Promise<VercelProject[]> => {
        const data = await request<{ projects: VercelProject[] }>(
            apiEndpoints.vercel.projects,
        );
        return data.projects;
    },

    createProject: async (input: CreateProjectInput): Promise<VercelProject> => {
        const data = await request<{ project: VercelProject }>(
            apiEndpoints.vercel.projects,
            {
                method: 'POST',
                body: JSON.stringify(input),
            },
        );
        return data.project;
    },

    listDeployments: async (
        projectId: string,
        options?: { limit?: number },
    ): Promise<VercelDeployment[]> => {
        const params =
            options?.limit !== undefined
                ? `?limit=${encodeURIComponent(String(options.limit))}`
                : '';
        const data = await request<{ deployments: VercelDeployment[] }>(
            `${apiEndpoints.vercel.projectDeployments(projectId)}${params}`,
        );
        return data.deployments;
    },

    listEnvVars: async (projectId: string): Promise<VercelEnvVar[]> => {
        const data = await request<{ envVars: VercelEnvVar[] }>(
            apiEndpoints.vercel.projectEnv(projectId),
        );
        return data.envVars;
    },

    /** Lightweight env count for project cards (no secret payloads). */
    countEnvVars: async (projectId: string): Promise<number> => {
        const data = await request<{ count: number }>(
            `${apiEndpoints.vercel.projectEnv(projectId)}?countOnly=1`,
        );
        return data.count;
    },

    createEnvVar: async (
        projectId: string,
        input: CreateEnvVarInput,
    ): Promise<VercelEnvVar> => {
        const data = await request<{ envVar: VercelEnvVar }>(
            apiEndpoints.vercel.projectEnv(projectId),
            {
                method: 'POST',
                body: JSON.stringify(input),
            },
        );
        return data.envVar;
    },

    updateEnvVar: async (
        projectId: string,
        envId: string,
        input: UpdateEnvVarInput,
    ): Promise<VercelEnvVar> => {
        const data = await request<{ envVar: VercelEnvVar }>(
            apiEndpoints.vercel.projectEnvVar(projectId, envId),
            {
                method: 'PATCH',
                body: JSON.stringify(input),
            },
        );
        return data.envVar;
    },

    deleteEnvVar: async (projectId: string, envId: string): Promise<void> => {
        await request<{ deleted: true }>(
            apiEndpoints.vercel.projectEnvVar(projectId, envId),
            { method: 'DELETE' },
        );
    },

    redeploy: async (
        deploymentId: string,
        projectName: string,
    ): Promise<VercelDeployment> => {
        const data = await request<{ deployment: VercelDeployment }>(
            apiEndpoints.vercel.redeploy(deploymentId),
            {
                method: 'POST',
                body: JSON.stringify({ projectName }),
            },
        );
        return data.deployment;
    },

    getWebhookState: async (): Promise<{
        events: Array<{
            id: string;
            type: string;
            createdAt: number;
            projectId: string | null;
        }>;
        dirtyProjectIds: string[];
        projectsListDirty: boolean;
    }> => {
        return request(apiEndpoints.vercel.webhookState);
    },

    clearWebhookDirty: async (input: {
        projectIds?: string[];
        projectsList?: boolean;
    }): Promise<void> => {
        await request(apiEndpoints.vercel.webhookState, {
            method: 'POST',
            body: JSON.stringify(input),
        });
    },
};
