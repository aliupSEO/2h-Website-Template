import { Loading } from '@/components/common';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui';
import type { VercelDeployment, VercelEnvVar } from '@/features/vercel/types';
import { cn } from '@/lib/utils';
import { DeploymentsTable } from './DeploymentsTable';
import { EnvVarsTable } from './EnvVarsTable';

type ProjectDetailDialogProps = {
    open: boolean;
    mode: 'deployments' | 'env' | null;
    projectName: string;
    loading: boolean;
    deployments: VercelDeployment[];
    envVars: VercelEnvVar[];
    redeployingId: string | null;
    onOpenChange: (open: boolean) => void;
    onRedeploy: (deployment: VercelDeployment) => void;
    onCreateEnv: () => void;
    onEditEnv: (envVar: VercelEnvVar) => void;
    onDeleteEnv: (envVar: VercelEnvVar) => void;
};

export const ProjectDetailDialog = ({
    open,
    mode,
    projectName,
    loading,
    deployments,
    envVars,
    redeployingId,
    onOpenChange,
    onRedeploy,
    onCreateEnv,
    onEditEnv,
    onDeleteEnv,
}: ProjectDetailDialogProps) => {
    const title = mode === 'env' ? 'Environment' : 'Deployments';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                showCloseButton
                className={cn(
                    'w-full gap-0 overflow-hidden border-0 bg-[#1a1a1a] p-0',
                    mode === 'env' ? 'sm:max-w-4xl' : 'sm:max-w-3xl',
                )}
            >
                <SheetHeader className="shrink-0 space-y-1 border-b border-white/5 px-5 py-4 pr-12 text-left">
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                        {projectName}
                    </p>
                    <SheetTitle className="font-heading text-lg font-semibold tracking-tight text-foreground">
                        {title}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        {title} for {projectName}
                    </SheetDescription>
                </SheetHeader>

                <div
                    className={cn(
                        'min-h-0 flex-1',
                        loading
                            ? 'flex items-center justify-center'
                            : 'overflow-y-auto',
                    )}
                >
                    {loading ? (
                        <Loading
                            size="md"
                            label={
                                mode === 'env'
                                    ? 'Loading env vars…'
                                    : 'Loading deployments…'
                            }
                        />
                    ) : mode === 'deployments' ? (
                        <DeploymentsTable
                            deployments={deployments}
                            redeployingId={redeployingId}
                            onRedeploy={onRedeploy}
                        />
                    ) : mode === 'env' ? (
                        <EnvVarsTable
                            envVars={envVars}
                            onCreate={onCreateEnv}
                            onEdit={onEditEnv}
                            onDelete={onDeleteEnv}
                        />
                    ) : null}
                </div>
            </SheetContent>
        </Sheet>
    );
};
