import { useEffect, useMemo, useState } from 'react';
import { ConfirmModal, DocumentTitle, LoadingScreen } from '@/components/common';
import type { CreateRepoSchema, UpdateRepoSchema } from '@/features/git/schemas';
import type { GitRepo } from '@/features/git/types';
import { toast } from '@/lib/toast';
import { useGitStore } from '@/stores/gitStore';
import { CreateRepoDialog } from './CreateRepoDialog';
import { EditRepoDialog } from './EditRepoDialog';
import { RepoBranchesSheet } from './RepoBranchesSheet';
import { ReposCardGrid } from './ReposCardGrid';
import { ReposEmptyState } from './ReposEmptyState';
import { ReposTable } from './ReposTable';
import {
    ReposToolbar,
    type ReposViewMode,
    type ReposVisibilityFilter,
} from './ReposToolbar';

export const ReposList = () => {
    const repos = useGitStore((state) => state.repos);
    const page = useGitStore((state) => state.page);
    const hasNextPage = useGitStore((state) => state.hasNextPage);
    const loading = useGitStore((state) => state.loading);
    const error = useGitStore((state) => state.error);
    const fetchRepos = useGitStore((state) => state.fetchRepos);
    const createRepo = useGitStore((state) => state.createRepo);
    const updateRepo = useGitStore((state) => state.updateRepo);
    const deleteRepo = useGitStore((state) => state.deleteRepo);

    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState<ReposViewMode>('cards');
    const [visibilityFilter, setVisibilityFilter] =
        useState<ReposVisibilityFilter>('all');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingRepo, setEditingRepo] = useState<GitRepo | null>(null);
    const [branchesRepo, setBranchesRepo] = useState<GitRepo | null>(null);
    const [pendingDelete, setPendingDelete] = useState<GitRepo | null>(null);

    useEffect(() => {
        void fetchRepos({ page: 1 }).catch(() => undefined);
    }, [fetchRepos]);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();

        return repos.filter((repo) => {
            if (visibilityFilter === 'public' && repo.private) return false;
            if (visibilityFilter === 'private' && !repo.private) return false;
            if (!needle) return true;

            const haystack = [
                repo.name,
                repo.fullName,
                repo.owner,
                repo.description ?? '',
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [query, repos, visibilityFilter]);

    const publicCount = useMemo(
        () => repos.filter((repo) => !repo.private).length,
        [repos],
    );
    const privateCount = useMemo(
        () => repos.filter((repo) => repo.private).length,
        [repos],
    );

    const handlePageChange = (nextPage: number) => {
        setQuery('');
        void fetchRepos({ page: nextPage }).catch((pageError) => {
            toast.error(
                pageError instanceof Error
                    ? pageError.message
                    : 'Could not load repositories',
            );
        });
    };

    const handleCreate = async (values: CreateRepoSchema) => {
        try {
            await createRepo(values);
            toast.success('Repository created');
        }
        catch (createError) {
            toast.error(
                createError instanceof Error
                    ? createError.message
                    : 'Could not create repository',
            );
            throw createError;
        }
    };

    const handleEdit = async (repo: GitRepo, values: UpdateRepoSchema) => {
        try {
            await updateRepo(repo.owner, repo.name, values);
            toast.success('Repository updated');
        }
        catch (updateError) {
            toast.error(
                updateError instanceof Error
                    ? updateError.message
                    : 'Could not update repository',
            );
            throw updateError;
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deleteRepo(pendingDelete.owner, pendingDelete.name);
            toast.success('Repository deleted');
        }
        catch (deleteError) {
            toast.error(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Could not delete repository',
            );
        }
    };

    if (loading && repos.length === 0) {
        return <LoadingScreen label="Loading repositories…" variant="robot" />;
    }

    const isSearchOrFilter =
        Boolean(query.trim()) || visibilityFilter !== 'all';

    return (
        <div className="space-y-4">
            <DocumentTitle title="Git" />

            <div className="-m-4 space-y-0 bg-muted sm:-m-6">
                <ReposToolbar
                    query={query}
                    onQueryChange={setQuery}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    visibilityFilter={visibilityFilter}
                    onVisibilityFilterChange={setVisibilityFilter}
                    onCreate={() => setCreateOpen(true)}
                    publicCount={publicCount}
                    privateCount={privateCount}
                    page={page}
                    repoCount={repos.length}
                    hasNextPage={hasNextPage}
                    loading={loading}
                    onPageChange={handlePageChange}
                />

                {error && repos.length === 0 ? (
                    <ReposEmptyState
                        title="Could not load repositories"
                        description={error}
                    />
                ) : filtered.length === 0 ? (
                    <ReposEmptyState
                        title={
                            isSearchOrFilter
                                ? 'No matching repositories'
                                : 'No repositories yet'
                        }
                        description={
                            isSearchOrFilter
                                ? 'Try another search or visibility filter on this page.'
                                : 'Create your first repository to get started.'
                        }
                        showCreate={!isSearchOrFilter}
                        onCreate={() => setCreateOpen(true)}
                    />
                ) : viewMode === 'table' ? (
                    <ReposTable
                        repos={filtered}
                        onEdit={setEditingRepo}
                        onDelete={setPendingDelete}
                        onViewBranches={setBranchesRepo}
                    />
                ) : (
                    <div className="relative px-4 py-6 sm:px-6">
                        <ReposCardGrid
                            repos={filtered}
                            onEdit={setEditingRepo}
                            onDelete={setPendingDelete}
                            onViewBranches={setBranchesRepo}
                        />
                    </div>
                )}
            </div>

            <CreateRepoDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSubmit={handleCreate}
            />

            <EditRepoDialog
                repo={editingRepo}
                onOpenChange={(open) => {
                    if (!open) setEditingRepo(null);
                }}
                onSubmit={handleEdit}
            />

            <RepoBranchesSheet
                open={Boolean(branchesRepo)}
                repo={branchesRepo}
                onOpenChange={(open) => {
                    if (!open) setBranchesRepo(null);
                }}
            />

            <ConfirmModal
                open={Boolean(pendingDelete)}
                onOpenChange={(open) => {
                    if (!open) setPendingDelete(null);
                }}
                title="Delete repository?"
                description={
                    pendingDelete
                        ? `${pendingDelete.fullName} will be permanently removed from GitHub.`
                        : ''
                }
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
};
