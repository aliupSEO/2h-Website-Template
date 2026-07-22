import { ExternalLink, KeyRound, Rocket } from 'lucide-react';
import { Button } from '@/components/ui';
import type {
    VercelProject,
    VercelProjectSummary,
} from '@/features/vercel/types';
import {
    formatVercelDate,
    formatVercelRelative,
    toVercelAbsoluteUrl,
} from '@/features/vercel/utils';
import { cn } from '@/lib/utils';
import { DeploymentStatusBadge } from './DeploymentStatusBadge';
import { FrameworkBadge } from './FrameworkBadge';

type ProjectCardProps = {
    project: VercelProject;
    summary: VercelProjectSummary;
    selected?: boolean;
    onOpenDeployments: (project: VercelProject) => void;
    onOpenEnv: (project: VercelProject) => void;
};

export const ProjectCard = ({
    project,
    summary,
    selected = false,
    onOpenDeployments,
    onOpenEnv,
}: ProjectCardProps) => {
    const productionUrl = toVercelAbsoluteUrl(project.productionUrl);
    const productionHost = productionUrl?.replace(/^https?:\/\//, '');
    const latest = summary.latestDeployment;

    return (
        <article
            className={cn(
                'group/project relative flex h-full flex-col overflow-hidden rounded-3xl',
                'bg-[#1a1a1a] ring-1 ring-white/[0.08]',
                'transition-[box-shadow,ring-color,background-color] duration-300 ease-out',
                'hover:bg-[#1f1f1f] hover:ring-primary/40',
                'hover:shadow-[0_0_0_1px_rgba(198,245,50,0.1),0_12px_40px_rgba(0,0,0,0.45)]',
                selected && 'ring-primary/50 bg-[#1f1f1f]',
            )}
        >
            <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover/project:scale-x-100"
            />

            <div className="relative flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    {project.framework ? (
                        <FrameworkBadge
                            framework={project.framework}
                            className="rounded-full text-[11px]"
                        />
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                            Project
                        </span>
                    )}
                </div>

                <p className="truncate font-heading text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover/project:text-primary">
                    {project.name}
                </p>

                <p
                    className={cn(
                        'mt-2 line-clamp-1 text-sm',
                        productionHost
                            ? 'text-foreground/70'
                            : 'text-muted-foreground/50',
                    )}
                >
                    {productionHost || 'No production URL yet'}
                </p>

                <div className="mt-4 space-y-2.5 rounded-xl bg-black/25 p-3 ring-1 ring-white/[0.05]">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold tracking-wide text-foreground/45 uppercase">
                            Deployment
                        </p>
                        {summary.loading ? (
                            <span className="text-[11px] text-muted-foreground">
                                Loading…
                            </span>
                        ) : latest ? (
                            <DeploymentStatusBadge state={latest.state} />
                        ) : (
                            <span className="text-[11px] text-muted-foreground">
                                None
                            </span>
                        )}
                    </div>
                    {!summary.loading && latest ? (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/70">
                            <span className="tabular-nums text-muted-foreground">
                                {formatVercelRelative(latest.createdAt)}
                            </span>
                            {!summary.summaryOnly ? (
                                <span className="text-muted-foreground">
                                    · {summary.deploymentCount} total
                                </span>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5">
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-foreground/45 uppercase">
                            <KeyRound className="size-3" />
                            Env vars
                        </p>
                        {summary.loading ? (
                            <span className="text-[11px] text-muted-foreground">
                                Loading…
                            </span>
                        ) : (
                            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/25">
                                {summary.envVarCount}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-xs text-muted-foreground">
                    <span
                        className="tabular-nums"
                        title={formatVercelDate(project.updatedAt)}
                    >
                        Updated{' '}
                        <span className="font-semibold text-primary">
                            {formatVercelRelative(project.updatedAt)}
                        </span>
                    </span>
                </div>
            </div>

            <div className="relative flex flex-col gap-2 border-t border-white/[0.06] bg-black/35 p-3.5 transition-colors duration-300 ease-out group-hover/project:border-primary/15 group-hover/project:bg-black/50">
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-10 min-w-0 flex-1 rounded-md ring-1 ring-white/10 hover:bg-primary/15 hover:text-primary hover:ring-primary/30"
                        onClick={() => onOpenDeployments(project)}
                    >
                        <Rocket data-icon="inline-start" />
                        Deployments
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-10 min-w-0 flex-1 rounded-md ring-1 ring-white/10 hover:bg-primary/15 hover:text-primary hover:ring-primary/30"
                        onClick={() => onOpenEnv(project)}
                    >
                        <KeyRound data-icon="inline-start" />
                        Environment
                    </Button>
                </div>
                {productionUrl ? (
                    <Button
                        asChild
                        size="sm"
                        variant="brand"
                        className="h-10 w-full rounded-md"
                    >
                        <a
                            href={productionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink data-icon="inline-start" />
                            Open project
                        </a>
                    </Button>
                ) : null}
            </div>
        </article>
    );
};
