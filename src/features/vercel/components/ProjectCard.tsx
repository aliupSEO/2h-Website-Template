import { Loading } from '@/components/common';
import { ExternalLink, KeyRound, Rocket } from 'lucide-react';
import { Button } from '@/components/ui';
import {
    PROJECT_BRAND_ACTION_CLASS,
    PROJECT_DEPLOYMENTS_ACTION_CLASS,
    PROJECT_OUTLINE_ACTION_CLASS,
} from '@/features/vercel/constants';
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
import { EnvVarCountBadge } from './EnvVarCountBadge';
import { FrameworkBadge } from './FrameworkBadge';

type ProjectCardProps = {
    project: VercelProject;
    summary: VercelProjectSummary;
    onOpenDeployments: (project: VercelProject) => void;
    onOpenEnv: (project: VercelProject) => void;
};

export const ProjectCard = ({
    project,
    summary,
    onOpenDeployments,
    onOpenEnv,
}: ProjectCardProps) => {
    const productionUrl = toVercelAbsoluteUrl(project.productionUrl);
    const productionHost = productionUrl?.replace(/^https?:\/\//, '');
    const latest = summary.latestDeployment;

    return (
        <article
            className={cn(
                'group/project relative flex h-full flex-col overflow-hidden rounded-xl',
                'bg-card ring-1 ring-white/[0.08]',
                'transition-[box-shadow,ring-color,background-color] duration-300 ease-out',
                'hover:bg-[#323232] hover:ring-primary/40',
                'hover:shadow-[0_0_0_1px_rgba(198,245,50,0.1),0_12px_40px_rgba(0,0,0,0.45)]',
            )}
        >
            <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover/project:scale-x-100"
            />

            <div className="relative flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    {project.framework ? (
                        <FrameworkBadge framework={project.framework} />
                    ) : (
                        <span className="inline-flex h-6 w-[4.75rem] shrink-0 items-center justify-center truncate rounded bg-primary px-2 text-xs font-bold tracking-wide text-black">
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
                            : 'text-primary/50',
                    )}
                >
                    {productionHost || 'No production URL yet'}
                </p>

                <div className="mt-4 rounded-md bg-black/25 p-2.5 ring-1 ring-white/[0.05]">
                    <div className="flex flex-wrap items-center gap-2 px-1.5 py-1.5">
                        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                            <p className="text-[11px] font-semibold tracking-wide text-foreground/45 uppercase">
                                Deployment
                            </p>
                            {summary.loadingDeployment ? (
                                <Loading size="sm" />
                            ) : latest ? (
                                <DeploymentStatusBadge state={latest.state} />
                            ) : (
                                <p className="text-[11px] text-primary">
                                    None
                                </p>
                            )}
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className={PROJECT_DEPLOYMENTS_ACTION_CLASS}
                            onClick={() => onOpenDeployments(project)}
                        >
                            <Rocket className="size-3.5" />
                            Deployments
                        </Button>
                    </div>

                    <div
                        aria-hidden
                        className="-mx-2.5 my-1.5 h-px bg-white/[0.08]"
                    />

                    <div className="flex flex-wrap items-center gap-2 px-1.5 py-1.5">
                        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
                            <p className="text-[11px] font-semibold tracking-wide text-foreground/45 uppercase">
                                Env vars
                            </p>
                            {summary.loadingEnv ? (
                                <Loading size="sm" />
                            ) : (
                                <EnvVarCountBadge count={summary.envVarCount} />
                            )}
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className={cn(
                                PROJECT_OUTLINE_ACTION_CLASS,
                                'ring-white/12',
                            )}
                            onClick={() => onOpenEnv(project)}
                        >
                            <KeyRound className="size-3.5" />
                            Environment
                        </Button>
                    </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-xs text-primary">
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

            {productionUrl ? (
                <div className="relative border-t border-white/[0.06] bg-black/35 p-3.5 transition-colors duration-300 ease-out group-hover/project:border-primary/15 group-hover/project:bg-black/50">
                    <Button
                        asChild
                        size="sm"
                        variant="brand"
                        className={PROJECT_BRAND_ACTION_CLASS}
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
                </div>
            ) : null}
        </article>
    );
};
