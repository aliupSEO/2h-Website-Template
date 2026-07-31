import { ExternalLink, GitBranch as GitBranchIcon, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Loading } from '@/components/common';
import {
    Button,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui';
import type { GitBranch, GitCommit, GitRepo } from '@/features/git/types';
import { formatRepoRelativeUpdatedAt } from '@/features/git/utils';
import { cn } from '@/lib/utils';
import { githubService } from '@/services/githubService';

type RepoBranchesSheetProps = {
    open: boolean;
    repo: GitRepo | null;
    onOpenChange: (open: boolean) => void;
};

export const RepoBranchesSheet = ({
    open,
    repo,
    onOpenChange,
}: RepoBranchesSheetProps) => {
    const [branches, setBranches] = useState<GitBranch[]>([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [branchesError, setBranchesError] = useState<string | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [commits, setCommits] = useState<GitCommit[]>([]);
    const [commitsLoading, setCommitsLoading] = useState(false);
    const [commitsError, setCommitsError] = useState<string | null>(null);
    const [commitsPage, setCommitsPage] = useState(1);
    const [hasMoreCommits, setHasMoreCommits] = useState(false);

    useEffect(() => {
        if (!open || !repo) {
            setBranches([]);
            setBranchesError(null);
            setSelectedBranch(null);
            setCommits([]);
            setCommitsError(null);
            setCommitsPage(1);
            setHasMoreCommits(false);
            return;
        }

        let active = true;
        const loadBranches = async () => {
            setBranchesLoading(true);
            setBranchesError(null);
            try {
                const result = await githubService.listBranches(
                    repo.owner,
                    repo.name,
                );
                if (!active) return;
                setBranches(result);
                const initial =
                    result.find((branch) => branch.name === repo.defaultBranch)
                        ?.name ??
                    result[0]?.name ??
                    null;
                setSelectedBranch(initial);
            }
            catch (error) {
                if (!active) return;
                setBranchesError(
                    error instanceof Error
                        ? error.message
                        : 'Could not load branches',
                );
            }
            finally {
                if (active) setBranchesLoading(false);
            }
        };

        void loadBranches();
        return () => {
            active = false;
        };
    }, [open, repo]);

    useEffect(() => {
        if (!open || !repo || !selectedBranch) {
            setCommits([]);
            setCommitsError(null);
            setHasMoreCommits(false);
            return;
        }

        let active = true;
        const loadCommits = async () => {
            setCommitsLoading(true);
            setCommitsError(null);
            setCommitsPage(1);
            try {
                const result = await githubService.listCommits(
                    repo.owner,
                    repo.name,
                    { sha: selectedBranch, page: 1 },
                );
                if (!active) return;
                setCommits(result.commits);
                setHasMoreCommits(result.hasNextPage);
            }
            catch (error) {
                if (!active) return;
                setCommits([]);
                setCommitsError(
                    error instanceof Error
                        ? error.message
                        : 'Could not load commits',
                );
            }
            finally {
                if (active) setCommitsLoading(false);
            }
        };

        void loadCommits();
        return () => {
            active = false;
        };
    }, [open, repo, selectedBranch]);

    const loadMoreCommits = async () => {
        if (!repo || !selectedBranch || commitsLoading) return;
        const nextPage = commitsPage + 1;
        setCommitsLoading(true);
        setCommitsError(null);
        try {
            const result = await githubService.listCommits(
                repo.owner,
                repo.name,
                { sha: selectedBranch, page: nextPage },
            );
            setCommits((prev) => [...prev, ...result.commits]);
            setCommitsPage(nextPage);
            setHasMoreCommits(result.hasNextPage);
        }
        catch (error) {
            setCommitsError(
                error instanceof Error
                    ? error.message
                    : 'Could not load more commits',
            );
        }
        finally {
            setCommitsLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                showCloseButton
                className="flex w-full flex-col gap-0 overflow-hidden border-0 bg-[#1a1a1a] p-0 sm:max-w-3xl"
            >
                <SheetHeader className="shrink-0 space-y-2 border-b border-white/5 px-5 py-4 pr-12 text-left">
                    <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                        Branches & commits
                    </p>
                    <SheetTitle className="font-heading text-lg font-semibold tracking-tight text-foreground">
                        {repo?.name ?? 'Repository'}
                    </SheetTitle>
                    <SheetDescription className="font-mono text-xs text-muted-foreground">
                        {repo?.fullName ?? 'Select a repository'}
                        {repo ? ` · default ${repo.defaultBranch}` : ''}
                    </SheetDescription>
                </SheetHeader>

                <div className="grid min-h-0 flex-1 md:grid-cols-[13rem_minmax(0,1fr)]">
                    <aside className="min-h-0 overflow-y-auto border-b border-white/5 md:border-r md:border-b-0">
                        <div className="px-4 py-3">
                            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                Branches
                            </p>
                        </div>
                        {branchesLoading ? (
                            <div className="flex min-h-40 items-center justify-center px-4">
                                <Loading size="sm" label="Loading…" />
                            </div>
                        ) : branchesError ? (
                            <p className="px-4 py-3 text-sm text-destructive">
                                {branchesError}
                            </p>
                        ) : branches.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-muted-foreground">
                                No branches found.
                            </p>
                        ) : (
                            <ul className="space-y-1 px-2 pb-4">
                                {branches.map((branch) => {
                                    const isSelected =
                                        branch.name === selectedBranch;
                                    return (
                                        <li key={branch.name}>
                                            <button
                                                type="button"
                                                className={cn(
                                                    'flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left transition-colors',
                                                    isSelected
                                                        ? 'bg-primary/15 text-primary'
                                                        : 'text-foreground/80 hover:bg-white/[0.04] hover:text-foreground',
                                                )}
                                                onClick={() =>
                                                    setSelectedBranch(branch.name)
                                                }
                                            >
                                                <GitBranchIcon className="mt-0.5 size-3.5 shrink-0" />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium">
                                                        {branch.name}
                                                    </span>
                                                    <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                                                        {branch.sha.slice(0, 7)}
                                                        {branch.protected ? (
                                                            <Shield className="size-3 text-amber-300" />
                                                        ) : null}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </aside>

                    <section className="min-h-0 overflow-y-auto">
                        <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-3">
                            <div>
                                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    Commits
                                </p>
                                <p className="mt-0.5 text-sm text-foreground">
                                    {selectedBranch ?? 'Select a branch'}
                                </p>
                            </div>
                        </div>

                        {commitsLoading && commits.length === 0 ? (
                            <div className="flex min-h-48 items-center justify-center">
                                <Loading size="md" label="Loading commits…" />
                            </div>
                        ) : commitsError && commits.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-destructive">
                                {commitsError}
                            </p>
                        ) : !selectedBranch ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">
                                Select a branch to view commits.
                            </p>
                        ) : commits.length === 0 ? (
                            <p className="px-5 py-6 text-sm text-muted-foreground">
                                No commits on this branch.
                            </p>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {commits.map((commit) => (
                                    <li
                                        key={commit.sha}
                                        className="px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {commit.message}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    <span className="font-mono text-primary">
                                                        {commit.sha.slice(0, 7)}
                                                    </span>
                                                    {' · '}
                                                    {commit.authorName}
                                                    {' · '}
                                                    {formatRepoRelativeUpdatedAt(
                                                        commit.authorDate,
                                                    )}
                                                </p>
                                            </div>
                                            <Button
                                                asChild
                                                size="icon-sm"
                                                variant="ghost"
                                                className="shrink-0 text-foreground/70 hover:bg-primary/15 hover:text-primary"
                                            >
                                                <a
                                                    href={commit.htmlUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Open commit ${commit.sha.slice(0, 7)} on GitHub`}
                                                >
                                                    <ExternalLink className="size-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {hasMoreCommits ? (
                            <div className="px-5 py-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={commitsLoading}
                                    onClick={() => void loadMoreCommits()}
                                >
                                    {commitsLoading ? (
                                        <Loading size="sm" />
                                    ) : (
                                        'Load more commits'
                                    )}
                                </Button>
                            </div>
                        ) : null}

                        {commitsError && commits.length > 0 ? (
                            <p className="px-5 pb-4 text-sm text-destructive">
                                {commitsError}
                            </p>
                        ) : null}
                    </section>
                </div>
            </SheetContent>
        </Sheet>
    );
};
