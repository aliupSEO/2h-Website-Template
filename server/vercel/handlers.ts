import {
    countEnvVars,
    createEnvVar,
    createProject,
    deleteEnvVar,
    listDeployments,
    listEnvVars,
    listProjects,
    redeployDeployment,
    updateEnvVar,
} from './client.js';
import type {
    CreateEnvVarInput,
    CreateProjectInput,
    UpdateEnvVarInput,
    VercelApiErrorBody,
    VercelDeploymentDto,
    VercelEnvTarget,
    VercelEnvVarDto,
    VercelProjectDto,
} from './types.js';

export type HandlerResult<T> =
    | { ok: true; data: T; status: number }
    | { ok: false; body: VercelApiErrorBody; status: number };

const projectNamePattern = /^[a-z0-9][a-z0-9._-]*$/i;
const envTargets: VercelEnvTarget[] = ['production', 'preview', 'development'];

const toError = (error: unknown): VercelApiErrorBody => {
    if (error instanceof Error) {
        const status =
            'status' in error && typeof error.status === 'number'
                ? error.status
                : 500;
        return { error: error.message, status };
    }
    return { error: 'Unexpected server error', status: 500 };
};

const parseTargets = (value: unknown): VercelEnvTarget[] | string => {
    if (!Array.isArray(value) || value.length === 0) {
        return 'Select at least one environment';
    }

    const targets = value.filter(
        (item): item is VercelEnvTarget =>
            typeof item === 'string' && envTargets.includes(item as VercelEnvTarget),
    );

    if (targets.length === 0) return 'Invalid environment targets';
    return targets;
};

const validateCreateProject = (body: unknown): CreateProjectInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';

    const input = body as Record<string, unknown>;
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const gitRepository =
        typeof input.gitRepository === 'string'
            ? input.gitRepository.trim()
            : '';

    if (!name) return 'Project name is required';
    if (!projectNamePattern.test(name)) {
        return 'Use letters, numbers, dots, hyphens, and underscores';
    }
    if (!gitRepository) return 'Select a GitHub repository to import';
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(gitRepository)) {
        return 'GitHub repository must be owner/repo';
    }

    return {
        name,
        gitRepository,
        framework:
            typeof input.framework === 'string' && input.framework.trim()
                ? input.framework.trim()
                : undefined,
    };
};

const validateCreateEnvVar = (body: unknown): CreateEnvVarInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';

    const input = body as Record<string, unknown>;
    const key = typeof input.key === 'string' ? input.key.trim() : '';
    const value = typeof input.value === 'string' ? input.value : '';

    if (!key) return 'Key is required';
    if (!value) return 'Value is required';

    const targets = parseTargets(input.targets);
    if (typeof targets === 'string') return targets;

    return { key, value, targets };
};

const validateUpdateEnvVar = (body: unknown): UpdateEnvVarInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';

    const input = body as Record<string, unknown>;
    const result: UpdateEnvVarInput = {};

    if (input.key !== undefined) {
        if (typeof input.key !== 'string' || !input.key.trim()) {
            return 'Key cannot be empty';
        }
        result.key = input.key.trim();
    }

    if (input.value !== undefined) {
        if (typeof input.value !== 'string') return 'Value must be a string';
        result.value = input.value;
    }

    if (input.targets !== undefined) {
        const targets = parseTargets(input.targets);
        if (typeof targets === 'string') return targets;
        result.targets = targets;
    }

    if (
        result.key === undefined &&
        result.value === undefined &&
        result.targets === undefined
    ) {
        return 'No fields to update';
    }

    return result;
};

export const handleListProjects = async (): Promise<
    HandlerResult<{ projects: VercelProjectDto[] }>
> => {
    try {
        const projects = await listProjects();
        return { ok: true, data: { projects }, status: 200 };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleCreateProject = async (
    body: unknown,
): Promise<HandlerResult<{ project: VercelProjectDto }>> => {
    const validated = validateCreateProject(body);
    if (typeof validated === 'string') {
        return {
            ok: false,
            body: { error: validated, status: 400 },
            status: 400,
        };
    }

    try {
        const project = await createProject(validated);
        return { ok: true, data: { project }, status: 201 };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, body: errBody, status: errBody.status };
    }
};

export const handleListDeployments = async (
    projectId: string,
    limit?: number,
): Promise<HandlerResult<{ deployments: VercelDeploymentDto[] }>> => {
    if (!projectId) {
        return {
            ok: false,
            body: { error: 'Project id is required', status: 400 },
            status: 400,
        };
    }

    try {
        const deployments = await listDeployments(
            projectId,
            limit && Number.isFinite(limit) && limit > 0 ? limit : 50,
        );
        return { ok: true, data: { deployments }, status: 200 };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleRedeploy = async (
    deploymentId: string,
    body: unknown,
): Promise<HandlerResult<{ deployment: VercelDeploymentDto }>> => {
    if (!deploymentId) {
        return {
            ok: false,
            body: { error: 'Deployment id is required', status: 400 },
            status: 400,
        };
    }

    const projectName =
        body &&
        typeof body === 'object' &&
        typeof (body as { projectName?: unknown }).projectName === 'string'
            ? (body as { projectName: string }).projectName.trim()
            : '';

    if (!projectName) {
        return {
            ok: false,
            body: { error: 'Project name is required', status: 400 },
            status: 400,
        };
    }

    try {
        const deployment = await redeployDeployment({
            projectName,
            deploymentId,
        });
        return { ok: true, data: { deployment }, status: 201 };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, body: errBody, status: errBody.status };
    }
};

export const handleListEnvVars = async (
    projectId: string,
): Promise<HandlerResult<{ envVars: VercelEnvVarDto[] }>> => {
    if (!projectId) {
        return {
            ok: false,
            body: { error: 'Project id is required', status: 400 },
            status: 400,
        };
    }

    try {
        const envVars = await listEnvVars(projectId);
        return { ok: true, data: { envVars }, status: 200 };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleCountEnvVars = async (
    projectId: string,
): Promise<HandlerResult<{ count: number }>> => {
    if (!projectId) {
        return {
            ok: false,
            body: { error: 'Project id is required', status: 400 },
            status: 400,
        };
    }

    try {
        const count = await countEnvVars(projectId);
        return { ok: true, data: { count }, status: 200 };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleCreateEnvVar = async (
    projectId: string,
    body: unknown,
): Promise<HandlerResult<{ envVar: VercelEnvVarDto }>> => {
    if (!projectId) {
        return {
            ok: false,
            body: { error: 'Project id is required', status: 400 },
            status: 400,
        };
    }

    const validated = validateCreateEnvVar(body);
    if (typeof validated === 'string') {
        return {
            ok: false,
            body: { error: validated, status: 400 },
            status: 400,
        };
    }

    try {
        const envVar = await createEnvVar(projectId, validated);
        return { ok: true, data: { envVar }, status: 201 };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, body: errBody, status: errBody.status };
    }
};

export const handleUpdateEnvVar = async (
    projectId: string,
    envId: string,
    body: unknown,
): Promise<HandlerResult<{ envVar: VercelEnvVarDto }>> => {
    if (!projectId || !envId) {
        return {
            ok: false,
            body: { error: 'Project id and env id are required', status: 400 },
            status: 400,
        };
    }

    const validated = validateUpdateEnvVar(body);
    if (typeof validated === 'string') {
        return {
            ok: false,
            body: { error: validated, status: 400 },
            status: 400,
        };
    }

    try {
        const envVar = await updateEnvVar(projectId, envId, validated);
        return { ok: true, data: { envVar }, status: 200 };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, body: errBody, status: errBody.status };
    }
};

export const handleDeleteEnvVar = async (
    projectId: string,
    envId: string,
): Promise<HandlerResult<{ deleted: true }>> => {
    if (!projectId || !envId) {
        return {
            ok: false,
            body: { error: 'Project id and env id are required', status: 400 },
            status: 400,
        };
    }

    try {
        await deleteEnvVar(projectId, envId);
        return { ok: true, data: { deleted: true }, status: 200 };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, body: errBody, status: errBody.status };
    }
};
