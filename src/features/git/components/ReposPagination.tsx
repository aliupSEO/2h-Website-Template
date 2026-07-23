import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Loading } from '@/components/common';
import { Button } from '@/components/ui';
import { REPOS_PER_PAGE } from '@/features/git/constants';
import { cn } from '@/lib/utils';

type ReposPaginationProps = {
    page: number;
    repoCount: number;
    hasNextPage: boolean;
    loading: boolean;
    onPageChange: (page: number) => void;
    variant?: 'bar' | 'inline';
};

export const ReposPagination = ({
    page,
    repoCount,
    hasNextPage,
    loading,
    onPageChange,
    variant = 'bar',
}: ReposPaginationProps) => {
    const canGoBack = page > 1;
    const canGoNext = hasNextPage || repoCount >= REPOS_PER_PAGE;
    const showNavigation = canGoBack || canGoNext;

    if (!showNavigation) return null;

    return (
        <div
            className={cn(
                'flex items-center gap-2',
                variant === 'bar' &&
                    'justify-end border-t border-white/5 bg-muted px-4 py-2.5 sm:px-6',
            )}
        >
            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canGoBack || loading}
                onClick={() => onPageChange(page - 1)}
            >
                {loading ? (
                    <Loading size="sm" />
                ) : (
                    <ChevronLeft className="size-4" />
                )}
                Previous
            </Button>
            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canGoNext || loading}
                onClick={() => onPageChange(page + 1)}
            >
                Next
                {loading ? (
                    <Loading size="sm" />
                ) : (
                    <ChevronRight className="size-4" />
                )}
            </Button>
        </div>
    );
};
