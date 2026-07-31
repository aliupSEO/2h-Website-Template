import { useState } from 'react';
import {
    Check,
    Copy,
    ExternalLink,
    GitBranch,
    Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { GitRepo } from '@/features/git/types';
import {
    formatRepoRelativeUpdatedAt,
    formatRepoUpdatedAt,
} from '@/features/git/utils';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { RepoRowActions } from './RepoRowActions';
import { RepoVisibilityBadge } from './RepoVisibilityBadge';

type RepoCardProps = {
    repo: GitRepo;
    onEdit: (repo: GitRepo) => void;
    onDelete: (repo: GitRepo) => void;
    onViewBranches: (repo: GitRepo) => void;
};

export const RepoCard = ({
    repo,
    onEdit,
    onDelete,
    onViewBranches,
}: RepoCardProps) => {
    const description = repo.description?.trim();
    const [copied, setCopied] = useState(false);

    const copyCloneUrl = async () => {
        try {
            await navigator.clipboard.writeText(repo.cloneUrl);
            setCopied(true);
            toast.success('Clone URL copied');
            window.setTimeout(() => setCopied(false), 1600);
        }
        catch {
            toast.error('Could not copy URL');
        }
    };

    return (
        <article
            className={cn(
                'group/repo relative flex h-full flex-col overflow-hidden rounded-3xl',
                'bg-card ring-1 ring-white/[0.08]',
                'transition-[box-shadow,ring-color,background-color] duration-300 ease-out',
                'hover:bg-[#323232] hover:ring-primary/40',
                'hover:shadow-[0_0_0_1px_rgba(198,245,50,0.1),0_12px_40px_rgba(0,0,0,0.45)]',
            )}
        >
            <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover/repo:scale-x-100"
            />

            <div className="relative flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <RepoVisibilityBadge isPrivate={repo.private} />
                    <RepoRowActions
                        repo={repo}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onViewBranches={onViewBranches}
                    />
                </div>

                <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                    {repo.owner}
                </p>
                <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate font-heading text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 ease-out hover:text-primary group-hover/repo:text-primary"
                >
                    {repo.name}
                </a>

                <p
                    className={cn(
                        'mt-3 line-clamp-2 min-h-10 text-sm leading-relaxed',
                        description
                            ? 'text-foreground/70'
                            : 'text-muted-foreground/50',
                    )}
                >
                    {description ||
                        'No description yet — open on GitHub or edit from the hub.'}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded bg-primary px-2.5 py-1 text-xs font-bold text-black">
                        <GitBranch className="size-3.5 text-black" />
                        <span className="font-bold text-black">
                            {repo.defaultBranch}
                        </span>
                    </span>
                    <span
                        className="tabular-nums"
                        title={formatRepoUpdatedAt(repo.updatedAt)}
                    >
                        Updated{' '}
                        <span className="font-semibold text-primary">
                            {formatRepoRelativeUpdatedAt(repo.updatedAt)}
                        </span>
                    </span>
                </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-black/35 p-3.5 transition-colors duration-300 ease-out group-hover/repo:border-primary/15 group-hover/repo:bg-black/50">
                <Button
                    asChild
                    size="sm"
                    variant="brand"
                    className="h-10 min-w-0 flex-1 rounded-md transition-[box-shadow,filter] duration-200 ease-out hover:shadow-[0_0_20px_rgba(198,245,50,0.3)] hover:brightness-110 active:scale-[0.99]"
                >
                    <a href={repo.htmlUrl} target="_blank" rel="noreferrer">
                        <ExternalLink data-icon="inline-start" />
                        Open on GitHub
                    </a>
                </Button>
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-10 rounded-md border-0 border-transparent ring-1 ring-inset ring-white/12 transition-[background-color,color,box-shadow,ring-color] duration-200 ease-out hover:bg-primary hover:text-black hover:shadow-[0_0_18px_rgba(198,245,50,0.25)] hover:ring-primary active:scale-[0.98]"
                    aria-label={`View branches for ${repo.fullName}`}
                    onClick={() => onViewBranches(repo)}
                >
                    <GitBranch className="size-4" />
                </Button>
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-10 rounded-md border-0 border-transparent ring-1 ring-inset ring-white/12 transition-[background-color,color,box-shadow,ring-color] duration-200 ease-out hover:bg-primary hover:text-black hover:shadow-[0_0_18px_rgba(198,245,50,0.25)] hover:ring-primary active:scale-[0.98]"
                    aria-label={`Edit ${repo.fullName}`}
                    onClick={() => onEdit(repo)}
                >
                    <Pencil className="size-4" />
                </Button>
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-10 rounded-md border-0 border-transparent ring-1 ring-inset ring-white/12 transition-[background-color,color,box-shadow,ring-color] duration-200 ease-out hover:bg-primary hover:text-black hover:shadow-[0_0_18px_rgba(198,245,50,0.25)] hover:ring-primary active:scale-[0.98]"
                    aria-label={`Copy clone URL for ${repo.fullName}`}
                    onClick={() => void copyCloneUrl()}
                >
                    {copied ? (
                        <Check className="size-4" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </Button>
            </div>
        </article>
    );
};
