import { create } from 'zustand';
import type {
    CreateEnvVarInput,
    CreateProjectInput,
    UpdateEnvVarInput,
    VercelDeployment,
    VercelEnvVar,
    VercelProject,
} from '@/features/vercel/types';
import { vercelService } from '@/services/vercelService';

const CACHE_TTL_MS = 60_000;

type VercelState = {
    projects: VercelProject[];
    selectedProjectId: string | null;
    deployments: VercelDeployment[];
    envVars: VercelEnvVar[];
    projectsFetchedAt: number | null;
    detailFetchedAt: number | null;
    loadingProjects: boolean;
    loadingDetail: boolean;
    error: string | null;
    fetchProjects: (options?: { force?: boolean }) => Promise<void>;
    selectProject: (projectId: string | null) => Promise<void>;
    createProject: (input: CreateProjectInput) => Promise<VercelProject>;
    createEnvVar: (input: CreateEnvVarInput) => Promise<VercelEnvVar>;
    updateEnvVar: (
        envId: string,
        input: UpdateEnvVarInput,
    ) => Promise<VercelEnvVar>;
    deleteEnvVar: (envId: string) => Promise<void>;
    redeploy: (deploymentId: string) => Promise<VercelDeployment>;
    syncFromWebhooks: () => Promise<void>;
};

const isCacheFresh = (fetchedAt: number | null) => {
    if (!fetchedAt) return false;
    return Date.now() - fetchedAt < CACHE_TTL_MS;
};

const loadProjectDetail = async (projectId: string) => {
    const [deployments, envVars] = await Promise.all([
        vercelService.listDeployments(projectId),
        vercelService.listEnvVars(projectId),
    ]);
    return { deployments, envVars };
};

export const useVercelStore = create<VercelState>((set, get) => ({
    projects: [],
    selectedProjectId: null,
    deployments: [],
    envVars: [],
    projectsFetchedAt: null,
    detailFetchedAt: null,
    loadingProjects: false,
    loadingDetail: false,
    error: null,

    fetchProjects: async ({ force } = {}) => {
        const { projectsFetchedAt, loadingProjects } = get();
        if (!force && isCacheFresh(projectsFetchedAt)) return;
        if (loadingProjects) return;

        set({ loadingProjects: true, error: null });
        try {
            const projects = await vercelService.listProjects();
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
                        : 'Could not load Vercel projects',
            });
            throw error;
        }
    },

    selectProject: async (projectId) => {
        const { selectedProjectId, detailFetchedAt } = get();

        if (!projectId) {
            set({
                selectedProjectId: null,
                deployments: [],
                envVars: [],
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
                deployments: detail.deployments,
                envVars: detail.envVars,
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
                        : 'Could not load project details',
            });
            throw error;
        }
    },

    createProject: async (input) => {
        const project = await vercelService.createProject(input);
        set((state) => ({
            projects: [project, ...state.projects.filter((p) => p.id !== project.id)],
            projectsFetchedAt: Date.now(),
        }));
        await get().selectProject(project.id);
        return project;
    },

    createEnvVar: async (input) => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) throw new Error('No project selected');

        const envVar = await vercelService.createEnvVar(selectedProjectId, input);
        set((state) => ({
            envVars: [envVar, ...state.envVars.filter((item) => item.id !== envVar.id)],
            detailFetchedAt: Date.now(),
        }));
        return envVar;
    },

    updateEnvVar: async (envId, input) => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) throw new Error('No project selected');

        const envVar = await vercelService.updateEnvVar(
            selectedProjectId,
            envId,
            input,
        );
        set((state) => ({
            envVars: state.envVars.map((item) =>
                item.id === envId ? envVar : item,
            ),
            detailFetchedAt: Date.now(),
        }));
        return envVar;
    },

    deleteEnvVar: async (envId) => {
        const { selectedProjectId } = get();
        if (!selectedProjectId) throw new Error('No project selected');

        await vercelService.deleteEnvVar(selectedProjectId, envId);
        set((state) => ({
            envVars: state.envVars.filter((item) => item.id !== envId),
            detailFetchedAt: Date.now(),
        }));
    },

    redeploy: async (deploymentId) => {
        const { selectedProjectId, projects } = get();
        if (!selectedProjectId) throw new Error('No project selected');

        const project = projects.find((item) => item.id === selectedProjectId);
        if (!project) throw new Error('Project not found');

        const deployment = await vercelService.redeploy(
            deploymentId,
            project.name,
        );

        set({ detailFetchedAt: null });
        await get().selectProject(selectedProjectId);
        return deployment;
    },

    syncFromWebhooks: async () => {
        try {
            const state = await vercelService.getWebhookState();
            const { selectedProjectId } = get();
            const clearIds: string[] = [];

            if (state.projectsListDirty) {
                await get().fetchProjects({ force: true });
            }

            if (
                selectedProjectId &&
                state.dirtyProjectIds.includes(selectedProjectId)
            ) {
                set({ detailFetchedAt: null });
                await get().selectProject(selectedProjectId);
                clearIds.push(selectedProjectId);
            }

            if (state.projectsListDirty || clearIds.length > 0) {
                await vercelService.clearWebhookDirty({
                    projectIds: clearIds,
                    projectsList: state.projectsListDirty,
                });
            }
        }
        catch {
            // Webhook sync is best-effort; REST remains source of truth.
        }
    },
}));
