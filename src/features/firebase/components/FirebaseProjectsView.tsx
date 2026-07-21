import { useCallback, useEffect, useMemo, useState } from 'react';
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
    AddFirebaseSchema,
    CreateWebAppSchema,
    UpsertIdpProviderSchema,
} from '@/features/firebase/schemas';
import type {
    FirebaseApp,
    FirebaseWebAppConfig,
} from '@/features/firebase/types';
import { toast } from '@/lib/toast';
import { useFirebaseStore } from '@/stores/firebaseStore';
import { AddFirebaseDialog } from './AddFirebaseDialog';
import { AppConfigDialog } from './AppConfigDialog';
import { AppsTable } from './AppsTable';
import { AuthDomainsPanel } from './AuthDomainsPanel';
import { AuthProvidersPanel } from './AuthProvidersPanel';
import { CreateWebAppDialog } from './CreateWebAppDialog';
import { ProjectSelect } from './ProjectSelect';
import { ProjectsTable } from './ProjectsTable';
import { ProjectsToolbar } from './ProjectsToolbar';
import { ServicesPanel } from './ServicesPanel';

export const FirebaseProjectsView = () => {
    const status = useFirebaseStore((state) => state.status);
    const projects = useFirebaseStore((state) => state.projects);
    const availableProjects = useFirebaseStore(
        (state) => state.availableProjects,
    );
    const selectedProjectId = useFirebaseStore(
        (state) => state.selectedProjectId,
    );
    const apps = useFirebaseStore((state) => state.apps);
    const authConfig = useFirebaseStore((state) => state.authConfig);
    const providers = useFirebaseStore((state) => state.providers);
    const loadingStatus = useFirebaseStore((state) => state.loadingStatus);
    const loadingProjects = useFirebaseStore((state) => state.loadingProjects);
    const loadingDetail = useFirebaseStore((state) => state.loadingDetail);
    const error = useFirebaseStore((state) => state.error);
    const fetchStatus = useFirebaseStore((state) => state.fetchStatus);
    const fetchProjects = useFirebaseStore((state) => state.fetchProjects);
    const fetchAvailableProjects = useFirebaseStore(
        (state) => state.fetchAvailableProjects,
    );
    const selectProject = useFirebaseStore((state) => state.selectProject);
    const addFirebase = useFirebaseStore((state) => state.addFirebase);
    const createWebApp = useFirebaseStore((state) => state.createWebApp);
    const getWebAppConfig = useFirebaseStore((state) => state.getWebAppConfig);
    const removeWebApp = useFirebaseStore((state) => state.removeWebApp);
    const updateAuthorizedDomains = useFirebaseStore(
        (state) => state.updateAuthorizedDomains,
    );
    const createProvider = useFirebaseStore((state) => state.createProvider);
    const updateProvider = useFirebaseStore((state) => state.updateProvider);
    const enableFirestore = useFirebaseStore((state) => state.enableFirestore);
    const enableStorage = useFirebaseStore((state) => state.enableStorage);

    const [tab, setTab] = useState('projects');
    const [query, setQuery] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [createAppOpen, setCreateAppOpen] = useState(false);
    const [providerOpen, setProviderOpen] = useState(false);
    const [loadingAvailable, setLoadingAvailable] = useState(false);
    const [availableError, setAvailableError] = useState<string | null>(null);
    const [pendingDeleteApp, setPendingDeleteApp] = useState<FirebaseApp | null>(
        null,
    );
    const [configApp, setConfigApp] = useState<FirebaseApp | null>(null);
    const [config, setConfig] = useState<FirebaseWebAppConfig | null>(null);
    const [configLoading, setConfigLoading] = useState(false);
    const [configError, setConfigError] = useState<string | null>(null);

    useEffect(() => {
        void fetchStatus();
    }, [fetchStatus]);

    useEffect(() => {
        if (!status?.configured) return;
        void fetchProjects().catch(() => undefined);
    }, [status?.configured, fetchProjects]);

    const filteredProjects = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return projects;
        return projects.filter((project) => {
            const haystack = [project.displayName, project.projectId, project.state]
                .join(' ')
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [projects, query]);

    const selectedProject = useMemo(() => {
        return (
            projects.find((project) => project.projectId === selectedProjectId) ??
            null
        );
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

    const loadAvailable = useCallback(async () => {
        setLoadingAvailable(true);
        setAvailableError(null);
        try {
            await fetchAvailableProjects();
        }
        catch (loadError) {
            setAvailableError(
                loadError instanceof Error
                    ? loadError.message
                    : 'Could not load available projects',
            );
        }
        finally {
            setLoadingAvailable(false);
        }
    }, [fetchAvailableProjects]);

    const handleAddFirebase = async (values: AddFirebaseSchema) => {
        try {
            await addFirebase(values);
            toast.success('Firebase added to project');
            setTab('apps');
        }
        catch (addError) {
            toast.error(
                addError instanceof Error
                    ? addError.message
                    : 'Could not add Firebase',
            );
            throw addError;
        }
    };

    const handleCreateWebApp = async (values: CreateWebAppSchema) => {
        try {
            await createWebApp(values);
            toast.success('Web app created');
        }
        catch (createError) {
            toast.error(
                createError instanceof Error
                    ? createError.message
                    : 'Could not create web app',
            );
            throw createError;
        }
    };

    const handleViewConfig = async (app: FirebaseApp) => {
        setConfigApp(app);
        setConfig(null);
        setConfigError(null);
        setConfigLoading(true);
        try {
            const next = await getWebAppConfig(app.appId);
            setConfig(next);
        }
        catch (viewError) {
            setConfigError(
                viewError instanceof Error
                    ? viewError.message
                    : 'Could not load config',
            );
        }
        finally {
            setConfigLoading(false);
        }
    };

    const handleCopyConfig = async () => {
        if (!config) return;
        try {
            await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
            toast.success('Config copied');
        }
        catch {
            toast.error('Could not copy config');
        }
    };

    const handleDeleteApp = async () => {
        if (!pendingDeleteApp) return;
        try {
            await removeWebApp(pendingDeleteApp.appId);
            toast.success('Web app removed');
        }
        catch (deleteError) {
            toast.error(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Could not remove app',
            );
        }
    };

    const handleAddDomain = async (domain: string) => {
        const current = authConfig?.authorizedDomains ?? [];
        if (current.includes(domain)) {
            toast.error('Domain already authorized');
            return;
        }
        try {
            await updateAuthorizedDomains([...current, domain]);
            toast.success('Domain added');
        }
        catch (domainError) {
            toast.error(
                domainError instanceof Error
                    ? domainError.message
                    : 'Could not add domain',
            );
            throw domainError;
        }
    };

    const handleRemoveDomain = async (domain: string) => {
        const current = authConfig?.authorizedDomains ?? [];
        try {
            await updateAuthorizedDomains(
                current.filter((item) => item !== domain),
            );
            toast.success('Domain removed');
        }
        catch (domainError) {
            toast.error(
                domainError instanceof Error
                    ? domainError.message
                    : 'Could not remove domain',
            );
        }
    };

    const handleCreateProvider = async (values: UpsertIdpProviderSchema) => {
        try {
            await createProvider({
                ...values,
                clientSecret: values.clientSecret?.trim() || undefined,
            });
            toast.success('Provider configured');
        }
        catch (providerError) {
            toast.error(
                providerError instanceof Error
                    ? providerError.message
                    : 'Could not configure provider',
            );
            throw providerError;
        }
    };

    const handleToggleProvider = async (
        provider: { idpId: string; clientId?: string | null },
        enabled: boolean,
    ) => {
        if (!provider.clientId) {
            toast.error('Provider is missing client ID; reconfigure it');
            return;
        }
        try {
            await updateProvider(provider.idpId, {
                idpId: provider.idpId,
                enabled,
                clientId: provider.clientId,
            });
            toast.success(enabled ? 'Provider enabled' : 'Provider disabled');
        }
        catch (toggleError) {
            toast.error(
                toggleError instanceof Error
                    ? toggleError.message
                    : 'Could not update provider',
            );
        }
    };

    const handleEnableFirestore = async () => {
        try {
            await enableFirestore();
            toast.success('Firestore enabled');
        }
        catch (serviceError) {
            toast.error(
                serviceError instanceof Error
                    ? serviceError.message
                    : 'Could not enable Firestore',
            );
        }
    };

    const handleEnableStorage = async () => {
        try {
            await enableStorage();
            toast.success('Storage enabled');
        }
        catch (serviceError) {
            toast.error(
                serviceError instanceof Error
                    ? serviceError.message
                    : 'Could not enable Storage',
            );
        }
    };

    if (loadingStatus && !status) {
        return <LoadingScreen label="Checking Firebase credentials…" />;
    }

    if (status && !status.configured) {
        return (
            <div className="space-y-6">
                <DocumentTitle title="Firebase" />
                <div className="space-y-1">
                    <h1 className="font-heading text-2xl font-semibold tracking-tight">
                        Firebase
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage Firebase projects, apps, Auth, and services.
                    </p>
                </div>
                <div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <p className="text-sm text-destructive">
                        Firebase is not configured on the Hub BFF.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Set `GOOGLE_APPLICATION_CREDENTIALS` (or
                        `FIREBASE_SERVICE_ACCOUNT_JSON`) in `.env.local`, then
                        restart the dev server. See
                        `docs/firebase-api/credentials-runbook.md`.
                    </p>
                </div>
            </div>
        );
    }

    if (loadingProjects && projects.length === 0) {
        return <LoadingScreen label="Loading Firebase projects…" />;
    }

    return (
        <div className="space-y-6">
            <DocumentTitle title="Firebase" />
            <div className="space-y-1">
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    Firebase
                </h1>
                <p className="text-sm text-muted-foreground">
                    Inventory projects, create apps, configure Auth, and enable
                    Firestore / Storage.
                </p>
            </div>

            {error && projects.length === 0 ? (
                <div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <p className="text-sm text-destructive">{error}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Check service-account IAM and enabled Google APIs, then
                        retry.
                    </p>
                </div>
            ) : (
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                        <TabsTrigger value="apps">Apps</TabsTrigger>
                        <TabsTrigger value="auth">Auth</TabsTrigger>
                        <TabsTrigger value="services">Services</TabsTrigger>
                    </TabsList>

                    <TabsContent value="projects" className="mt-4 space-y-4">
                        <ProjectsToolbar
                            query={query}
                            onQueryChange={setQuery}
                            onAddFirebase={() => setAddOpen(true)}
                        />

                        {filteredProjects.length === 0 ? (
                            <div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                                <p className="text-sm text-muted-foreground">
                                    {query.trim()
                                        ? 'No projects match your search.'
                                        : 'No Firebase projects found. Add Firebase to a GCP project.'}
                                </p>
                            </div>
                        ) : (
                            <ProjectsTable
                                projects={filteredProjects}
                                selectedProjectId={selectedProjectId}
                                onSelect={(project) => {
                                    handleProjectChange(project.projectId);
                                    setTab('apps');
                                }}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="apps" className="mt-4 space-y-4">
                        <ProjectSelect
                            projects={projects}
                            value={selectedProjectId}
                            onChange={handleProjectChange}
                        />

                        {!selectedProject ? (
                            <p className="text-sm text-muted-foreground">
                                Choose a project to view apps.
                            </p>
                        ) : loadingDetail ? (
                            <div className="flex justify-center py-10">
                                <Loading size="md" label="Loading apps…" />
                            </div>
                        ) : (
                            <AppsTable
                                apps={apps}
                                onCreate={() => setCreateAppOpen(true)}
                                onViewConfig={(app) => {
                                    void handleViewConfig(app);
                                }}
                                onDelete={setPendingDeleteApp}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="auth" className="mt-4 space-y-8">
                        <ProjectSelect
                            projects={projects}
                            value={selectedProjectId}
                            onChange={handleProjectChange}
                        />

                        {!selectedProject ? (
                            <p className="text-sm text-muted-foreground">
                                Choose a project to manage Auth.
                            </p>
                        ) : loadingDetail ? (
                            <div className="flex justify-center py-10">
                                <Loading size="md" label="Loading Auth…" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    <h2 className="font-heading text-lg font-semibold">
                                        Authorized domains
                                    </h2>
                                    <AuthDomainsPanel
                                        domains={
                                            authConfig?.authorizedDomains ?? []
                                        }
                                        onAdd={handleAddDomain}
                                        onRemove={handleRemoveDomain}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="font-heading text-lg font-semibold">
                                        Sign-in providers
                                    </h2>
                                    <AuthProvidersPanel
                                        providers={providers}
                                        createOpen={providerOpen}
                                        onCreateOpenChange={setProviderOpen}
                                        onCreate={handleCreateProvider}
                                        onToggle={handleToggleProvider}
                                    />
                                </div>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="services" className="mt-4 space-y-4">
                        <ProjectSelect
                            projects={projects}
                            value={selectedProjectId}
                            onChange={handleProjectChange}
                        />

                        {!selectedProject ? (
                            <p className="text-sm text-muted-foreground">
                                Choose a project to enable services.
                            </p>
                        ) : (
                            <ServicesPanel
                                onEnableFirestore={handleEnableFirestore}
                                onEnableStorage={handleEnableStorage}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            )}

            <AddFirebaseDialog
                open={addOpen}
                onOpenChange={setAddOpen}
                availableProjects={availableProjects}
                loadingAvailable={loadingAvailable}
                availableError={availableError}
                onLoadAvailable={loadAvailable}
                onSubmit={handleAddFirebase}
            />

            <CreateWebAppDialog
                open={createAppOpen}
                onOpenChange={setCreateAppOpen}
                onSubmit={handleCreateWebApp}
            />

            <AppConfigDialog
                open={Boolean(configApp)}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfigApp(null);
                        setConfig(null);
                        setConfigError(null);
                    }
                }}
                appName={configApp?.displayName ?? 'Web app'}
                config={config}
                loading={configLoading}
                error={configError}
                onCopy={() => {
                    void handleCopyConfig();
                }}
            />

            <ConfirmModal
                open={Boolean(pendingDeleteApp)}
                onOpenChange={(open) => {
                    if (!open) setPendingDeleteApp(null);
                }}
                title="Remove web app?"
                description={
                    pendingDeleteApp
                        ? `${pendingDeleteApp.displayName} will be removed from this Firebase project.`
                        : ''
                }
                confirmLabel="Remove"
                variant="destructive"
                onConfirm={handleDeleteApp}
            />
        </div>
    );
};
