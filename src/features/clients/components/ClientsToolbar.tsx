import { LayoutGrid, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
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
    return (<div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
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
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg bg-muted p-0.5">
          <button type="button" aria-label="Table view" className={cn('rounded-md p-2 transition-colors', viewMode === 'table'
            ? 'bg-card text-foreground'
            : 'text-muted-foreground hover:text-foreground')} onClick={() => onViewModeChange('table')}>
            <List className="size-4"/>
          </button>
          <button type="button" aria-label="Cards view" className={cn('rounded-md p-2 transition-colors', viewMode === 'cards'
            ? 'bg-card text-foreground'
            : 'text-muted-foreground hover:text-foreground')} onClick={() => onViewModeChange('cards')}>
            <LayoutGrid className="size-4"/>
          </button>
        </div>

        <Button asChild variant="brand">
          <Link to="/clients/new">
            <Plus data-icon="inline-start"/>
            Create client
          </Link>
        </Button>
      </div>
    </div>);
};
