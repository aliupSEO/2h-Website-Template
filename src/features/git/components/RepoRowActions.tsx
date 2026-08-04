import {
    Copy,
    ExternalLink,
    GitBranch,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui';
import type { GitRepo } from '@/features/git/types';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

type RepoRowActionsProps = {
    repo: GitRepo;
    onEdit: (repo: GitRepo) => void;
    onDelete: (repo: GitRepo) => void;
    onViewBranches: (repo: GitRepo) => void;
    /** Show open + copy as quick icon buttons (table view). */
    dense?: boolean;
};

export const RepoRowActions = ({
    repo,
    onEdit,
    onDelete,
    onViewBranches,
    dense = false,
}: RepoRowActionsProps) => {
    const copyCloneUrl = async () => {
        try {
            await navigator.clipboard.writeText(repo.cloneUrl);
            toast.success('Clone URL copied');
        }
        catch {
            toast.error('Could not copy URL');
        }
    };

    return (
        <div
            className={cn(
                'flex items-center justify-end gap-0.5',
                dense && 'transition-opacity',
            )}
        >
            {dense ? (
                <>
                    <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        asChild
                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                    >
                        <a
                            href={repo.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open ${repo.fullName} on GitHub`}
                        >
                            <ExternalLink className="size-4" />
                        </a>
                    </Button>
                    <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Copy clone URL for ${repo.fullName}`}
                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                        onClick={() => void copyCloneUrl()}
                    >
                        <Copy className="size-4" />
                    </Button>
                </>
            ) : null}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Actions for ${repo.fullName}`}
                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                    >
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-48 border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
                >
                    <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        onClick={() => onViewBranches(repo)}
                    >
                        <GitBranch className="size-4" />
                        Branches
                    </DropdownMenuItem>
                    {!dense ? (
                        <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={() => void copyCloneUrl()}
                        >
                            <Copy className="size-4" />
                            Copy clone URL
                        </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        onClick={() => onEdit(repo)}
                    >
                        <Pencil className="size-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer gap-2 text-destructive"
                        onClick={() => onDelete(repo)}
                    >
                        <Trash2 className="size-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
