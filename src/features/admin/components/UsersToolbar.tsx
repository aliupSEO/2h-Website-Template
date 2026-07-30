import { Plus, Search, X } from 'lucide-react';
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
};

export const UsersToolbar = ({
    query,
    onQueryChange,
    statusFilter,
    onStatusFilterChange,
    counts,
    onInvite,
}: UsersToolbarProps) => {
    const hasQuery = query.trim().length > 0;

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search users…"
                        className="h-10 bg-muted pl-9 pr-9"
                    />
                    {hasQuery ? (
                        <button
                            type="button"
                            aria-label="Clear search"
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => onQueryChange('')}
                        >
                            <X className="size-3.5" />
                        </button>
                    ) : null}
                </div>
                <Button variant="brand" className="gap-2" onClick={onInvite}>
                    <Plus className="size-4" />
                    Invite user
                </Button>
            </div>

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
        </div>
    );
};
