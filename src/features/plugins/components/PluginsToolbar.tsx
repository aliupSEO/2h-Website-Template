import { LayoutGrid, List, Plus, Search, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { SegmentedControl } from '@/features/git/components/SegmentedControl';

type PluginsToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    onCreate: () => void;
    pluginCount: number;
    activeCount: number;
    inactiveCount: number;
    statusFilter: 'all' | 'active' | 'inactive';
    onStatusFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
    viewMode: 'table' | 'cards';
    onViewModeChange: (mode: 'table' | 'cards') => void;
};

export const PluginsToolbar = ({
    query,
    onQueryChange,
    onCreate,
    pluginCount,
    activeCount,
    inactiveCount,
    statusFilter,
    onStatusFilterChange,
    viewMode,
    onViewModeChange,
}: PluginsToolbarProps) => {
    const hasQuery = query.trim().length > 0;

    return (
        <section className="overflow-hidden rounded-none">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">
                        Plugins
                    </h1>

                <Button
                    type="button"
                    variant="brand"
                    className="h-11 rounded-md px-4 text-sm"
                    onClick={onCreate}
                >
                    <Plus data-icon="inline-start" />
                    Create plugin
                </Button>
            </div>

            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                <div className="relative min-w-0 w-full sm:max-w-md">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/50" />
                    <Input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search by name or description…"
                        className="h-10 w-full rounded-md bg-[#111111] pl-9 pr-9 text-foreground ring-1 ring-white/10 placeholder:text-foreground/40"
                        aria-label="Search plugins"
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
                        aria-label="Status filter"
                        value={statusFilter}
                        onChange={onStatusFilterChange}
                        options={[
                            {
                                value: 'all',
                                label: (
                                    <>
                                        All{' '}
                                        <span className="tabular-nums opacity-80">
                                            {pluginCount}
                                        </span>
                                    </>
                                ),
                            },
                            {
                                value: 'active',
                                label: (
                                    <>
                                        Active{' '}
                                        <span className="tabular-nums opacity-80">
                                            {activeCount}
                                        </span>
                                    </>
                                ),
                            },
                            {
                                value: 'inactive',
                                label: (
                                    <>
                                        Inactive{' '}
                                        <span className="tabular-nums opacity-80">
                                            {inactiveCount}
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
