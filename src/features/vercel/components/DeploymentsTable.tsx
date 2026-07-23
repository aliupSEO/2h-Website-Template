import { ExternalLink, GitBranch, RefreshCw } from 'lucide-react';
import { ButtonSpinner } from '@/components/common';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { VercelDeployment } from '@/features/vercel/types';
import {
    formatVercelDateTime,
    formatVercelRelative,
} from '@/features/vercel/utils';
import { DeploymentStatusBadge } from './DeploymentStatusBadge';
import { VercelEmptyState } from './VercelEmptyState';

type DeploymentsTableProps = {
    deployments: VercelDeployment[];
    redeployingId: string | null;
    onRedeploy: (deployment: VercelDeployment) => void;
};

const headClass =
    'h-12 px-4 text-sm font-extrabold tracking-wide text-black uppercase sm:px-6';

export const DeploymentsTable = ({
    deployments,
    redeployingId,
    onRedeploy,
}: DeploymentsTableProps) => {
    if (deployments.length === 0) {
        return (
            <VercelEmptyState
                title="No deployments yet"
                description="Deployments for this project will show up here."
            />
        );
    }

    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 border-t border-white/5 bg-muted shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-0 bg-primary hover:bg-primary">
                        <TableHead className={headClass}>Status</TableHead>
                        <TableHead className={headClass}>Target</TableHead>
                        <TableHead className={headClass}>Branch</TableHead>
                        <TableHead className={headClass}>Created</TableHead>
                        <TableHead
                            className={`${headClass} w-[9rem] text-right`}
                        >
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deployments.map((deployment, index) => {
                        const busy = redeployingId === deployment.id;
                        return (
                            <TableRow
                                key={deployment.id}
                                style={{
                                    animationDelay: `${Math.min(index, 16) * 35}ms`,
                                }}
                                className="group/row animate-in fade-in fill-mode-both border-white/5 duration-300 hover:bg-white/[0.035]"
                            >
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <DeploymentStatusBadge
                                        state={deployment.state}
                                    />
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <span className="inline-flex rounded-md bg-white/10 px-2 py-1 text-xs font-medium capitalize text-foreground/90 ring-1 ring-white/10">
                                        {deployment.target ?? 'preview'}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <div className="space-y-1">
                                        <span className="inline-flex max-w-[10rem] items-center gap-1.5 truncate rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-foreground/90 ring-1 ring-white/10">
                                            <GitBranch className="size-3.5 shrink-0 text-primary" />
                                            <span className="truncate">
                                                {deployment.branch ?? '—'}
                                            </span>
                                        </span>
                                        {deployment.sha ? (
                                            <p className="font-mono text-[11px] text-muted-foreground">
                                                {deployment.sha.slice(0, 7)}
                                            </p>
                                        ) : null}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <div className="space-y-0.5">
                                        <p
                                            className="text-sm text-foreground/90"
                                            title={formatVercelDateTime(
                                                deployment.createdAt,
                                            )}
                                        >
                                            {formatVercelRelative(
                                                deployment.createdAt,
                                            )}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {formatVercelDateTime(
                                                deployment.createdAt,
                                            )}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3.5 text-right sm:px-6">
                                    <div className="flex items-center justify-end gap-0.5">
                                        {deployment.url ? (
                                            <Button
                                                asChild
                                                size="icon-sm"
                                                variant="ghost"
                                                className="text-foreground/80 hover:bg-primary/15 hover:text-primary"
                                                aria-label="Open deployment"
                                            >
                                                <a
                                                    href={deployment.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <ExternalLink className="size-4" />
                                                </a>
                                            </Button>
                                        ) : null}
                                        {deployment.inspectorUrl ? (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 px-2 text-foreground/80 hover:bg-primary/15 hover:text-primary"
                                            >
                                                <a
                                                    href={deployment.inspectorUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Logs
                                                </a>
                                            </Button>
                                        ) : null}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-1.5 rounded-md ring-1 ring-white/10 hover:bg-primary/15 hover:text-primary hover:ring-primary/30"
                                            disabled={Boolean(redeployingId)}
                                            onClick={() =>
                                                onRedeploy(deployment)
                                            }
                                        >
                                            {busy ? (
                                                <ButtonSpinner />
                                            ) : (
                                                <RefreshCw className="size-3.5" />
                                            )}
                                            Redeploy
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
