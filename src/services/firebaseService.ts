import type {
    AddFirebaseInput,
    CreateWebAppInput,
    EnableFirestoreInput,
    EnableStorageInput,
    FirebaseApp,
    FirebaseAuthConfig,
    FirebaseAvailableProject,
    FirebaseIdpProvider,
    FirebaseProject,
    FirebaseStatus,
    FirebaseWebAppConfig,
    UpsertIdpProviderInput,
} from '@/features/firebase/types';
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

export const firebaseService = {
    getStatus: async (): Promise<FirebaseStatus> => {
        return request(apiEndpoints.firebase.status);
    },

    listProjects: async (): Promise<FirebaseProject[]> => {
        const data = await request<{ projects: FirebaseProject[] }>(
            apiEndpoints.firebase.projects,
        );
        return data.projects;
    },

    listAvailableProjects: async (): Promise<FirebaseAvailableProject[]> => {
        const data = await request<{ projects: FirebaseAvailableProject[] }>(
            apiEndpoints.firebase.availableProjects,
        );
        return data.projects;
    },

    addFirebase: async (input: AddFirebaseInput): Promise<FirebaseProject> => {
        const data = await request<{ project: FirebaseProject }>(
            apiEndpoints.firebase.projects,
            {
                method: 'POST',
                body: JSON.stringify(input),
            },
        );
        return data.project;
    },

    getProject: async (
        projectId: string,
    ): Promise<{ project: FirebaseProject; apps: FirebaseApp[] }> => {
        return request(apiEndpoints.firebase.project(projectId));
    },

    listApps: async (projectId: string): Promise<FirebaseApp[]> => {
        const data = await request<{ apps: FirebaseApp[] }>(
            apiEndpoints.firebase.projectApps(projectId),
        );
        return data.apps;
    },

    createWebApp: async (
        projectId: string,
        input: CreateWebAppInput,
    ): Promise<FirebaseApp> => {
        const data = await request<{ app: FirebaseApp }>(
            apiEndpoints.firebase.projectWebApps(projectId),
            {
                method: 'POST',
                body: JSON.stringify(input),
            },
        );
        return data.app;
    },

    getWebAppConfig: async (
        projectId: string,
        appId: string,
    ): Promise<FirebaseWebAppConfig> => {
        const data = await request<{ config: FirebaseWebAppConfig }>(
            apiEndpoints.firebase.projectAppConfig(projectId, appId),
        );
        return data.config;
    },

    removeWebApp: async (projectId: string, appId: string): Promise<void> => {
        await request<{ deleted: true }>(
            apiEndpoints.firebase.projectApp(projectId, appId),
            { method: 'DELETE' },
        );
    },

    getAuthConfig: async (projectId: string): Promise<FirebaseAuthConfig> => {
        const data = await request<{ config: FirebaseAuthConfig }>(
            apiEndpoints.firebase.projectAuthConfig(projectId),
        );
        return data.config;
    },

    updateAuthConfig: async (
        projectId: string,
        authorizedDomains: string[],
    ): Promise<FirebaseAuthConfig> => {
        const data = await request<{ config: FirebaseAuthConfig }>(
            apiEndpoints.firebase.projectAuthConfig(projectId),
            {
                method: 'PATCH',
                body: JSON.stringify({ authorizedDomains }),
            },
        );
        return data.config;
    },

    listProviders: async (
        projectId: string,
    ): Promise<FirebaseIdpProvider[]> => {
        const data = await request<{ providers: FirebaseIdpProvider[] }>(
            apiEndpoints.firebase.projectAuthProviders(projectId),
        );
        return data.providers;
    },

    createProvider: async (
        projectId: string,
        input: UpsertIdpProviderInput,
    ): Promise<FirebaseIdpProvider> => {
        const data = await request<{ provider: FirebaseIdpProvider }>(
            apiEndpoints.firebase.projectAuthProviders(projectId),
            {
                method: 'POST',
                body: JSON.stringify(input),
            },
        );
        return data.provider;
    },

    updateProvider: async (
        projectId: string,
        idpId: string,
        input: UpsertIdpProviderInput,
    ): Promise<FirebaseIdpProvider> => {
        const data = await request<{ provider: FirebaseIdpProvider }>(
            apiEndpoints.firebase.projectAuthProvider(projectId, idpId),
            {
                method: 'PATCH',
                body: JSON.stringify(input),
            },
        );
        return data.provider;
    },

    enableFirestore: async (
        projectId: string,
        input: EnableFirestoreInput = {},
    ): Promise<{ name: string; locationId: string }> => {
        const data = await request<{
            firestore: { name: string; locationId: string };
        }>(apiEndpoints.firebase.projectFirestoreEnable(projectId), {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return data.firestore;
    },

    enableStorage: async (
        projectId: string,
        input: EnableStorageInput = {},
    ): Promise<{ bucket: string; location: string }> => {
        const data = await request<{
            storage: { bucket: string; location: string };
        }>(apiEndpoints.firebase.projectStorageEnable(projectId), {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return data.storage;
    },
};
