import type { GitRepo } from '@/features/git/types';
import { RepoCard } from './RepoCard';

type ReposCardGridProps = {
    repos: GitRepo[];
    onEdit: (repo: GitRepo) => void;
    onDelete: (repo: GitRepo) => void;
    /** Remount cards so filter changes replay entrance animation */
    animationKey?: string;
};

export const ReposCardGrid = ({
    repos,
    onEdit,
    onDelete,
    animationKey = 'all',
}: ReposCardGridProps) => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {repos.map((repo, index) => (
                <RepoCard
                    key={`${animationKey}-${repo.id}`}
                    repo={repo}
                    index={index}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
