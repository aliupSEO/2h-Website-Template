import { useEffect, useMemo, useState } from 'react';
import {
    ConfirmModal,
    DocumentTitle,
    Loading,
    LoadingScreen,
} from '@/components/common';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui';
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
import { ProjectSelect } from './ProjectSelect';
import { ProjectsTable } from './ProjectsTable';
import { ProjectsToolbar } from './ProjectsToolbar';

export const VercelProjectsView = () => {
    const projects = useVercelStore((state) => state.projects);
    const selectedProjectId = useVercelStore((state) => state.selectedProjectId);
    const deployments = useVercelStore((state) => state.deployments);
    const envVars = useVercelStore((state) => state.envVars);
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

    const [tab, setTab] = useState('projects');
    const [query, setQuery] = useState('');
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [createEnvOpen, setCreateEnvOpen] = useState(false);
    const [editingEnv, setEditingEnv] = useState<VercelEnvVar | null>(null);
    const [pendingDeleteEnv, setPendingDeleteEnv] = useState<VercelEnvVar | null>(null);
    const [pendingRedeploy, setPendingRedeploy] = useState<VercelDeployment | null>(null);
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

    const selectedProject = useMemo(() => {
        return projects.find((project) => project.id === selectedProjectId) ?? null;
    }, [projects, selectedProjectId]);

    const handleProjectChange = (projectId: string) => {
        void selectProject(projectId).catch((selectError) => {
            toast.error(
                selectError instanceof Error
                    ? selectError.message
                    : 'Could not load project',
            );
        });
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
        <div className="space-y-6">
            <DocumentTitle title="Vercel" />
            <div className="space-y-1">
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    Vercel
                </h1>
                <p className="text-sm text-muted-foreground">
                    Import GitHub repos, watch deployments, and manage env vars.
                </p>
            </div>

            {error && projects.length === 0 ? (
                <div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <p className="text-sm text-destructive">{error}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Check `VERCEL_TOKEN` and `VERCEL_TEAM_ID` in `.env.local`,
                        then restart the dev server.
                    </p>
                </div>
            ) : (
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                        <TabsTrigger value="deployments">Deployments</TabsTrigger>
                        <TabsTrigger value="env">Environment</TabsTrigger>
                    </TabsList>

                    <TabsContent value="projects" className="mt-4 space-y-4">
                        <ProjectsToolbar
                            query={query}
                            onQueryChange={setQuery}
                            onCreate={() => setCreateProjectOpen(true)}
                        />

                        {filteredProjects.length === 0 ? (
                            <div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                                <p className="text-sm text-muted-foreground">
                                    {query.trim()
                                        ? 'No projects match your search.'
                                        : 'No Vercel projects found. Import one from GitHub.'}
                                </p>
                            </div>
                        ) : (
                            <ProjectsTable
                                projects={filteredProjects}
                                selectedProjectId={selectedProjectId}
                                onSelect={(project) => {
                                    handleProjectChange(project.id);
                                    setTab('deployments');
                                }}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="deployments" className="mt-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <ProjectSelect
                                projects={projects}
                                value={selectedProjectId}
                                onChange={handleProjectChange}
                                placeholder="Select a Vercel project"
                            />
                        </div>

                        {!selectedProject ? (
                            <p className="text-sm text-muted-foreground">
                                Choose a project to view deployments.
                            </p>
                        ) : loadingDetail ? (
                            <div className="flex justify-center py-10">
                                <Loading size="md" label="Loading deployments…" />
                            </div>
                        ) : (
                            <DeploymentsTable
                                deployments={deployments}
                                redeployingId={redeployingId}
                                onRedeploy={setPendingRedeploy}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="env" className="mt-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <ProjectSelect
                                projects={projects}
                                value={selectedProjectId}
                                onChange={handleProjectChange}
                                placeholder="Select a Vercel project"
                            />
                        </div>

                        {!selectedProject ? (
                            <p className="text-sm text-muted-foreground">
                                Choose a project to manage environment variables.
                            </p>
                        ) : loadingDetail ? (
                            <div className="flex justify-center py-10">
                                <Loading size="md" label="Loading env vars…" />
                            </div>
                        ) : (
                            <EnvVarsTable
                                envVars={envVars}
                                onCreate={() => setCreateEnvOpen(true)}
                                onEdit={setEditingEnv}
                                onDelete={setPendingDeleteEnv}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            )}

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
