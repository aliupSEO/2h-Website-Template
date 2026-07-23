import { Loading } from '@/components/common';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui';
import type {
    FirebaseApp,
    FirebaseAuthConfig,
    FirebaseIdpProvider,
    FirebaseProject,
} from '@/features/firebase/types';
import type { UpsertIdpProviderSchema } from '@/features/firebase/schemas';
import { cn } from '@/lib/utils';
import { AppsTable } from './AppsTable';
import { AuthDomainsPanel } from './AuthDomainsPanel';
import { AuthProvidersPanel } from './AuthProvidersPanel';
import { ProjectStateBadge } from './ProjectStateBadge';
import { ServicesPanel } from './ServicesPanel';

type ProjectDetailSheetProps = {
    open: boolean;
    project: FirebaseProject | null;
    loading: boolean;
    apps: FirebaseApp[];
    authConfig: FirebaseAuthConfig | null;
    providers: FirebaseIdpProvider[];
    providerOpen: boolean;
    onProviderOpenChange: (open: boolean) => void;
    onOpenChange: (open: boolean) => void;
    onCreateApp: () => void;
    onViewConfig: (app: FirebaseApp) => void;
    onDeleteApp: (app: FirebaseApp) => void;
    onAddDomain: (domain: string) => Promise<void>;
    onRemoveDomain: (domain: string) => Promise<void>;
    onCreateProvider: (values: UpsertIdpProviderSchema) => Promise<void>;
    onToggleProvider: (
        provider: { idpId: string; clientId?: string | null },
        enabled: boolean,
    ) => Promise<void>;
    onEnableFirestore: () => Promise<void>;
    onEnableStorage: () => Promise<void>;
};

export const ProjectDetailSheet = ({
    open,
    project,
    loading,
    apps,
    authConfig,
    providers,
    providerOpen,
    onProviderOpenChange,
    onOpenChange,
    onCreateApp,
    onViewConfig,
    onDeleteApp,
    onAddDomain,
    onRemoveDomain,
    onCreateProvider,
    onToggleProvider,
    onEnableFirestore,
    onEnableStorage,
}: ProjectDetailSheetProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                showCloseButton
                className="w-full gap-0 overflow-hidden border-0 bg-[#1a1a1a] p-0 sm:max-w-3xl"
            >
                <SheetHeader className="shrink-0 space-y-2 border-b border-white/5 px-5 py-4 pr-12 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                            Firebase project
                        </p>
                        {project ? (
                            <ProjectStateBadge state={project.state} />
                        ) : null}
                    </div>
                    <SheetTitle className="font-heading text-lg font-semibold tracking-tight text-foreground">
                        {project?.displayName ?? 'Project'}
                    </SheetTitle>
                    <SheetDescription className="font-mono text-xs text-muted-foreground">
                        {project?.projectId ?? 'Select a project'}
                    </SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex min-h-64 items-center justify-center">
                            <Loading size="md" label="Loading project…" />
                        </div>
                    ) : (
                        <Tabs defaultValue="apps" className="gap-0">
                            <div className="border-b border-white/5 px-5 py-3">
                                <TabsList className="w-full justify-start bg-[#111111]">
                                    <TabsTrigger value="apps">Apps</TabsTrigger>
                                    <TabsTrigger value="auth">Auth</TabsTrigger>
                                    <TabsTrigger value="services">
                                        Services
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent
                                value="apps"
                                className={cn('mt-0 space-y-4 p-5')}
                            >
                                <AppsTable
                                    apps={apps}
                                    onCreate={onCreateApp}
                                    onViewConfig={onViewConfig}
                                    onDelete={onDeleteApp}
                                />
                            </TabsContent>

                            <TabsContent
                                value="auth"
                                className="mt-0 space-y-8 p-5"
                            >
                                <div className="space-y-3">
                                    <h2 className="font-heading text-lg font-semibold">
                                        Authorized domains
                                    </h2>
                                    <AuthDomainsPanel
                                        domains={
                                            authConfig?.authorizedDomains ?? []
                                        }
                                        onAdd={onAddDomain}
                                        onRemove={onRemoveDomain}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="font-heading text-lg font-semibold">
                                        Sign-in providers
                                    </h2>
                                    <AuthProvidersPanel
                                        providers={providers}
                                        createOpen={providerOpen}
                                        onCreateOpenChange={onProviderOpenChange}
                                        onCreate={onCreateProvider}
                                        onToggle={onToggleProvider}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="services"
                                className="mt-0 space-y-4 p-5"
                            >
                                <ServicesPanel
                                    onEnableFirestore={onEnableFirestore}
                                    onEnableStorage={onEnableStorage}
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
