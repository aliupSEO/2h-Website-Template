import { ExternalLink, Flame } from 'lucide-react';
import { Button } from '@/components/ui';
import type { FirebaseProject } from '@/features/firebase/types';
import { cn } from '@/lib/utils';
import { ProjectStateBadge } from './ProjectStateBadge';

type ProjectCardProps = {
    project: FirebaseProject;
    onManage: (project: FirebaseProject) => void;
};

export const ProjectCard = ({ project, onManage }: ProjectCardProps) => {
    const consoleUrl = `https://console.firebase.google.com/project/${encodeURIComponent(project.projectId)}`;

    return (
        <article
            className={cn(
                'group/project relative flex h-full flex-col overflow-hidden rounded-3xl',
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
                    <ProjectStateBadge state={project.state} />
                    <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                        <Flame className="size-4" aria-hidden />
                    </span>
                </div>

                <p className="truncate font-heading text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover/project:text-primary">
                    {project.displayName}
                </p>
                <p className="mt-2 truncate font-mono text-xs text-foreground/55">
                    {project.projectId}
                </p>

                {project.projectNumber ? (
                    <p className="mt-auto pt-5 text-xs text-muted-foreground">
                        Project number{' '}
                        <span className="font-semibold text-primary tabular-nums">
                            {project.projectNumber}
                        </span>
                    </p>
                ) : (
                    <div className="mt-auto pt-5" />
                )}
            </div>

            <div className="relative flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-black/35 p-3.5 transition-colors duration-300 ease-out group-hover/project:border-primary/15 group-hover/project:bg-black/50">
                <Button
                    type="button"
                    size="sm"
                    variant="brand"
                    className="h-10 min-w-0 flex-1 rounded-md transition-[box-shadow,filter] duration-200 ease-out hover:shadow-[0_0_20px_rgba(198,245,50,0.3)] hover:brightness-110 active:scale-[0.99]"
                    onClick={() => onManage(project)}
                >
                    Manage project
                </Button>
                <Button
                    asChild
                    size="icon"
                    variant="outline"
                    className="size-10 rounded-md border-0 border-transparent ring-1 ring-inset ring-white/12 transition-[background-color,color,box-shadow,ring-color] duration-200 ease-out hover:bg-primary hover:text-black hover:shadow-[0_0_18px_rgba(198,245,50,0.25)] hover:ring-primary active:scale-[0.98]"
                >
                    <a
                        href={consoleUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${project.displayName} in Firebase Console`}
                    >
                        <ExternalLink className="size-4" />
                    </a>
                </Button>
            </div>
        </article>
    );
};
