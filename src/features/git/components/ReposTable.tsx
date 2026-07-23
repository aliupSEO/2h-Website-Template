import { GitBranch } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { GitRepo } from '@/features/git/types';
import {
    formatRepoRelativeUpdatedAt,
    formatRepoUpdatedAt,
    getRepoOwnerInitial,
} from '@/features/git/utils';
import { cn } from '@/lib/utils';
import { RepoRowActions } from './RepoRowActions';
import { RepoVisibilityBadge } from './RepoVisibilityBadge';

type ReposTableProps = {
    repos: GitRepo[];
    onEdit: (repo: GitRepo) => void;
    onDelete: (repo: GitRepo) => void;
};

const headClass =
    'h-14 px-4 text-sm font-extrabold tracking-wide text-black uppercase sm:px-6';

export const ReposTable = ({
    repos,
    onEdit,
    onDelete,
}: ReposTableProps) => {
    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-muted shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-0 bg-primary hover:bg-primary">
                        <TableHead className={headClass}>Repository</TableHead>
                        <TableHead className={headClass}>Owner</TableHead>
                        <TableHead className={headClass}>Visibility</TableHead>
                        <TableHead className={headClass}>Branch</TableHead>
                        <TableHead className={headClass}>Updated</TableHead>
                        <TableHead
                            className={cn(headClass, 'w-[7.5rem] text-right')}
                        >
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {repos.map((repo) => (
                        <TableRow
                            key={repo.id}
                            className="group/row border-white/5 hover:bg-white/[0.035]"
                        >
                            <TableCell className="max-w-[22rem] px-4 py-3.5 whitespace-normal sm:px-6">
                                <div className="min-w-0 space-y-1">
                                    <a
                                        href={repo.htmlUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block truncate font-heading text-[15px] font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                                    >
                                        {repo.name}
                                    </a>
                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                        {repo.description?.trim() ||
                                            'No description'}
                                    </p>
                                </div>
                            </TableCell>

                            <TableCell className="px-4 py-3.5 sm:px-6">
                                <div className="inline-flex max-w-[12rem] items-center gap-2.5">
                                    <span
                                        aria-hidden
                                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-black"
                                    >
                                        {getRepoOwnerInitial(repo.owner)}
                                    </span>
                                    <span className="truncate text-sm font-medium text-foreground">
                                        {repo.owner}
                                    </span>
                                </div>
                            </TableCell>

                            <TableCell className="px-4 py-3.5 sm:px-6">
                                <RepoVisibilityBadge isPrivate={repo.private} />
                            </TableCell>

                            <TableCell className="px-4 py-3.5 sm:px-6">
                                <span className="inline-flex max-w-[9rem] items-center gap-1.5 truncate rounded bg-primary px-2 py-1 text-xs font-bold text-black">
                                    <GitBranch className="size-3.5 shrink-0 text-black" />
                                    <span className="truncate">
                                        {repo.defaultBranch}
                                    </span>
                                </span>
                            </TableCell>

                            <TableCell className="px-4 py-3.5 sm:px-6">
                                <div className="space-y-0.5">
                                    <p
                                        className="text-sm font-semibold text-primary"
                                        title={formatRepoUpdatedAt(
                                            repo.updatedAt,
                                        )}
                                    >
                                        {formatRepoRelativeUpdatedAt(
                                            repo.updatedAt,
                                        )}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {formatRepoUpdatedAt(repo.updatedAt)}
                                    </p>
                                </div>
                            </TableCell>

                            <TableCell className="px-4 py-3.5 text-right sm:px-6">
                                <RepoRowActions
                                    dense
                                    repo={repo}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
