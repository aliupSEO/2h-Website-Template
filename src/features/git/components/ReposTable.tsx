import { Copy, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { GitRepo } from '@/features/git/types';
import { toast } from '@/lib/toast';
import { RepoVisibilityBadge } from './RepoVisibilityBadge';

type ReposTableProps = {
    repos: GitRepo[];
    onEdit: (repo: GitRepo) => void;
    onDelete: (repo: GitRepo) => void;
};

const formatUpdatedAt = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const ReposTable = ({ repos, onEdit, onDelete }: ReposTableProps) => {
    const copyCloneUrl = async (repo: GitRepo) => {
        try {
            await navigator.clipboard.writeText(repo.cloneUrl);
            toast.success('Clone URL copied');
        }
        catch {
            toast.error('Could not copy URL');
        }
    };

    return (
        <div className="rounded-xl border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead>Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Default branch</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {repos.map((repo) => (
                        <TableRow key={repo.id} className="border-white/5">
                            <TableCell>
                                <div className="space-y-0.5">
                                    <a
                                        href={repo.htmlUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-foreground underline-offset-4 hover:underline"
                                    >
                                        {repo.name}
                                    </a>
                                    {repo.description ? (
                                        <p className="max-w-xs truncate text-xs text-muted-foreground">
                                            {repo.description}
                                        </p>
                                    ) : null}
                                </div>
                            </TableCell>
                            <TableCell>{repo.owner}</TableCell>
                            <TableCell>
                                <RepoVisibilityBadge isPrivate={repo.private} />
                            </TableCell>
                            <TableCell>{repo.defaultBranch}</TableCell>
                            <TableCell>{formatUpdatedAt(repo.updatedAt)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label={`Open ${repo.fullName} on GitHub`}
                                        onClick={() => window.open(repo.htmlUrl, '_blank', 'noreferrer')}
                                    >
                                        <ExternalLink className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label={`Copy clone URL for ${repo.fullName}`}
                                        onClick={() => void copyCloneUrl(repo)}
                                    >
                                        <Copy className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label={`Edit ${repo.fullName}`}
                                        onClick={() => onEdit(repo)}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        aria-label={`Delete ${repo.fullName}`}
                                        onClick={() => onDelete(repo)}
                                    >
                                        <Trash2 className="size-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
