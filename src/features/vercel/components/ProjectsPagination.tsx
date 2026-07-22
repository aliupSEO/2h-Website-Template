import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { PROJECTS_PER_PAGE } from '@/features/vercel/constants';

type ProjectsPaginationProps = {
    page: number;
    totalCount: number;
    onPageChange: (page: number) => void;
};

export const ProjectsPagination = ({
    page,
    totalCount,
    onPageChange,
}: ProjectsPaginationProps) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / PROJECTS_PER_PAGE));
    const canGoBack = page > 1;
    const canGoNext = page < totalPages;

    if (totalCount <= PROJECTS_PER_PAGE) return null;

    const start = (page - 1) * PROJECTS_PER_PAGE + 1;
    const end = Math.min(page * PROJECTS_PER_PAGE, totalCount);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 bg-card px-4 py-3 sm:px-6">
            <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-semibold text-primary">
                    {start}–{end}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">
                    {totalCount}
                </span>
            </p>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 rounded-md ring-1 ring-white/12"
                    disabled={!canGoBack}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft className="size-4" />
                    Previous
                </Button>
                <span className="min-w-[4.5rem] text-center text-sm tabular-nums text-foreground/80">
                    {page} / {totalPages}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 rounded-md ring-1 ring-white/12"
                    disabled={!canGoNext}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
};
