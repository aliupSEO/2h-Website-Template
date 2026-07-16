export type VercelApiErrorBody = {
    error: string;
    status: number;
};

export type VercelProjectDto = {
    id: string;
    name: string;
    framework: string | null;
    createdAt: number;
    updatedAt: number;
    productionUrl: string | null;
};

export type VercelDeploymentDto = {
    id: string;
    url: string | null;
    inspectorUrl: string | null;
    state: string;
    target: string | null;
    createdAt: number;
    branch: string | null;
    sha: string | null;
};

export type VercelEnvTarget = 'production' | 'preview' | 'development';

export type VercelEnvVarDto = {
    id: string;
    key: string;
    value: string | null;
    type: string;
    targets: VercelEnvTarget[];
    gitBranch: string | null;
    configured: boolean;
};

export type CreateProjectInput = {
    name: string;
    framework?: string;
    /** GitHub repo in `owner/name` form — imports and links the project */
    gitRepository?: string;
};

export type CreateEnvVarInput = {
    key: string;
    value: string;
    targets: VercelEnvTarget[];
};

export type UpdateEnvVarInput = {
    key?: string;
    value?: string;
    targets?: VercelEnvTarget[];
};

export type VercelWebhookEvent = {
    id: string;
    type: string;
    createdAt: number;
    projectId: string | null;
    payload: unknown;
};
