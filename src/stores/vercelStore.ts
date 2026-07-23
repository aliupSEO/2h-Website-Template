import { create } from 'zustand';
import {
    PROJECT_DETAIL_CONCURRENCY,
    PROJECT_SUMMARY_DEPLOYMENT_LIMIT,
    VERCEL_CACHE_TTL_MS,
    VERCEL_SESSION_CACHE_KEY,
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

type ProjectDetailCache = {
    deployments: VercelDeployment[];
    envVars: VercelEnvVar[];
    envVarCount: number;
    fetchedAt: number;
    loadingDeployment: boolean;
    loadingEnv: boolean;
    summaryOnly: boolean;
};

type SessionSummary = {
    latestDeployment: VercelDeployment | null;
    envVarCount: number;
    fetchedAt: number;
};

type SessionCache = {
    projects: VercelProject[];
    projectsFetchedAt: number;
    summaries: Record<string, SessionSummary>;
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
    return Date.now() - fetchedAt < VERCEL_CACHE_TTL_MS;
};

const readSessionCache = (): SessionCache | null => {
    if (typeof sessionStorage === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(VERCEL_SESSION_CACHE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as SessionCache;
    }
    catch {
        return null;
    }
};

const writeSessionCache = (cache: SessionCache) => {
    if (typeof sessionStorage === 'undefined') return;
    try {
        sessionStorage.setItem(VERCEL_SESSION_CACHE_KEY, JSON.stringify(cache));
    }
    catch {
        // quota / private mode — ignore
    }
};

const persistSession = (
    projects: VercelProject[],
    projectsFetchedAt: number | null,
    projectDetails: Record<string, ProjectDetailCache>,
) => {
    if (!projectsFetchedAt) return;

    const summaries: Record<string, SessionSummary> = {};
    for (const [projectId, detail] of Object.entries(projectDetails)) {
        if (detail.loadingDeployment || detail.loadingEnv) continue;
        const latest =
            detail.deployments.length > 0
                ? [...detail.deployments].sort(
                      (a, b) => b.createdAt - a.createdAt,
                  )[0]!
                : null;
        summaries[projectId] = {
            latestDeployment: latest,
            envVarCount: detail.envVarCount,
            fetchedAt: detail.fetchedAt,
        };
    }

    writeSessionCache({
        projects,
        projectsFetchedAt,
        summaries,
    });
};

const detailsFromSession = (
    summaries: Record<string, SessionSummary>,
): Record<string, ProjectDetailCache> => {
    const details: Record<string, ProjectDetailCache> = {};
    for (const [projectId, summary] of Object.entries(summaries)) {
        details[projectId] = {
            deployments: summary.latestDeployment
                ? [summary.latestDeployment]
                : [],
            envVars: [],
            envVarCount: summary.envVarCount,
            fetchedAt: summary.fetchedAt,
            loadingDeployment: false,
            loadingEnv: false,
            summaryOnly: true,
        };
    }
    return details;
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
            loadingDeployment: true,
            loadingEnv: true,
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
        envVarCount: detail.envVarCount,
        loading: detail.loadingDeployment || detail.loadingEnv,
        loadingDeployment: detail.loadingDeployment,
        loadingEnv: detail.loadingEnv,
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

const hydratingProjectIds = new Set<string>();

export const useVercelStore = create<VercelState>((set, get) => {
    const writeDetail = (
        projectId: string,
        patch: Partial<ProjectDetailCache> & {
            deployments?: VercelDeployment[];
            envVars?: VercelEnvVar[];
        },
    ) => {
        set((state) => {
            const previous = state.projectDetails[projectId];
            const next: ProjectDetailCache = {
                deployments:
                    patch.deployments ?? previous?.deployments ?? [],
                envVars: patch.envVars ?? previous?.envVars ?? [],
                envVarCount:
                    patch.envVarCount ??
                    patch.envVars?.length ??
                    previous?.envVarCount ??
                    0,
                fetchedAt: patch.fetchedAt ?? Date.now(),
                loadingDeployment:
                    patch.loadingDeployment ??
                    previous?.loadingDeployment ??
                    false,
                loadingEnv:
                    patch.loadingEnv ?? previous?.loadingEnv ?? false,
                summaryOnly: patch.summaryOnly ?? previous?.summaryOnly ?? true,
            };

            const projectDetails = {
                ...state.projectDetails,
                [projectId]: next,
            };

            persistSession(
                state.projects,
                state.projectsFetchedAt,
                projectDetails,
            );

            return { projectDetails };
        });
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
            const { projectsFetchedAt, loadingProjects, projects } = get();
            if (!force && isCacheFresh(projectsFetchedAt) && projects.length > 0) {
                return;
            }
            if (loadingProjects) return;

            // Show the page robot when we have nothing to display yet.
            if (projects.length === 0) {
                set({ loadingProjects: true, error: null });
            }
            else {
                set({ error: null });
            }

            try {
                const nextProjects = await vercelService.listProjects();
                const fetchedAt = Date.now();
                const session = readSessionCache();
                const seededDetails =
                    session?.summaries
                        ? detailsFromSession(session.summaries)
                        : {};

                set((state) => {
                    const projectDetails = {
                        ...seededDetails,
                        ...state.projectDetails,
                    };
                    persistSession(nextProjects, fetchedAt, projectDetails);
                    return {
                        projects: nextProjects,
                        projectsFetchedAt: fetchedAt,
                        projectDetails,
                        loadingProjects: false,
                        error: null,
                    };
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
                    if (hydratingProjectIds.has(projectId)) return;

                    const cached = get().projectDetails[projectId];
                    if (
                        cached &&
                        isCacheFresh(cached.fetchedAt) &&
                        !cached.loadingDeployment &&
                        !cached.loadingEnv
                    ) {
                        return;
                    }

                    const keepVisible = Boolean(cached && cached.fetchedAt > 0);
                    hydratingProjectIds.add(projectId);

                    writeDetail(projectId, {
                        deployments: cached?.deployments ?? [],
                        envVars: cached?.envVars ?? [],
                        envVarCount: cached?.envVarCount ?? 0,
                        fetchedAt: cached?.fetchedAt ?? 0,
                        loadingDeployment: !keepVisible,
                        loadingEnv: !keepVisible,
                        summaryOnly: cached?.summaryOnly ?? true,
                    });

                    try {
                        // Deployments first so READY paints before env count.
                        const deployments =
                            await vercelService.listDeployments(projectId, {
                                limit: PROJECT_SUMMARY_DEPLOYMENT_LIMIT,
                            });
                        writeDetail(projectId, {
                            deployments,
                            loadingDeployment: false,
                            loadingEnv: !keepVisible,
                            summaryOnly: true,
                            fetchedAt: Date.now(),
                        });

                        const envVarCount =
                            await vercelService.countEnvVars(projectId);
                        writeDetail(projectId, {
                            envVarCount,
                            envVars: [],
                            loadingDeployment: false,
                            loadingEnv: false,
                            summaryOnly: true,
                            fetchedAt: Date.now(),
                        });
                    }
                    catch {
                        writeDetail(projectId, {
                            deployments: cached?.deployments ?? [],
                            envVars: cached?.envVars ?? [],
                            envVarCount: cached?.envVarCount ?? 0,
                            fetchedAt: cached?.fetchedAt ?? 0,
                            loadingDeployment: false,
                            loadingEnv: false,
                            summaryOnly: cached?.summaryOnly ?? true,
                        });
                    }
                    finally {
                        hydratingProjectIds.delete(projectId);
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
                !cached.loadingDeployment &&
                !cached.loadingEnv &&
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
                writeDetail(projectId, {
                    deployments: detail.deployments,
                    envVars: detail.envVars,
                    envVarCount: detail.envVars.length,
                    loadingDeployment: false,
                    loadingEnv: false,
                    summaryOnly: false,
                    fetchedAt: Date.now(),
                });
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
            set((state) => {
                const projects = [
                    project,
                    ...state.projects.filter((p) => p.id !== project.id),
                ];
                const projectsFetchedAt = Date.now();
                persistSession(
                    projects,
                    projectsFetchedAt,
                    state.projectDetails,
                );
                return {
                    projects,
                    projectsFetchedAt,
                };
            });
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
                const projectDetails = {
                    ...state.projectDetails,
                    [selectedProjectId]: {
                        deployments:
                            cached?.deployments ?? state.deployments,
                        envVars: nextEnvVars,
                        envVarCount: nextEnvVars.length,
                        fetchedAt: Date.now(),
                        loadingDeployment: false,
                        loadingEnv: false,
                        summaryOnly: false,
                    },
                };
                persistSession(
                    state.projects,
                    state.projectsFetchedAt,
                    projectDetails,
                );
                return {
                    envVars: nextEnvVars,
                    detailFetchedAt: Date.now(),
                    projectDetails,
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
                const projectDetails = {
                    ...state.projectDetails,
                    [selectedProjectId]: {
                        deployments:
                            cached?.deployments ?? state.deployments,
                        envVars: nextEnvVars,
                        envVarCount: nextEnvVars.length,
                        fetchedAt: Date.now(),
                        loadingDeployment: false,
                        loadingEnv: false,
                        summaryOnly: false,
                    },
                };
                persistSession(
                    state.projects,
                    state.projectsFetchedAt,
                    projectDetails,
                );
                return {
                    envVars: nextEnvVars,
                    detailFetchedAt: Date.now(),
                    projectDetails,
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
                const projectDetails = {
                    ...state.projectDetails,
                    [selectedProjectId]: {
                        deployments:
                            cached?.deployments ?? state.deployments,
                        envVars: nextEnvVars,
                        envVarCount: nextEnvVars.length,
                        fetchedAt: Date.now(),
                        loadingDeployment: false,
                        loadingEnv: false,
                        summaryOnly: false,
                    },
                };
                persistSession(
                    state.projects,
                    state.projectsFetchedAt,
                    projectDetails,
                );
                return {
                    envVars: nextEnvVars,
                    detailFetchedAt: Date.now(),
                    projectDetails,
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
                        envVarCount:
                            state.projectDetails[selectedProjectId]
                                ?.envVarCount ?? 0,
                        fetchedAt: 0,
                        loadingDeployment: false,
                        loadingEnv: false,
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
