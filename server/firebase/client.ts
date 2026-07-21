import { getAccessToken } from './credentials.js';
import type {
    AddFirebaseInput,
    CreateWebAppInput,
    EnableFirestoreInput,
    EnableStorageInput,
    FirebaseAppDto,
    FirebaseAppPlatform,
    FirebaseAuthConfigDto,
    FirebaseAvailableProjectDto,
    FirebaseIdpProviderDto,
    FirebaseProjectDto,
    FirebaseWebAppConfigDto,
    UpdateAuthConfigInput,
    UpsertIdpProviderInput,
} from './types.js';

const MANAGEMENT = 'https://firebase.googleapis.com/v1beta1';
const IDENTITY = 'https://identitytoolkit.googleapis.com/admin/v2';
const FIRESTORE = 'https://firestore.googleapis.com/v1';
const STORAGE = 'https://storage.googleapis.com/storage/v1';
const SERVICE_USAGE = 'https://serviceusage.googleapis.com/v1';

type GoogleErrorBody = {
    error?: { message?: string; status?: string; code?: number };
    message?: string;
};

const googleFetch = async <T>(
    url: string,
    init?: RequestInit,
): Promise<T> => {
    const token = await getAccessToken();
    const response = await fetch(url, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    if (!response.ok) {
        let message = `Google API error (${response.status})`;
        try {
            const body = (await response.json()) as GoogleErrorBody;
            message = body.error?.message ?? body.message ?? message;
        }
        catch {
            // ignore
        }
        const error = new Error(message) as Error & { status?: number };
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
};

type RawFirebaseProject = {
    projectId?: string;
    displayName?: string;
    name?: string;
    state?: string;
    projectNumber?: string;
};

type RawAvailableProject = {
    project?: string;
    displayName?: string;
};

type RawApp = {
    name?: string;
    appId?: string;
    displayName?: string;
    namespace?: string;
    bundleId?: string;
    packageName?: string;
    platform?: string;
};

const mapProject = (project: RawFirebaseProject): FirebaseProjectDto => ({
    projectId: project.projectId ?? '',
    displayName: project.displayName ?? project.projectId ?? '',
    state: project.state ?? 'UNKNOWN',
    projectNumber: project.projectNumber,
});

const detectPlatform = (app: RawApp): FirebaseAppPlatform => {
    const platform = (app.platform ?? '').toLowerCase();
    if (platform.includes('ios') || app.bundleId) return 'ios';
    if (platform.includes('android') || app.packageName) return 'android';
    if (app.name?.includes('/iosApps/')) return 'ios';
    if (app.name?.includes('/androidApps/')) return 'android';
    return 'web';
};

const mapApp = (app: RawApp): FirebaseAppDto => ({
    appId: app.appId ?? '',
    platform: detectPlatform(app),
    displayName: app.displayName ?? app.appId ?? '',
    namespace: app.namespace ?? null,
    bundleId: app.bundleId ?? null,
    packageName: app.packageName ?? null,
});

const extractProjectId = (resource: string): string => {
    const match = resource.match(/projects\/([^/]+)/);
    return match?.[1] ?? resource.replace(/^projects\//, '');
};

const waitForOperation = async (
    operationName: string,
    maxAttempts = 40,
): Promise<void> => {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const op = await googleFetch<{
            done?: boolean;
            error?: { message?: string };
        }>(`https://firebase.googleapis.com/v1beta1/${operationName}`);

        if (op.done) {
            if (op.error?.message) {
                throw new Error(op.error.message);
            }
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    throw new Error('Timed out waiting for Firebase operation');
};

export const listFirebaseProjects = async (): Promise<FirebaseProjectDto[]> => {
    const data = await googleFetch<{ results?: RawFirebaseProject[] }>(
        `${MANAGEMENT}/projects?pageSize=100`,
    );
    return (data.results ?? [])
        .map(mapProject)
        .filter((project) => Boolean(project.projectId));
};

export const getFirebaseProject = async (
    projectId: string,
): Promise<FirebaseProjectDto> => {
    const project = await googleFetch<RawFirebaseProject>(
        `${MANAGEMENT}/projects/${encodeURIComponent(projectId)}`,
    );
    return mapProject(project);
};

export const listAvailableProjects = async (): Promise<
    FirebaseAvailableProjectDto[]
> => {
    const data = await googleFetch<{
        projectInfo?: RawAvailableProject[];
    }>(`${MANAGEMENT}/availableProjects?pageSize=100`);

    return (data.projectInfo ?? [])
        .map((item) => {
            const projectId = item.project
                ? extractProjectId(item.project)
                : '';
            return {
                projectId,
                displayName: item.displayName ?? projectId,
            };
        })
        .filter((item) => Boolean(item.projectId));
};

export const addFirebaseToProject = async (
    input: AddFirebaseInput,
): Promise<FirebaseProjectDto> => {
    const operation = await googleFetch<{ name?: string }>(
        `${MANAGEMENT}/projects/${encodeURIComponent(input.projectId)}:addFirebase`,
        {
            method: 'POST',
            body: JSON.stringify({}),
        },
    );

    if (operation.name) {
        await waitForOperation(operation.name);
    }

    return getFirebaseProject(input.projectId);
};

export const searchApps = async (
    projectId: string,
): Promise<FirebaseAppDto[]> => {
    const data = await googleFetch<{ apps?: RawApp[] }>(
        `${MANAGEMENT}/projects/${encodeURIComponent(projectId)}:searchApps`,
    );
    return (data.apps ?? [])
        .map(mapApp)
        .filter((app) => Boolean(app.appId));
};

export const createWebApp = async (
    projectId: string,
    input: CreateWebAppInput,
): Promise<FirebaseAppDto> => {
    const operation = await googleFetch<{
        name?: string;
        response?: RawApp;
    }>(
        `${MANAGEMENT}/projects/${encodeURIComponent(projectId)}/webApps`,
        {
            method: 'POST',
            body: JSON.stringify({
                displayName: input.displayName.trim(),
            }),
        },
    );

    if (operation.name) {
        await waitForOperation(operation.name);
    }

    const apps = await searchApps(projectId);
    const created =
        apps.find(
            (app) =>
                app.platform === 'web' &&
                app.displayName === input.displayName.trim(),
        ) ?? apps.find((app) => app.platform === 'web');

    if (!created) {
        throw new Error('Web app was created but could not be loaded');
    }

    return created;
};

export const getWebAppConfig = async (
    projectId: string,
    appId: string,
): Promise<FirebaseWebAppConfigDto> => {
    return googleFetch<FirebaseWebAppConfigDto>(
        `${MANAGEMENT}/projects/${encodeURIComponent(projectId)}/webApps/${encodeURIComponent(appId)}/config`,
    );
};

export const removeWebApp = async (
    projectId: string,
    appId: string,
): Promise<void> => {
    const operation = await googleFetch<{ name?: string }>(
        `${MANAGEMENT}/projects/${encodeURIComponent(projectId)}/webApps/${encodeURIComponent(appId)}:remove`,
        {
            method: 'POST',
            body: JSON.stringify({}),
        },
    );

    if (operation.name) {
        await waitForOperation(operation.name);
    }
};

export const getAuthConfig = async (
    projectId: string,
): Promise<FirebaseAuthConfigDto> => {
    const data = await googleFetch<{ authorizedDomains?: string[] }>(
        `${IDENTITY}/projects/${encodeURIComponent(projectId)}/config`,
    );
    return { authorizedDomains: data.authorizedDomains ?? [] };
};

export const updateAuthConfig = async (
    projectId: string,
    input: UpdateAuthConfigInput,
): Promise<FirebaseAuthConfigDto> => {
    const data = await googleFetch<{ authorizedDomains?: string[] }>(
        `${IDENTITY}/projects/${encodeURIComponent(projectId)}/config?updateMask=authorizedDomains`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                authorizedDomains: input.authorizedDomains,
            }),
        },
    );
    return { authorizedDomains: data.authorizedDomains ?? [] };
};

const idpIdFromName = (name: string): string => {
    const parts = name.split('/');
    return parts[parts.length - 1] ?? name;
};

export const listIdpProviders = async (
    projectId: string,
): Promise<FirebaseIdpProviderDto[]> => {
    const data = await googleFetch<{
        defaultSupportedIdpConfigs?: Array<{
            name?: string;
            enabled?: boolean;
            clientId?: string;
        }>;
    }>(
        `${IDENTITY}/projects/${encodeURIComponent(projectId)}/defaultSupportedIdpConfigs`,
    );

    return (data.defaultSupportedIdpConfigs ?? []).map((config) => {
        const name = config.name ?? '';
        return {
            name,
            idpId: idpIdFromName(name),
            enabled: Boolean(config.enabled),
            clientId: config.clientId ?? null,
        };
    });
};

export const createIdpProvider = async (
    projectId: string,
    input: UpsertIdpProviderInput,
): Promise<FirebaseIdpProviderDto> => {
    if (!input.clientSecret?.trim()) {
        throw new Error('clientSecret is required when creating a provider');
    }

    const config = await googleFetch<{
        name?: string;
        enabled?: boolean;
        clientId?: string;
    }>(
        `${IDENTITY}/projects/${encodeURIComponent(projectId)}/defaultSupportedIdpConfigs?idpId=${encodeURIComponent(input.idpId)}`,
        {
            method: 'POST',
            body: JSON.stringify({
                enabled: input.enabled,
                clientId: input.clientId.trim(),
                clientSecret: input.clientSecret,
            }),
        },
    );

    const name = config.name ?? '';
    return {
        name,
        idpId: idpIdFromName(name) || input.idpId,
        enabled: Boolean(config.enabled),
        clientId: config.clientId ?? input.clientId,
    };
};

export const updateIdpProvider = async (
    projectId: string,
    idpId: string,
    input: UpsertIdpProviderInput,
): Promise<FirebaseIdpProviderDto> => {
    const name = `projects/${projectId}/defaultSupportedIdpConfigs/${idpId}`;
    const body: Record<string, unknown> = {
        name,
        enabled: input.enabled,
        clientId: input.clientId.trim(),
    };
    if (input.clientSecret?.trim()) {
        body.clientSecret = input.clientSecret;
    }

    const updateMask = input.clientSecret?.trim()
        ? 'enabled,clientId,clientSecret'
        : 'enabled,clientId';

    const config = await googleFetch<{
        name?: string;
        enabled?: boolean;
        clientId?: string;
    }>(
        `${IDENTITY}/${name}?updateMask=${encodeURIComponent(updateMask)}`,
        {
            method: 'PATCH',
            body: JSON.stringify(body),
        },
    );

    return {
        name: config.name ?? name,
        idpId,
        enabled: Boolean(config.enabled),
        clientId: config.clientId ?? input.clientId,
    };
};

export const enableFirestore = async (
    projectId: string,
    input: EnableFirestoreInput = {},
): Promise<{ name: string; locationId: string }> => {
    const locationId = input.locationId?.trim() || 'nam5';
    const databaseId = '(default)';

    try {
        const existing = await googleFetch<{
            name?: string;
            locationId?: string;
        }>(
            `${FIRESTORE}/projects/${encodeURIComponent(projectId)}/databases/${encodeURIComponent(databaseId)}`,
        );
        return {
            name: existing.name ?? `projects/${projectId}/databases/${databaseId}`,
            locationId: existing.locationId ?? locationId,
        };
    }
    catch (error) {
        const status =
            error instanceof Error && 'status' in error
                ? (error as Error & { status?: number }).status
                : undefined;
        if (status !== 404) throw error;
    }

    const operation = await googleFetch<{ name?: string }>(
        `${FIRESTORE}/projects/${encodeURIComponent(projectId)}/databases?databaseId=${encodeURIComponent(databaseId)}`,
        {
            method: 'POST',
            body: JSON.stringify({
                type: 'FIRESTORE_NATIVE',
                locationId,
            }),
        },
    );

    if (operation.name) {
        for (let attempt = 0; attempt < 40; attempt += 1) {
            const op = await googleFetch<{
                done?: boolean;
                error?: { message?: string };
                response?: { name?: string; locationId?: string };
            }>(`https://firestore.googleapis.com/v1/${operation.name}`);

            if (op.done) {
                if (op.error?.message) throw new Error(op.error.message);
                return {
                    name:
                        op.response?.name ??
                        `projects/${projectId}/databases/${databaseId}`,
                    locationId: op.response?.locationId ?? locationId,
                };
            }

            await new Promise((resolve) => setTimeout(resolve, 1500));
        }
        throw new Error('Timed out waiting for Firestore database creation');
    }

    return {
        name: `projects/${projectId}/databases/${databaseId}`,
        locationId,
    };
};

export const enableStorage = async (
    projectId: string,
    input: EnableStorageInput = {},
): Promise<{ bucket: string; location: string }> => {
    const location = input.location?.trim() || 'US';
    const bucketName =
        input.bucketName?.trim() || `${projectId}.appspot.com`;

    try {
        await googleFetch(
            `${SERVICE_USAGE}/projects/${encodeURIComponent(projectId)}/services/storage.googleapis.com:enable`,
            {
                method: 'POST',
                body: JSON.stringify({}),
            },
        );
    }
    catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (!/already enabled|ALREADY_EXISTS/i.test(message)) {
            // continue — bucket create may still work if API was already on
            if (!/403|PERMISSION/i.test(message)) {
                // soft-fail enable; try bucket
            }
        }
    }

    try {
        const existing = await googleFetch<{ name?: string; location?: string }>(
            `${STORAGE}/b/${encodeURIComponent(bucketName)}`,
        );
        return {
            bucket: existing.name ?? bucketName,
            location: existing.location ?? location,
        };
    }
    catch (error) {
        const status =
            error instanceof Error && 'status' in error
                ? (error as Error & { status?: number }).status
                : undefined;
        if (status !== 404) throw error;
    }

    const created = await googleFetch<{ name?: string; location?: string }>(
        `${STORAGE}/b?project=${encodeURIComponent(projectId)}`,
        {
            method: 'POST',
            body: JSON.stringify({
                name: bucketName,
                location,
                iamConfiguration: {
                    uniformBucketLevelAccess: { enabled: true },
                },
            }),
        },
    );

    return {
        bucket: created.name ?? bucketName,
        location: created.location ?? location,
    };
};
