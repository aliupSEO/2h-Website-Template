import type { GitRepo } from '@/features/git/types';
import { RepoCard } from './RepoCard';
import { ScrollReveal } from '@/components/common';

type ReposCardGridProps = {
    repos: GitRepo[];
    onEdit: (repo: GitRepo) => void;
    onDelete: (repo: GitRepo) => void;
    onViewBranches: (repo: GitRepo) => void;
};

export const ReposCardGrid = ({
    repos,
    onEdit,
    onDelete,
    onViewBranches,
}: ReposCardGridProps) => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {repos.map((repo, index) => (
                <ScrollReveal key={repo.id} delay={Math.min(index * 50, 500)}>
                <RepoCard
                    key={repo.id}
                    repo={repo}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewBranches={onViewBranches}
                />
                </ScrollReveal>
            ))}
        </div>
    );
};
