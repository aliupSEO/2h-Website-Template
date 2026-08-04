import { LayoutGrid, List, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { SegmentedControl } from '@/features/git/components/SegmentedControl';
import type { ClientStatus, ClientsViewMode } from '@/features/clients/types';
import { CLIENT_STATUSES } from '@/features/clients/schemas';
import { cn } from '@/lib/utils';
type ClientsToolbarProps = {
    viewMode: ClientsViewMode;
    onViewModeChange: (mode: ClientsViewMode) => void;
    statusFilter: 'all' | ClientStatus;
    onStatusFilterChange: (status: 'all' | ClientStatus) => void;
};
export const ClientsToolbar = ({ viewMode, onViewModeChange, statusFilter, onStatusFilterChange, }: ClientsToolbarProps) => {
    return (
        <section className="overflow-hidden rounded-none">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                <div className="space-y-1">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">
                        Clients
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        asChild
                        variant="brand"
                        className="h-11 rounded-md px-4 text-sm"
                    >
                        <Link to="/clients/new">
                            <Plus data-icon="inline-start" />
                            Create client
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                <div className="relative min-w-0 w-full sm:max-w-md">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/50" />
                    <Input
                        placeholder="Filter clients..."
                        className="h-10 w-full rounded-md bg-[#111111] pl-9 pr-9 text-foreground ring-1 ring-white/10 placeholder:text-foreground/40"
                        aria-label="Search clients on this page"
                        readOnly
                    />
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 sm:ml-auto">
                    <SegmentedControl
                        aria-label="Client status filter"
                        value={statusFilter}
                        onChange={(val) => onStatusFilterChange(val as 'all' | ClientStatus)}
                        options={[
                            { value: 'all', label: 'All' },
                            ...CLIENT_STATUSES.map((status) => ({
                                value: status.value,
                                label: status.label,
                            })),
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
