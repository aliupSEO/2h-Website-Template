import type { GitRepo } from '@/features/git/types';
import { RepoCard } from './RepoCard';

type ReposCardGridProps = {
    repos: GitRepo[];
    onEdit: (repo: GitRepo) => void;
    onDelete: (repo: GitRepo) => void;
};

export const ReposCardGrid = ({
    repos,
    onEdit,
    onDelete,
}: ReposCardGridProps) => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {repos.map((repo) => (
                <RepoCard
                    key={repo.id}
                    repo={repo}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
