import { create } from 'zustand';
import {
    PROJECT_DETAIL_CONCURRENCY,
    PROJECT_SUMMARY_DEPLOYMENT_LIMIT,
} from '@/features/vercel/constants';
import type {
    CreateEnvVarInput,
    CreateProjectInput,
    UpdateEnvVarInput,
    VercelDeployment,
    VercelEnvVar,
    VercelProject,
    VercelProjectSummary,
} from '@/features/vercel/types';
import { vercelService } from '@/services/vercelService';

const CACHE_TTL_MS = 60_000;

type ProjectDetailCache = {
    deployments: VercelDeployment[];
    envVars: VercelEnvVar[];
    fetchedAt: number;
    loading: boolean;
    summaryOnly: boolean;
};

type VercelState = {
    projects: VercelProject[];
    selectedProjectId: string | null;
    deployments: VercelDeployment[];
    envVars: VercelEnvVar[];
    projectDetails: Record<string, ProjectDetailCache>;
    projectsFetchedAt: number | null;
    detailFetchedAt: number | null;
    loadingProjects: boolean;
    loadingDetail: boolean;
    error: string | null;
    fetchProjects: (options?: { force?: boolean }) => Promise<void>;
    hydrateProjectDetails: (projectIds: string[]) => Promise<void>;
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
    getProjectSummary: (projectId: string) => VercelProjectSummary;
};

const isCacheFresh = (fetchedAt: number | null) => {
    if (!fetchedAt) return false;
    return Date.now() - fetchedAt < CACHE_TTL_MS;
};

const toSummary = (
    detail: ProjectDetailCache | undefined,
): VercelProjectSummary => {
    if (!detail) {
        return {
            latestDeployment: null,
            deploymentCount: 0,
            envVarCount: 0,
            loading: true,
            summaryOnly: true,
        };
    }

    const latest =
        detail.deployments.length > 0
            ? [...detail.deployments].sort(
                  (a, b) => b.createdAt - a.createdAt,
              )[0]!
            : null;

    return {
        latestDeployment: latest,
        deploymentCount: detail.deployments.length,
        envVarCount: detail.envVars.length,
        loading: detail.loading,
        summaryOnly: detail.summaryOnly,
    };
};

const runWithConcurrency = async <T>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<void>,
) => {
    if (items.length === 0) return;

    let nextIndex = 0;
    const runners = Array.from(
        { length: Math.min(concurrency, items.length) },
        async () => {
            while (nextIndex < items.length) {
                const current = items[nextIndex]!;
                nextIndex += 1;
                await worker(current);
            }
        },
    );

    await Promise.all(runners);
};

const loadProjectDetail = async (
    projectId: string,
    options?: { summary?: boolean },
) => {
    const [deployments, envVars] = await Promise.all([
        vercelService.listDeployments(
            projectId,
            options?.summary
                ? { limit: PROJECT_SUMMARY_DEPLOYMENT_LIMIT }
                : undefined,
        ),
        vercelService.listEnvVars(projectId),
    ]);
    return { deployments, envVars };
};

export const useVercelStore = create<VercelState>((set, get) => {
    const writeDetail = (
        projectId: string,
        deployments: VercelDeployment[],
        envVars: VercelEnvVar[],
        summaryOnly: boolean,
    ) => {
        set((state) => ({
            projectDetails: {
                ...state.projectDetails,
                [projectId]: {
                    deployments,
                    envVars,
                    fetchedAt: Date.now(),
                    loading: false,
                    summaryOnly,
                },
            },
        }));
    };

    return {
        projects: [],
        selectedProjectId: null,
        deployments: [],
        envVars: [],
        projectDetails: {},
        projectsFetchedAt: null,
        detailFetchedAt: null,
        loadingProjects: false,
        loadingDetail: false,
        error: null,

        getProjectSummary: (projectId) => {
            return toSummary(get().projectDetails[projectId]);
        },

        fetchProjects: async ({ force } = {}) => {
            const { projectsFetchedAt, loadingProjects } = get();
            if (!force && isCacheFresh(projectsFetchedAt)) {
                return;
            }
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

        hydrateProjectDetails: async (projectIds) => {
            const uniqueIds = [...new Set(projectIds.filter(Boolean))];
            if (uniqueIds.length === 0) return;

            await runWithConcurrency(
                uniqueIds,
                PROJECT_DETAIL_CONCURRENCY,
                async (projectId) => {
                    const cached = get().projectDetails[projectId];
                    if (
                        cached &&
                        isCacheFresh(cached.fetchedAt) &&
                        !cached.loading
                    ) {
                        return;
                    }
                    if (cached?.loading) return;

                    set((state) => ({
                        projectDetails: {
                            ...state.projectDetails,
                            [projectId]: {
                                deployments: cached?.deployments ?? [],
                                envVars: cached?.envVars ?? [],
                                fetchedAt: cached?.fetchedAt ?? 0,
                                loading: true,
                                summaryOnly: cached?.summaryOnly ?? true,
                            },
                        },
                    }));

                    try {
                        const detail = await loadProjectDetail(projectId, {
                            summary: true,
                        });
                        writeDetail(
                            projectId,
                            detail.deployments,
                            detail.envVars,
                            true,
                        );
                    }
                    catch {
                        set((state) => ({
                            projectDetails: {
                                ...state.projectDetails,
                                [projectId]: {
                                    deployments: cached?.deployments ?? [],
                                    envVars: cached?.envVars ?? [],
                                    fetchedAt: cached?.fetchedAt ?? 0,
                                    loading: false,
                                    summaryOnly: cached?.summaryOnly ?? true,
                                },
                            },
                        }));
                    }
                },
            );
        },

        selectProject: async (projectId) => {
            const { selectedProjectId, detailFetchedAt, projectDetails } =
                get();

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

            const cached = projectDetails[projectId];
            if (
                sameProject &&
                isCacheFresh(detailFetchedAt) &&
                cached &&
                !cached.summaryOnly
            ) {
                return;
            }
            if (
                cached &&
                isCacheFresh(cached.fetchedAt) &&
                !cached.loading &&
                !cached.summaryOnly
            ) {
                set({
                    deployments: cached.deployments,
                    envVars: cached.envVars,
                    detailFetchedAt: cached.fetchedAt,
                    loadingDetail: false,
                    error: null,
                });
                return;
            }

            set({ loadingDetail: true, error: null });
            try {
                const detail = await loadProjectDetail(projectId);
                writeDetail(
                    projectId,
                    detail.deployments,
                    detail.envVars,
                    false,
                );
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
                projects: [
                    project,
                    ...state.projects.filter((p) => p.id !== project.id),
                ],
                projectsFetchedAt: Date.now(),
            }));
            await get().selectProject(project.id);
            return project;
        },

        createEnvVar: async (input) => {
            const { selectedProjectId } = get();
            if (!selectedProjectId) throw new Error('No project selected');

            const envVar = await vercelService.createEnvVar(
                selectedProjectId,
                input,
            );
            set((state) => {
                const cached = state.projectDetails[selectedProjectId];
                const nextEnvVars = [
                    envVar,
                    ...state.envVars.filter((item) => item.id !== envVar.id),
                ];
                return {
                    envVars: nextEnvVars,
                    detailFetchedAt: Date.now(),
                    projectDetails: {
                        ...state.projectDetails,
                        [selectedProjectId]: {
                            deployments:
                                cached?.deployments ?? state.deployments,
                            envVars: nextEnvVars,
                            fetchedAt: Date.now(),
                            loading: false,
                            summaryOnly: false,
                        },
                    },
                };
            });
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
            set((state) => {
                const nextEnvVars = state.envVars.map((item) =>
                    item.id === envId ? envVar : item,
                );
                const cached = state.projectDetails[selectedProjectId];
                return {
                    envVars: nextEnvVars,
                    detailFetchedAt: Date.now(),
                    projectDetails: {
                        ...state.projectDetails,
                        [selectedProjectId]: {
                            deployments:
                                cached?.deployments ?? state.deployments,
                            envVars: nextEnvVars,
                            fetchedAt: Date.now(),
                            loading: false,
                            summaryOnly: false,
                        },
                    },
                };
            });
            return envVar;
        },

        deleteEnvVar: async (envId) => {
            const { selectedProjectId } = get();
            if (!selectedProjectId) throw new Error('No project selected');

            await vercelService.deleteEnvVar(selectedProjectId, envId);
            set((state) => {
                const nextEnvVars = state.envVars.filter(
                    (item) => item.id !== envId,
                );
                const cached = state.projectDetails[selectedProjectId];
                return {
                    envVars: nextEnvVars,
                    detailFetchedAt: Date.now(),
                    projectDetails: {
                        ...state.projectDetails,
                        [selectedProjectId]: {
                            deployments:
                                cached?.deployments ?? state.deployments,
                            envVars: nextEnvVars,
                            fetchedAt: Date.now(),
                            loading: false,
                            summaryOnly: false,
                        },
                    },
                };
            });
        },

        redeploy: async (deploymentId) => {
            const { selectedProjectId, projects } = get();
            if (!selectedProjectId) throw new Error('No project selected');

            const project = projects.find(
                (item) => item.id === selectedProjectId,
            );
            if (!project) throw new Error('Project not found');

            const deployment = await vercelService.redeploy(
                deploymentId,
                project.name,
            );

            set((state) => ({
                detailFetchedAt: null,
                projectDetails: {
                    ...state.projectDetails,
                    [selectedProjectId]: {
                        deployments:
                            state.projectDetails[selectedProjectId]
                                ?.deployments ?? [],
                        envVars:
                            state.projectDetails[selectedProjectId]?.envVars ??
                            [],
                        fetchedAt: 0,
                        loading: false,
                        summaryOnly: false,
                    },
                },
            }));
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
    };
});
