import { useEffect, useMemo, useState } from 'react';
import { ConfirmModal, DocumentTitle, LoadingScreen } from '@/components/common';
import type { CreateRepoSchema, UpdateRepoSchema } from '@/features/git/schemas';
import type { GitRepo } from '@/features/git/types';
import { toast } from '@/lib/toast';
import { useGitStore } from '@/stores/gitStore';
import { CreateRepoDialog } from './CreateRepoDialog';
import { EditRepoDialog } from './EditRepoDialog';
import { ReposPagination } from './ReposPagination';
import { ReposTable } from './ReposTable';
import { ReposToolbar } from './ReposToolbar';

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
    const [createOpen, setCreateOpen] = useState(false);
    const [editingRepo, setEditingRepo] = useState<GitRepo | null>(null);
    const [pendingDelete, setPendingDelete] = useState<GitRepo | null>(null);

    useEffect(() => {
        void fetchRepos({ page: 1 }).catch(() => undefined);
    }, [fetchRepos]);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return repos;
        return repos.filter((repo) => {
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
    }, [query, repos]);

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
        return <LoadingScreen label="Loading repositories…" />;
    }

    return (
        <div className="space-y-6">
            <DocumentTitle title="Git" />
            <div className="space-y-1">
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    Git
                </h1>
                <p className="text-sm text-muted-foreground">
                    Live repositories from GitHub — 50 per page, fetched on demand.
                </p>
            </div>

            <ReposToolbar
                query={query}
                onQueryChange={setQuery}
                onCreate={() => setCreateOpen(true)}
            />

            {error && repos.length === 0 ? (
                <div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <p className="text-sm text-destructive">{error}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Check `GITHUB_TOKEN` (and optional `GITHUB_ORG`) in
                        `.env.local`, then restart the dev server.
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <p className="text-sm text-muted-foreground">
                        {query.trim()
                            ? 'No repositories on this page match your search.'
                            : 'No repositories found for this account.'}
                    </p>
                </div>
            ) : (
                <ReposTable
                    repos={filtered}
                    onEdit={setEditingRepo}
                    onDelete={setPendingDelete}
                />
            )}

            <ReposPagination
                page={page}
                hasNextPage={hasNextPage}
                loading={loading}
                onPageChange={handlePageChange}
            />

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
