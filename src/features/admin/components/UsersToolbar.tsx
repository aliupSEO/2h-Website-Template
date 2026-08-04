import { LayoutGrid, List, Plus, Search, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { SegmentedControl } from '@/features/git/components/SegmentedControl';
import type { UserStatusFilter } from '@/features/admin/types';

type UsersToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    statusFilter: UserStatusFilter;
    onStatusFilterChange: (filter: UserStatusFilter) => void;
    counts: {
        all: number;
        active: number;
        inactive: number;
        pending: number;
        confirmed: number;
    };
    onInvite: () => void;
    viewMode: 'table' | 'grid';
    onViewModeChange: (mode: 'table' | 'grid') => void;
};

export const UsersToolbar = ({
    query,
    onQueryChange,
    statusFilter,
    onStatusFilterChange,
    counts,
    onInvite,
    viewMode,
    onViewModeChange,
}: UsersToolbarProps) => {
    const hasQuery = query.trim().length > 0;

    return (
        <section className="overflow-hidden rounded-none">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                <div className="space-y-1">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">
                        Admin
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Invite users, manage roles, and control account access.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="brand"
                        className="h-11 rounded-md px-4 text-sm gap-2"
                        onClick={onInvite}
                    >
                        <Plus className="size-4" />
                        Invite user
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                <div className="relative min-w-0 w-full sm:max-w-md">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/50" />
                    <Input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search users…"
                        className="h-10 w-full rounded-md bg-[#111111] pl-9 pr-9 text-foreground ring-1 ring-white/10 placeholder:text-foreground/40"
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
                        aria-label="User status filter"
                        value={statusFilter}
                        onChange={onStatusFilterChange}
                        options={[
                            {
                                value: 'all',
                                label: (
                                    <>
                                        All{' '}
                                        <span className="tabular-nums opacity-80">
                                            {counts.all}
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
                                            {counts.active}
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
                                            {counts.inactive}
                                        </span>
                                    </>
                                ),
                            },
                            {
                                value: 'pending',
                                label: (
                                    <>
                                        Pending{' '}
                                        <span className="tabular-nums opacity-80">
                                            {counts.pending}
                                        </span>
                                    </>
                                ),
                            },
                            {
                                value: 'confirmed',
                                label: (
                                    <>
                                        Confirmed{' '}
                                        <span className="tabular-nums opacity-80">
                                            {counts.confirmed}
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
                                value: 'grid',
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
