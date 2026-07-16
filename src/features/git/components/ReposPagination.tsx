import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Loading } from '@/components/common';
import { Button } from '@/components/ui';

type ReposPaginationProps = {
    page: number;
    hasNextPage: boolean;
    loading: boolean;
    onPageChange: (page: number) => void;
};

export const ReposPagination = ({
    page,
    hasNextPage,
    loading,
    onPageChange,
}: ReposPaginationProps) => {
    const canGoBack = page > 1;

    if (!canGoBack && !hasNextPage) return null;

    return (
        <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Page {page}</p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canGoBack || loading}
                    onClick={() => onPageChange(page - 1)}
                >
                    {loading ? <Loading size="sm" /> : <ChevronLeft className="size-4" />}
                    Previous
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasNextPage || loading}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                    {loading ? <Loading size="sm" /> : <ChevronRight className="size-4" />}
                </Button>
            </div>
        </div>
    );
};
