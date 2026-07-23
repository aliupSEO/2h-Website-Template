export type VercelEnvTarget = 'production' | 'preview' | 'development';

export type VercelProject = {
    id: string;
    name: string;
    framework: string | null;
    createdAt: number;
    updatedAt: number;
    productionUrl: string | null;
};

export type VercelDeployment = {
    id: string;
    url: string | null;
    inspectorUrl: string | null;
    state: string;
    target: string | null;
    createdAt: number;
    branch: string | null;
    sha: string | null;
};

export type VercelEnvVar = {
    id: string;
    key: string;
    value: string | null;
    type: string;
    targets: VercelEnvTarget[];
    gitBranch: string | null;
    configured: boolean;
};

export type VercelProjectSummary = {
    latestDeployment: VercelDeployment | null;
    deploymentCount: number;
    envVarCount: number;
    /** True while either deployments or env count is still loading. */
    loading: boolean;
    loadingDeployment: boolean;
    loadingEnv: boolean;
    /** True when only a lightweight deployments sample was fetched for cards. */
    summaryOnly: boolean;
};

export type CreateProjectInput = {
    name: string;
    framework?: string;
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
