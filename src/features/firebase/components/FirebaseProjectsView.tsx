import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ConfirmModal,
    DocumentTitle,
    LoadingScreen,
} from '@/components/common';
import type {
    AddFirebaseSchema,
    CreateWebAppSchema,
    UpsertIdpProviderSchema,
} from '@/features/firebase/schemas';
import type {
    FirebaseApp,
    FirebaseProject,
    FirebaseWebAppConfig,
} from '@/features/firebase/types';
import { toast } from '@/lib/toast';
import { useFirebaseStore } from '@/stores/firebaseStore';
import { AddFirebaseDialog } from './AddFirebaseDialog';
import { AppConfigDialog } from './AppConfigDialog';
import { CreateWebAppDialog } from './CreateWebAppDialog';
import { FirebaseEmptyState } from './FirebaseEmptyState';
import { ProjectDetailSheet } from './ProjectDetailSheet';
import { ProjectsCardGrid } from './ProjectsCardGrid';
import { ProjectsTable } from './ProjectsTable';
import {
    ProjectsToolbar,
    type ProjectsViewMode,
} from './ProjectsToolbar';

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

    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState<ProjectsViewMode>('cards');
    const [detailOpen, setDetailOpen] = useState(false);
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
            const haystack = [
                project.displayName,
                project.projectId,
                project.state,
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [projects, query]);

    const selectedProject = useMemo(() => {
        return (
            projects.find(
                (project) => project.projectId === selectedProjectId,
            ) ?? null
        );
    }, [projects, selectedProjectId]);

    const openProjectDetail = (project: FirebaseProject) => {
        setDetailOpen(true);
        void selectProject(project.projectId).catch((selectError) => {
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
            const project = await addFirebase(values);
            toast.success('Firebase added to project');
            setDetailOpen(true);
            void selectProject(project.projectId).catch(() => undefined);
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
        return <LoadingScreen label="Checking Firebase credentials…" variant="robot" />;
    }

    if (status && !status.configured) {
        return (
            <div className="-m-4 space-y-0 bg-muted sm:-m-6">
                <DocumentTitle title="Firebase" />
                <div className="px-4 py-4 sm:px-6">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">
                        Firebase
                    </h1>
                </div>
                <FirebaseEmptyState
                    title="Firebase is not configured"
                    description="Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON in .env.local, then restart the dev server."
                />
            </div>
        );
    }

    if (loadingProjects && projects.length === 0) {
        return <LoadingScreen label="Loading Firebase projects…" variant="robot" />;
    }

    return (
        <div className="space-y-4">
            <DocumentTitle title="Firebase" />

            <div className="-m-4 space-y-0 bg-muted sm:-m-6">
                <ProjectsToolbar
                    query={query}
                    onQueryChange={setQuery}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onAddFirebase={() => setAddOpen(true)}
                    projectCount={filteredProjects.length}
                />

                {error && projects.length === 0 ? (
                    <FirebaseEmptyState
                        title="Could not load projects"
                        description={error}
                    />
                ) : filteredProjects.length === 0 ? (
                    <FirebaseEmptyState
                        title={
                            query.trim()
                                ? 'No matching projects'
                                : 'No Firebase projects yet'
                        }
                        description={
                            query.trim()
                                ? 'Try a different search.'
                                : 'Add Firebase to a GCP project to get started.'
                        }
                        showAdd={!query.trim()}
                        onAdd={() => setAddOpen(true)}
                    />
                ) : viewMode === 'table' ? (
                    <ProjectsTable
                        projects={filteredProjects}
                        onManage={openProjectDetail}
                    />
                ) : (
                    <ProjectsCardGrid
                        projects={filteredProjects}
                        onManage={openProjectDetail}
                    />
                )}
            </div>

            <ProjectDetailSheet
                open={detailOpen}
                project={selectedProject}
                loading={loadingDetail}
                apps={apps}
                authConfig={authConfig}
                providers={providers}
                providerOpen={providerOpen}
                onProviderOpenChange={setProviderOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) {
                        void selectProject(null).catch(() => undefined);
                    }
                }}
                onCreateApp={() => setCreateAppOpen(true)}
                onViewConfig={(app) => {
                    void handleViewConfig(app);
                }}
                onDeleteApp={setPendingDeleteApp}
                onAddDomain={handleAddDomain}
                onRemoveDomain={handleRemoveDomain}
                onCreateProvider={handleCreateProvider}
                onToggleProvider={handleToggleProvider}
                onEnableFirestore={handleEnableFirestore}
                onEnableStorage={handleEnableStorage}
            />

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
