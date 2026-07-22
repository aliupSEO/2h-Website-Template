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
import { FrameworkBadge } from './FrameworkBadge';

type ProjectsTableProps = {
    projects: VercelProject[];
    summaries: Record<string, VercelProjectSummary>;
    selectedProjectId: string | null;
    onOpenDeployments: (project: VercelProject) => void;
    onOpenEnv: (project: VercelProject) => void;
};

const headClass =
    'h-12 px-4 text-xs font-bold tracking-[0.1em] text-primary uppercase sm:px-6';

export const ProjectsTable = ({
    projects,
    summaries,
    selectedProjectId,
    onOpenDeployments,
    onOpenEnv,
}: ProjectsTableProps) => {
    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 border-t border-white/5 bg-card shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-2 border-primary/40 bg-primary/15 hover:bg-primary/15">
                        <TableHead className={headClass}>Name</TableHead>
                        <TableHead className={headClass}>Framework</TableHead>
                        <TableHead className={headClass}>Deployment</TableHead>
                        <TableHead className={headClass}>Env vars</TableHead>
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
                            summaryOnly: true,
                        };
                        const latest = summary.latestDeployment;

                        return (
                            <TableRow
                                key={project.id}
                                className={cn(
                                    'group/row border-white/5 hover:bg-white/[0.035]',
                                    selectedProjectId === project.id &&
                                        'bg-primary/10 hover:bg-primary/15',
                                )}
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
                                <TableCell className="px-4 py-3.5 sm:px-6">
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
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    {summary.loading ? (
                                        <span className="text-xs text-muted-foreground">
                                            Loading…
                                        </span>
                                    ) : latest ? (
                                        <div className="space-y-1.5">
                                            <DeploymentStatusBadge
                                                state={latest.state}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {summary.summaryOnly
                                                    ? formatVercelRelative(
                                                          latest.createdAt,
                                                      )
                                                    : `${summary.deploymentCount} total`}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            No deployments
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    {summary.loading ? (
                                        <span className="text-xs text-muted-foreground">
                                            Loading…
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/25">
                                            <KeyRound className="size-3.5" />
                                            {summary.envVarCount}
                                        </span>
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
                                            className="h-8 gap-1.5 rounded-md px-2.5 ring-1 ring-white/10 hover:bg-primary/15 hover:text-primary hover:ring-primary/30"
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
                                            className="h-8 gap-1.5 rounded-md px-2.5 ring-1 ring-white/10 hover:bg-primary/15 hover:text-primary hover:ring-primary/30"
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
