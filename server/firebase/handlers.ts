import {
    addFirebaseToProject,
    createIdpProvider,
    createWebApp,
    enableFirestore,
    enableStorage,
    getAuthConfig,
    getFirebaseProject,
    getWebAppConfig,
    listAvailableProjects,
    listFirebaseProjects,
    listIdpProviders,
    removeWebApp,
    searchApps,
    updateAuthConfig,
    updateIdpProvider,
} from './client.js';
import { probeFirebaseCredentials } from './credentials.js';
import type {
    AddFirebaseInput,
    CreateWebAppInput,
    EnableFirestoreInput,
    EnableStorageInput,
    FirebaseApiErrorBody,
    UpdateAuthConfigInput,
    UpsertIdpProviderInput,
} from './types.js';

export type HandlerResult<T> =
    | { ok: true; data: T; status: number }
    | { ok: false; body: FirebaseApiErrorBody; status: number };

const toError = (error: unknown): FirebaseApiErrorBody => {
    if (error instanceof Error) {
        const status =
            'status' in error && typeof error.status === 'number'
                ? error.status
                : 500;
        return { error: error.message, status };
    }
    return { error: 'Unexpected server error', status: 500 };
};

const requireConfigured = (): HandlerResult<never> | null => {
    const probe = probeFirebaseCredentials();
    if (!probe.configured) {
        return {
            ok: false,
            status: 503,
            body: {
                error:
                    'Firebase is not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON. See docs/firebase-api/credentials-runbook.md.',
                status: 503,
            },
        };
    }
    return null;
};

const validateProjectId = (projectId: string): string | null => {
    const trimmed = projectId.trim();
    if (!trimmed) return null;
    if (!/^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/i.test(trimmed)) return null;
    return trimmed;
};

const validateAddFirebase = (body: unknown): AddFirebaseInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';
    const input = body as Record<string, unknown>;
    const projectId =
        typeof input.projectId === 'string' ? input.projectId.trim() : '';
    if (!validateProjectId(projectId)) return 'Valid projectId is required';
    return { projectId };
};

const validateCreateWebApp = (body: unknown): CreateWebAppInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';
    const input = body as Record<string, unknown>;
    const displayName =
        typeof input.displayName === 'string' ? input.displayName.trim() : '';
    if (!displayName) return 'Display name is required';
    if (displayName.length > 100) return 'Display name is too long';
    return { displayName };
};

const validateAuthConfig = (body: unknown): UpdateAuthConfigInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';
    const input = body as Record<string, unknown>;
    if (!Array.isArray(input.authorizedDomains)) {
        return 'authorizedDomains must be an array of strings';
    }
    const domains = input.authorizedDomains
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
    return { authorizedDomains: [...new Set(domains)] };
};

const validateIdp = (body: unknown): UpsertIdpProviderInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';
    const input = body as Record<string, unknown>;
    const idpId = typeof input.idpId === 'string' ? input.idpId.trim() : '';
    const clientId =
        typeof input.clientId === 'string' ? input.clientId.trim() : '';
    const clientSecret =
        typeof input.clientSecret === 'string'
            ? input.clientSecret
            : undefined;
    const enabled =
        typeof input.enabled === 'boolean' ? input.enabled : true;

    if (!idpId) return 'idpId is required';
    if (!clientId) return 'clientId is required';

    return {
        idpId,
        clientId,
        enabled,
        ...(clientSecret !== undefined ? { clientSecret } : {}),
    };
};

const validateFirestore = (body: unknown): EnableFirestoreInput | string => {
    if (body == null) return {};
    if (typeof body !== 'object') return 'Invalid request body';
    const input = body as Record<string, unknown>;
    return {
        locationId:
            typeof input.locationId === 'string'
                ? input.locationId.trim()
                : undefined,
    };
};

const validateStorage = (body: unknown): EnableStorageInput | string => {
    if (body == null) return {};
    if (typeof body !== 'object') return 'Invalid request body';
    const input = body as Record<string, unknown>;
    return {
        location:
            typeof input.location === 'string'
                ? input.location.trim()
                : undefined,
        bucketName:
            typeof input.bucketName === 'string'
                ? input.bucketName.trim()
                : undefined,
    };
};

export const handleFirebaseStatus = (): HandlerResult<{
    configured: boolean;
    defaultProjectId: string | null;
}> => {
    const probe = probeFirebaseCredentials();
    return {
        ok: true,
        status: 200,
        data: {
            configured: probe.configured,
            defaultProjectId: probe.defaultProjectId,
        },
    };
};

export const handleListProjects = async (): Promise<
    HandlerResult<{ projects: Awaited<ReturnType<typeof listFirebaseProjects>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    try {
        const projects = await listFirebaseProjects();
        return { ok: true, status: 200, data: { projects } };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, status: body.status, body };
    }
};

export const handleListAvailableProjects = async (): Promise<
    HandlerResult<{
        projects: Awaited<ReturnType<typeof listAvailableProjects>>;
    }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    try {
        const projects = await listAvailableProjects();
        return { ok: true, status: 200, data: { projects } };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, status: body.status, body };
    }
};

export const handleAddFirebase = async (
    body: unknown,
): Promise<
    HandlerResult<{ project: Awaited<ReturnType<typeof addFirebaseToProject>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const input = validateAddFirebase(body);
    if (typeof input === 'string') {
        return { ok: false, status: 400, body: { error: input, status: 400 } };
    }

    try {
        const project = await addFirebaseToProject(input);
        return { ok: true, status: 201, data: { project } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleGetProject = async (
    projectId: string,
): Promise<
    HandlerResult<{
        project: Awaited<ReturnType<typeof getFirebaseProject>>;
        apps: Awaited<ReturnType<typeof searchApps>>;
    }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId', status: 400 },
        };
    }

    try {
        const [project, apps] = await Promise.all([
            getFirebaseProject(id),
            searchApps(id),
        ]);
        return { ok: true, status: 200, data: { project, apps } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleListApps = async (
    projectId: string,
): Promise<HandlerResult<{ apps: Awaited<ReturnType<typeof searchApps>> }>> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId', status: 400 },
        };
    }

    try {
        const apps = await searchApps(id);
        return { ok: true, status: 200, data: { apps } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleCreateWebApp = async (
    projectId: string,
    body: unknown,
): Promise<HandlerResult<{ app: Awaited<ReturnType<typeof createWebApp>> }>> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId', status: 400 },
        };
    }

    const input = validateCreateWebApp(body);
    if (typeof input === 'string') {
        return { ok: false, status: 400, body: { error: input, status: 400 } };
    }

    try {
        const app = await createWebApp(id, input);
        return { ok: true, status: 201, data: { app } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleGetWebAppConfig = async (
    projectId: string,
    appId: string,
): Promise<
    HandlerResult<{ config: Awaited<ReturnType<typeof getWebAppConfig>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id || !appId.trim()) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId or appId', status: 400 },
        };
    }

    try {
        const config = await getWebAppConfig(id, appId.trim());
        return { ok: true, status: 200, data: { config } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleRemoveWebApp = async (
    projectId: string,
    appId: string,
): Promise<HandlerResult<{ deleted: true }>> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id || !appId.trim()) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId or appId', status: 400 },
        };
    }

    try {
        await removeWebApp(id, appId.trim());
        return { ok: true, status: 200, data: { deleted: true } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleGetAuthConfig = async (
    projectId: string,
): Promise<
    HandlerResult<{ config: Awaited<ReturnType<typeof getAuthConfig>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId', status: 400 },
        };
    }

    try {
        const config = await getAuthConfig(id);
        return { ok: true, status: 200, data: { config } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleUpdateAuthConfig = async (
    projectId: string,
    body: unknown,
): Promise<
    HandlerResult<{ config: Awaited<ReturnType<typeof updateAuthConfig>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId', status: 400 },
        };
    }

    const input = validateAuthConfig(body);
    if (typeof input === 'string') {
        return { ok: false, status: 400, body: { error: input, status: 400 } };
    }

    try {
        const config = await updateAuthConfig(id, input);
        return { ok: true, status: 200, data: { config } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleListProviders = async (
    projectId: string,
): Promise<
    HandlerResult<{ providers: Awaited<ReturnType<typeof listIdpProviders>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId', status: 400 },
        };
    }

    try {
        const providers = await listIdpProviders(id);
        return { ok: true, status: 200, data: { providers } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleCreateProvider = async (
    projectId: string,
    body: unknown,
): Promise<
    HandlerResult<{ provider: Awaited<ReturnType<typeof createIdpProvider>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId', status: 400 },
        };
    }

    const input = validateIdp(body);
    if (typeof input === 'string') {
        return { ok: false, status: 400, body: { error: input, status: 400 } };
    }

    try {
        const provider = await createIdpProvider(id, input);
        return { ok: true, status: 201, data: { provider } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleUpdateProvider = async (
    projectId: string,
    idpId: string,
    body: unknown,
): Promise<
    HandlerResult<{ provider: Awaited<ReturnType<typeof updateIdpProvider>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id || !idpId.trim()) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId or idpId', status: 400 },
        };
    }

    const input = validateIdp({
        ...(typeof body === 'object' && body ? body : {}),
        idpId: idpId.trim(),
    });
    if (typeof input === 'string') {
        return { ok: false, status: 400, body: { error: input, status: 400 } };
    }

    try {
        const provider = await updateIdpProvider(id, idpId.trim(), input);
        return { ok: true, status: 200, data: { provider } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleEnableFirestore = async (
    projectId: string,
    body: unknown,
): Promise<
    HandlerResult<{ firestore: Awaited<ReturnType<typeof enableFirestore>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId', status: 400 },
        };
    }

    const input = validateFirestore(body);
    if (typeof input === 'string') {
        return { ok: false, status: 400, body: { error: input, status: 400 } };
    }

    try {
        const firestore = await enableFirestore(id, input);
        return { ok: true, status: 200, data: { firestore } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};

export const handleEnableStorage = async (
    projectId: string,
    body: unknown,
): Promise<
    HandlerResult<{ storage: Awaited<ReturnType<typeof enableStorage>> }>
> => {
    const gate = requireConfigured();
    if (gate) return gate;

    const id = validateProjectId(projectId);
    if (!id) {
        return {
            ok: false,
            status: 400,
            body: { error: 'Invalid projectId', status: 400 },
        };
    }

    const input = validateStorage(body);
    if (typeof input === 'string') {
        return { ok: false, status: 400, body: { error: input, status: 400 } };
    }

    try {
        const storage = await enableStorage(id, input);
        return { ok: true, status: 200, data: { storage } };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, status: errBody.status, body: errBody };
    }
};
