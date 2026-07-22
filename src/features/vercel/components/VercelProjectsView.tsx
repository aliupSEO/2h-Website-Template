import { useEffect, useMemo, useState } from 'react';
import { FolderGit2 } from 'lucide-react';
import {
    DocumentTitle,
    Loading,
    LoadingScreen,
    ConfirmModal,
} from '@/components/common';
import { PROJECTS_PER_PAGE } from '@/features/vercel/constants';
import type {
    CreateEnvVarSchema,
    CreateProjectSchema,
    UpdateEnvVarSchema,
} from '@/features/vercel/schemas';
import type {
    VercelDeployment,
    VercelEnvVar,
} from '@/features/vercel/types';
import { toast } from '@/lib/toast';
import { useVercelStore } from '@/stores/vercelStore';
import { CreateEnvVarDialog } from './CreateEnvVarDialog';
import { CreateProjectDialog } from './CreateProjectDialog';
import { DeploymentsTable } from './DeploymentsTable';
import { EditEnvVarDialog } from './EditEnvVarDialog';
import { EnvVarsTable } from './EnvVarsTable';
import { ProjectDetailHeader } from './ProjectDetailHeader';
import { ProjectsCardGrid } from './ProjectsCardGrid';
import { ProjectsPagination } from './ProjectsPagination';
import { ProjectsTable } from './ProjectsTable';
import {
    ProjectsToolbar,
    type ProjectsViewMode,
} from './ProjectsToolbar';
import { VercelEmptyState } from './VercelEmptyState';

export const VercelProjectsView = () => {
    const projects = useVercelStore((state) => state.projects);
    const selectedProjectId = useVercelStore((state) => state.selectedProjectId);
    const deployments = useVercelStore((state) => state.deployments);
    const envVars = useVercelStore((state) => state.envVars);
    const projectDetails = useVercelStore((state) => state.projectDetails);
    const hydrateProjectDetails = useVercelStore(
        (state) => state.hydrateProjectDetails,
    );
    const getProjectSummary = useVercelStore(
        (state) => state.getProjectSummary,
    );
    const loadingProjects = useVercelStore((state) => state.loadingProjects);
    const loadingDetail = useVercelStore((state) => state.loadingDetail);
    const error = useVercelStore((state) => state.error);
    const fetchProjects = useVercelStore((state) => state.fetchProjects);
    const selectProject = useVercelStore((state) => state.selectProject);
    const createProject = useVercelStore((state) => state.createProject);
    const createEnvVar = useVercelStore((state) => state.createEnvVar);
    const updateEnvVar = useVercelStore((state) => state.updateEnvVar);
    const deleteEnvVar = useVercelStore((state) => state.deleteEnvVar);
    const redeploy = useVercelStore((state) => state.redeploy);
    const syncFromWebhooks = useVercelStore((state) => state.syncFromWebhooks);

    const [tab, setTab] = useState<'projects' | 'deployments' | 'env'>(
        'projects',
    );
    const [viewMode, setViewMode] = useState<ProjectsViewMode>('cards');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [createEnvOpen, setCreateEnvOpen] = useState(false);
    const [editingEnv, setEditingEnv] = useState<VercelEnvVar | null>(null);
    const [pendingDeleteEnv, setPendingDeleteEnv] =
        useState<VercelEnvVar | null>(null);
    const [pendingRedeploy, setPendingRedeploy] =
        useState<VercelDeployment | null>(null);
    const [redeployingId, setRedeployingId] = useState<string | null>(null);

    useEffect(() => {
        void fetchProjects().catch(() => undefined);
    }, [fetchProjects]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            void syncFromWebhooks();
        }, 5000);
        return () => window.clearInterval(timer);
    }, [syncFromWebhooks]);

    const filteredProjects = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return projects;
        return projects.filter((project) => {
            const haystack = [
                project.name,
                project.framework ?? '',
                project.productionUrl ?? '',
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [projects, query]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE),
    );

    useEffect(() => {
        setPage(1);
    }, [query]);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const pagedProjects = useMemo(() => {
        const start = (page - 1) * PROJECTS_PER_PAGE;
        return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
    }, [filteredProjects, page]);

    useEffect(() => {
        if (tab !== 'projects' || pagedProjects.length === 0) return;
        void hydrateProjectDetails(pagedProjects.map((project) => project.id));
    }, [tab, pagedProjects, hydrateProjectDetails]);

    const selectedProject = useMemo(() => {
        return (
            projects.find((project) => project.id === selectedProjectId) ?? null
        );
    }, [projects, selectedProjectId]);

    const projectSummaries = useMemo(() => {
        const map: Record<string, ReturnType<typeof getProjectSummary>> = {};
        for (const project of pagedProjects) {
            map[project.id] = getProjectSummary(project.id);
        }
        return map;
    }, [pagedProjects, getProjectSummary, projectDetails]);

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
        const main = document.querySelector('main');
        if (main instanceof HTMLElement) {
            main.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleProjectChange = (projectId: string) => {
        void selectProject(projectId).catch((selectError) => {
            toast.error(
                selectError instanceof Error
                    ? selectError.message
                    : 'Could not load project',
            );
        });
    };

    const openProjectTab = (
        project: (typeof projects)[number],
        nextTab: 'deployments' | 'env',
    ) => {
        handleProjectChange(project.id);
        setTab(nextTab);
    };

    const backToProjects = () => {
        setTab('projects');
    };

    const handleCreateProject = async (values: CreateProjectSchema) => {
        try {
            await createProject({
                ...values,
                framework:
                    values.framework === 'auto' ? undefined : values.framework,
            });
            toast.success('Project imported from GitHub');
            setTab('deployments');
        }
        catch (createError) {
            toast.error(
                createError instanceof Error
                    ? createError.message
                    : 'Could not import project',
            );
            throw createError;
        }
    };

    const handleCreateEnvVar = async (values: CreateEnvVarSchema) => {
        try {
            await createEnvVar(values);
            toast.success('Environment variable added');
        }
        catch (createError) {
            toast.error(
                createError instanceof Error
                    ? createError.message
                    : 'Could not add variable',
            );
            throw createError;
        }
    };

    const handleEditEnvVar = async (
        envVar: VercelEnvVar,
        values: UpdateEnvVarSchema,
    ) => {
        try {
            const payload = {
                key: values.key,
                targets: values.targets,
                ...(values.value?.trim() ? { value: values.value } : {}),
            };
            await updateEnvVar(envVar.id, payload);
            toast.success('Environment variable updated');
        }
        catch (updateError) {
            toast.error(
                updateError instanceof Error
                    ? updateError.message
                    : 'Could not update variable',
            );
            throw updateError;
        }
    };

    const handleDeleteEnvVar = async () => {
        if (!pendingDeleteEnv) return;
        try {
            await deleteEnvVar(pendingDeleteEnv.id);
            toast.success('Environment variable deleted');
        }
        catch (deleteError) {
            toast.error(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Could not delete variable',
            );
        }
    };

    const handleRedeploy = async () => {
        if (!pendingRedeploy) return;
        try {
            setRedeployingId(pendingRedeploy.id);
            await redeploy(pendingRedeploy.id);
            toast.success('Redeploy started');
        }
        catch (redeployError) {
            toast.error(
                redeployError instanceof Error
                    ? redeployError.message
                    : 'Could not redeploy',
            );
        }
        finally {
            setRedeployingId(null);
        }
    };

    if (loadingProjects && projects.length === 0) {
        return <LoadingScreen label="Loading Vercel projects…" />;
    }

    return (
        <div className="-m-4 space-y-0 bg-card sm:-m-6">
            <DocumentTitle title="Vercel" />

            {tab === 'projects' ? (
                <ProjectsToolbar
                    query={query}
                    onQueryChange={setQuery}
                    onCreate={() => setCreateProjectOpen(true)}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            ) : (
                <div className="border-b border-white/5 px-4 py-4 sm:px-6">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">
                        Vercel
                    </h1>
                </div>
            )}

            {error && projects.length === 0 ? (
                <VercelEmptyState
                    title="Could not load projects"
                    description="Check VERCEL_TOKEN and VERCEL_TEAM_ID in .env.local, then restart the dev server."
                />
            ) : null}

            {!error || projects.length > 0 ? (
                <>
                    {tab === 'projects' ? (
                        filteredProjects.length === 0 ? (
                            <VercelEmptyState
                                icon={<FolderGit2 className="size-5" />}
                                title={
                                    query.trim()
                                        ? 'No matching projects'
                                        : 'No projects yet'
                                }
                                description={
                                    query.trim()
                                        ? 'Try another search on this page.'
                                        : 'Import a GitHub repository to get started.'
                                }
                                actionLabel={
                                    query.trim()
                                        ? undefined
                                        : 'Import from GitHub'
                                }
                                onAction={
                                    query.trim()
                                        ? undefined
                                        : () => setCreateProjectOpen(true)
                                }
                            />
                        ) : viewMode === 'cards' ? (
                            <>
                                <ProjectsCardGrid
                                    projects={pagedProjects}
                                    summaries={projectSummaries}
                                    selectedProjectId={selectedProjectId}
                                    onOpenDeployments={(project) =>
                                        openProjectTab(project, 'deployments')
                                    }
                                    onOpenEnv={(project) =>
                                        openProjectTab(project, 'env')
                                    }
                                />
                                <ProjectsPagination
                                    page={page}
                                    totalCount={filteredProjects.length}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        ) : (
                            <>
                                <ProjectsTable
                                    projects={pagedProjects}
                                    summaries={projectSummaries}
                                    selectedProjectId={selectedProjectId}
                                    onOpenDeployments={(project) =>
                                        openProjectTab(project, 'deployments')
                                    }
                                    onOpenEnv={(project) =>
                                        openProjectTab(project, 'env')
                                    }
                                />
                                <ProjectsPagination
                                    page={page}
                                    totalCount={filteredProjects.length}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )
                    ) : null}

                    {tab === 'deployments' ? (
                        <div>
                            <ProjectDetailHeader
                                projectName={
                                    selectedProject?.name ?? 'Project'
                                }
                                title="Deployments"
                                onBack={backToProjects}
                            />

                            {!selectedProject ? (
                                <VercelEmptyState
                                    title="No project selected"
                                    description="Go back and open deployments from a project."
                                    actionLabel="Back to projects"
                                    onAction={backToProjects}
                                />
                            ) : loadingDetail ? (
                                <div className="flex justify-center py-16">
                                    <Loading
                                        size="md"
                                        label="Loading deployments…"
                                    />
                                </div>
                            ) : (
                                <DeploymentsTable
                                    deployments={deployments}
                                    redeployingId={redeployingId}
                                    onRedeploy={setPendingRedeploy}
                                />
                            )}
                        </div>
                    ) : null}

                    {tab === 'env' ? (
                        <div>
                            <ProjectDetailHeader
                                projectName={
                                    selectedProject?.name ?? 'Project'
                                }
                                title="Environment"
                                onBack={backToProjects}
                            />

                            {!selectedProject ? (
                                <VercelEmptyState
                                    title="No project selected"
                                    description="Go back and open environment from a project."
                                    actionLabel="Back to projects"
                                    onAction={backToProjects}
                                />
                            ) : loadingDetail ? (
                                <div className="flex justify-center py-16">
                                    <Loading
                                        size="md"
                                        label="Loading env vars…"
                                    />
                                </div>
                            ) : (
                                <EnvVarsTable
                                    envVars={envVars}
                                    onCreate={() => setCreateEnvOpen(true)}
                                    onEdit={setEditingEnv}
                                    onDelete={setPendingDeleteEnv}
                                />
                            )}
                        </div>
                    ) : null}
                </>
            ) : null}

            <CreateProjectDialog
                open={createProjectOpen}
                onOpenChange={setCreateProjectOpen}
                onSubmit={handleCreateProject}
            />

            <CreateEnvVarDialog
                open={createEnvOpen}
                onOpenChange={setCreateEnvOpen}
                onSubmit={handleCreateEnvVar}
            />

            <EditEnvVarDialog
                envVar={editingEnv}
                onOpenChange={(open) => {
                    if (!open) setEditingEnv(null);
                }}
                onSubmit={handleEditEnvVar}
            />

            <ConfirmModal
                open={Boolean(pendingDeleteEnv)}
                onOpenChange={(open) => {
                    if (!open) setPendingDeleteEnv(null);
                }}
                title="Delete environment variable?"
                description={
                    pendingDeleteEnv
                        ? `${pendingDeleteEnv.key} will be removed from this Vercel project.`
                        : ''
                }
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDeleteEnvVar}
            />

            <ConfirmModal
                open={Boolean(pendingRedeploy)}
                onOpenChange={(open) => {
                    if (!open) setPendingRedeploy(null);
                }}
                title="Redeploy?"
                description={
                    pendingRedeploy
                        ? `Start a new build from deployment ${pendingRedeploy.id.slice(0, 12)}…`
                        : ''
                }
                confirmLabel="Redeploy"
                onConfirm={handleRedeploy}
            />
        </div>
    );
};
