import { LayoutGrid, List, Plus, Search, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { ReposPagination } from './ReposPagination';
import { SegmentedControl } from './SegmentedControl';

export type ReposViewMode = 'table' | 'cards';
export type ReposVisibilityFilter = 'all' | 'public' | 'private';

type ReposToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    viewMode: ReposViewMode;
    onViewModeChange: (mode: ReposViewMode) => void;
    visibilityFilter: ReposVisibilityFilter;
    onVisibilityFilterChange: (filter: ReposVisibilityFilter) => void;
    onCreate: () => void;
    publicCount: number;
    privateCount: number;
    page: number;
    repoCount: number;
    hasNextPage: boolean;
    loading: boolean;
    onPageChange: (page: number) => void;
};

export const ReposToolbar = ({
    query,
    onQueryChange,
    viewMode,
    onViewModeChange,
    visibilityFilter,
    onVisibilityFilterChange,
    onCreate,
    publicCount,
    privateCount,
    page,
    repoCount,
    hasNextPage,
    loading,
    onPageChange,
}: ReposToolbarProps) => {
    const hasQuery = query.trim().length > 0;

    return (
        <section className="overflow-hidden rounded-none">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-4 sm:px-6">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    Git
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                    <ReposPagination
                        variant="inline"
                        page={page}
                        repoCount={repoCount}
                        hasNextPage={hasNextPage}
                        loading={loading}
                        onPageChange={onPageChange}
                    />
                    <Button
                        type="button"
                        variant="brand"
                        className="h-11 rounded-md px-4 text-sm"
                        onClick={onCreate}
                    >
                        <Plus data-icon="inline-start" />
                        Create repository
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-3 border-b border-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                <div className="relative min-w-0 w-full sm:max-w-md">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/50" />
                    <Input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Filter by name, owner, or description…"
                        className="h-10 w-full rounded-md bg-[#111111] pl-9 pr-9 text-foreground ring-1 ring-white/10 placeholder:text-foreground/40"
                        aria-label="Search repositories on this page"
                    />
                    {hasQuery ? (
                        <button
                            type="button"
                            aria-label="Clear search"
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-foreground/50 transition-colors hover:text-foreground"
                            onClick={() => onQueryChange('')}
                        >
                            <X className="size-3.5" />
                        </button>
                    ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 sm:ml-auto">
                    <SegmentedControl
                        aria-label="Visibility filter"
                        value={visibilityFilter}
                        onChange={onVisibilityFilterChange}
                        options={[
                            {
                                value: 'all',
                                label: (
                                    <>
                                        All{' '}
                                        <span className="tabular-nums opacity-80">
                                            {publicCount + privateCount}
                                        </span>
                                    </>
                                ),
                            },
                            {
                                value: 'public',
                                label: (
                                    <>
                                        Public{' '}
                                        <span className="tabular-nums opacity-80">
                                            {publicCount}
                                        </span>
                                    </>
                                ),
                            },
                            {
                                value: 'private',
                                label: (
                                    <>
                                        Private{' '}
                                        <span className="tabular-nums opacity-80">
                                            {privateCount}
                                        </span>
                                    </>
                                ),
                            },
                        ]}
                    />

                    <SegmentedControl
                        aria-label="View mode"
                        value={viewMode}
                        onChange={onViewModeChange}
                        className="w-[5rem]"
                        buttonClassName="px-0"
                        options={[
                            {
                                value: 'table',
                                label: <List className="size-4" aria-hidden />,
                            },
                            {
                                value: 'cards',
                                label: (
                                    <LayoutGrid
                                        className="size-4"
                                        aria-hidden
                                    />
                                ),
                            },
                        ]}
                    />
                </div>
            </div>
        </section>
    );
};
