import { create } from 'zustand';
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
import { firebaseService } from '@/services/firebaseService';

const CACHE_TTL_MS = 60_000;

type FirebaseState = {
    status: FirebaseStatus | null;
    projects: FirebaseProject[];
    availableProjects: FirebaseAvailableProject[];
    selectedProjectId: string | null;
    apps: FirebaseApp[];
    authConfig: FirebaseAuthConfig | null;
    providers: FirebaseIdpProvider[];
    projectsFetchedAt: number | null;
    detailFetchedAt: number | null;
    loadingStatus: boolean;
    loadingProjects: boolean;
    loadingDetail: boolean;
    error: string | null;
    fetchStatus: () => Promise<void>;
    fetchProjects: (options?: { force?: boolean }) => Promise<void>;
    fetchAvailableProjects: () => Promise<void>;
    selectProject: (projectId: string | null) => Promise<void>;
    addFirebase: (input: AddFirebaseInput) => Promise<FirebaseProject>;
    createWebApp: (input: CreateWebAppInput) => Promise<FirebaseApp>;
    getWebAppConfig: (appId: string) => Promise<FirebaseWebAppConfig>;
    removeWebApp: (appId: string) => Promise<void>;
    updateAuthorizedDomains: (domains: string[]) => Promise<void>;
    createProvider: (input: UpsertIdpProviderInput) => Promise<void>;
    updateProvider: (
        idpId: string,
        input: UpsertIdpProviderInput,
    ) => Promise<void>;
    enableFirestore: (input?: EnableFirestoreInput) => Promise<void>;
    enableStorage: (input?: EnableStorageInput) => Promise<void>;
};

const isCacheFresh = (fetchedAt: number | null) => {
    if (!fetchedAt) return false;
    return Date.now() - fetchedAt < CACHE_TTL_MS;
};

const loadProjectDetail = async (projectId: string) => {
    const [detail, authConfig, providers] = await Promise.all([
        firebaseService.getProject(projectId),
        firebaseService.getAuthConfig(projectId).catch(() => ({
            authorizedDomains: [] as string[],
        })),
        firebaseService.listProviders(projectId).catch(() => [] as FirebaseIdpProvider[]),
    ]);
    return {
        project: detail.project,
        apps: detail.apps,
        authConfig,
        providers,
    };
};

export const useFirebaseStore = create<FirebaseState>((set, get) => ({
    status: null,
    projects: [],
    availableProjects: [],
    selectedProjectId: null,
    apps: [],
    authConfig: null,
    providers: [],
    projectsFetchedAt: null,
    detailFetchedAt: null,
    loadingStatus: false,
    loadingProjects: false,
    loadingDetail: false,
    error: null,

    fetchStatus: async () => {
        set({ loadingStatus: true });
        try {
            const status = await firebaseService.getStatus();
            set({ status, loadingStatus: false });
        }
        catch (error) {
            set({
                loadingStatus: false,
                status: { configured: false, defaultProjectId: null },
                error:
                    error instanceof Error
                        ? error.message
                        : 'Could not check Firebase status',
            });
        }
    },

    fetchProjects: async ({ force } = {}) => {
        const { projectsFetchedAt, loadingProjects } = get();
        if (!force && isCacheFresh(projectsFetchedAt)) return;
        if (loadingProjects) return;

        set({ loadingProjects: true, error: null });
        try {
            const projects = await firebaseService.listProjects();
            set({
                projects,
                projectsFetchedAt: Date.now(),
                loadingProjects: false,
                error: null,
            });
        }
        catch (error) {
            set({
                loadingProjects: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Could not load Firebase projects',
            });
            throw error;
        }
    },

    fetchAvailableProjects: async () => {
        const projects = await firebaseService.listAvailableProjects();
        set({ availableProjects: projects });
    },

    selectProject: async (projectId) => {
        const { selectedProjectId, detailFetchedAt } = get();

        if (!projectId) {
            set({
                selectedProjectId: null,
                apps: [],
                authConfig: null,
                providers: [],
                detailFetchedAt: null,
            });
            return;
        }

        const sameProject = selectedProjectId === projectId;
        set({ selectedProjectId: projectId });

        if (sameProject && isCacheFresh(detailFetchedAt)) {
            return;
        }

        set({ loadingDetail: true, error: null });
        try {
            const detail = await loadProjectDetail(projectId);
            set({
                apps: detail.apps,
                authConfig: detail.authConfig,
                providers: detail.providers,
                projects: get().projects.map((project) =>
                    project.projectId === detail.project.projectId
                        ? detail.project
                        : project,
                ),
                detailFetchedAt: Date.now(),
                loadingDetail: false,
                error: null,
            });
        }
        catch (error) {
            set({
                loadingDetail: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Could not load project detail',
            });
            throw error;
        }
    },

    addFirebase: async (input) => {
        const project = await firebaseService.addFirebase(input);
        set((state) => ({
            projects: [
                project,
                ...state.projects.filter(
                    (item) => item.projectId !== project.projectId,
                ),
            ],
            projectsFetchedAt: Date.now(),
            availableProjects: state.availableProjects.filter(
                (item) => item.projectId !== project.projectId,
            ),
        }));
        await get().selectProject(project.projectId);
        return project;
    },

    createWebApp: async (input) => {
        const projectId = get().selectedProjectId;
        if (!projectId) throw new Error('Select a project first');

        const app = await firebaseService.createWebApp(projectId, input);
        set((state) => ({
            apps: [app, ...state.apps.filter((item) => item.appId !== app.appId)],
            detailFetchedAt: Date.now(),
        }));
        return app;
    },

    getWebAppConfig: async (appId) => {
        const projectId = get().selectedProjectId;
        if (!projectId) throw new Error('Select a project first');
        return firebaseService.getWebAppConfig(projectId, appId);
    },

    removeWebApp: async (appId) => {
        const projectId = get().selectedProjectId;
        if (!projectId) throw new Error('Select a project first');

        await firebaseService.removeWebApp(projectId, appId);
        set((state) => ({
            apps: state.apps.filter((app) => app.appId !== appId),
            detailFetchedAt: Date.now(),
        }));
    },

    updateAuthorizedDomains: async (domains) => {
        const projectId = get().selectedProjectId;
        if (!projectId) throw new Error('Select a project first');

        const config = await firebaseService.updateAuthConfig(
            projectId,
            domains,
        );
        set({ authConfig: config, detailFetchedAt: Date.now() });
    },

    createProvider: async (input) => {
        const projectId = get().selectedProjectId;
        if (!projectId) throw new Error('Select a project first');

        const provider = await firebaseService.createProvider(projectId, input);
        set((state) => ({
            providers: [
                provider,
                ...state.providers.filter((item) => item.idpId !== provider.idpId),
            ],
            detailFetchedAt: Date.now(),
        }));
    },

    updateProvider: async (idpId, input) => {
        const projectId = get().selectedProjectId;
        if (!projectId) throw new Error('Select a project first');

        const provider = await firebaseService.updateProvider(
            projectId,
            idpId,
            input,
        );
        set((state) => ({
            providers: state.providers.map((item) =>
                item.idpId === idpId ? provider : item,
            ),
            detailFetchedAt: Date.now(),
        }));
    },

    enableFirestore: async (input = {}) => {
        const projectId = get().selectedProjectId;
        if (!projectId) throw new Error('Select a project first');
        await firebaseService.enableFirestore(projectId, input);
    },

    enableStorage: async (input = {}) => {
        const projectId = get().selectedProjectId;
        if (!projectId) throw new Error('Select a project first');
        await firebaseService.enableStorage(projectId, input);
    },
}));
