import { Loading } from '@/components/common';
import { KeyRound, Rocket } from 'lucide-react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import { PROJECT_DEPLOYMENTS_ACTION_CLASS, PROJECT_OUTLINE_ACTION_CLASS } from '@/features/vercel/constants';
import type {
    VercelProject,
    VercelProjectSummary,
} from '@/features/vercel/types';
import {
    formatVercelDate,
    formatVercelRelative,
} from '@/features/vercel/utils';
import { cn } from '@/lib/utils';
import { DeploymentStatusBadge } from './DeploymentStatusBadge';
import { EnvVarCountBadge } from './EnvVarCountBadge';
import { FrameworkBadge } from './FrameworkBadge';

type ProjectsTableProps = {
    projects: VercelProject[];
    summaries: Record<string, VercelProjectSummary>;
    onOpenDeployments: (project: VercelProject) => void;
    onOpenEnv: (project: VercelProject) => void;
};

const headClass =
    'h-12 px-4 text-sm font-extrabold tracking-wide text-black uppercase sm:px-6';
const headCenterClass = `${headClass} text-center`;
const cellCenterClass = 'px-4 py-3.5 text-center sm:px-6';

export const ProjectsTable = ({
    projects,
    summaries,
    onOpenDeployments,
    onOpenEnv,
}: ProjectsTableProps) => {
    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-muted shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-0 bg-primary hover:bg-primary">
                        <TableHead className={headClass}>Name</TableHead>
                        <TableHead className={headCenterClass}>
                            Framework
                        </TableHead>
                        <TableHead className={headCenterClass}>
                            Deployment
                        </TableHead>
                        <TableHead className={headCenterClass}>
                            Env vars
                        </TableHead>
                        <TableHead className={headClass}>Updated</TableHead>
                        <TableHead
                            className={`${headClass} w-[12rem] text-right`}
                        >
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => {
                        const summary = summaries[project.id] ?? {
                            latestDeployment: null,
                            deploymentCount: 0,
                            envVarCount: 0,
                            loading: true,
                            loadingDeployment: true,
                            loadingEnv: true,
                            summaryOnly: true,
                        };
                        const latest = summary.latestDeployment;

                        return (
                            <TableRow
                                key={project.id}
                                className="group/row border-white/5 hover:bg-white/[0.035]"
                            >
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <div className="min-w-0 space-y-1">
                                        <p className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
                                            {project.name}
                                        </p>
                                        {project.productionUrl ? (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {project.productionUrl.replace(
                                                    /^https?:\/\//,
                                                    '',
                                                )}
                                            </p>
                                        ) : null}
                                    </div>
                                </TableCell>
                                <TableCell className={cellCenterClass}>
                                    {project.framework ? (
                                        <FrameworkBadge
                                            framework={project.framework}
                                        />
                                    ) : (
                                        <span className="text-muted-foreground">
                                            —
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className={cellCenterClass}>
                                    {summary.loadingDeployment ? (
                                        <Loading size="sm" />
                                    ) : latest ? (
                                        <DeploymentStatusBadge
                                            state={latest.state}
                                        />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            No deployments
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className={cellCenterClass}>
                                    {summary.loadingEnv ? (
                                        <Loading size="sm" />
                                    ) : (
                                        <EnvVarCountBadge
                                            count={summary.envVarCount}
                                        />
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <div className="space-y-0.5">
                                        <p
                                            className="text-sm font-semibold text-primary"
                                            title={formatVercelDate(
                                                project.updatedAt,
                                            )}
                                        >
                                            {formatVercelRelative(
                                                project.updatedAt,
                                            )}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {formatVercelDate(
                                                project.updatedAt,
                                            )}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3.5 text-right sm:px-6">
                                    <div className="flex flex-wrap justify-end gap-1.5">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className={PROJECT_DEPLOYMENTS_ACTION_CLASS}
                                            onClick={() =>
                                                onOpenDeployments(project)
                                            }
                                        >
                                            <Rocket className="size-3.5" />
                                            Deployments
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className={cn(
                                                PROJECT_OUTLINE_ACTION_CLASS,
                                                'ring-white/10',
                                            )}
                                            onClick={() => onOpenEnv(project)}
                                        >
                                            <KeyRound className="size-3.5" />
                                            Env
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
