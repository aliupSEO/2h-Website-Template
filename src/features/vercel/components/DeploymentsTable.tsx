import { ExternalLink, RefreshCw } from 'lucide-react';
import { Loading } from '@/components/common';
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
import { DeploymentStatusBadge } from './DeploymentStatusBadge';

type DeploymentsTableProps = {
    deployments: VercelDeployment[];
    redeployingId: string | null;
    onRedeploy: (deployment: VercelDeployment) => void;
};

const formatDate = (value: number) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const DeploymentsTable = ({
    deployments,
    redeployingId,
    onRedeploy,
}: DeploymentsTableProps) => {
    if (deployments.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No deployments found for this project.
            </p>
        );
    }

    return (
        <div className="rounded-xl border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead>Status</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deployments.map((deployment) => {
                        const busy = redeployingId === deployment.id;
                        return (
                            <TableRow key={deployment.id} className="border-white/5">
                                <TableCell>
                                    <DeploymentStatusBadge state={deployment.state} />
                                </TableCell>
                                <TableCell>
                                    {deployment.target ?? 'preview'}
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-0.5">
                                        <p>{deployment.branch ?? '—'}</p>
                                        {deployment.sha ? (
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {deployment.sha.slice(0, 7)}
                                            </p>
                                        ) : null}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {formatDate(deployment.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        {deployment.url ? (
                                            <Button
                                                asChild
                                                size="icon-sm"
                                                variant="ghost"
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
                                            <Button asChild size="sm" variant="outline">
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
                                            disabled={Boolean(redeployingId)}
                                            onClick={() => onRedeploy(deployment)}
                                        >
                                            {busy ? (
                                                <Loading size="sm" />
                                            ) : (
                                                <RefreshCw className="size-4" />
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
