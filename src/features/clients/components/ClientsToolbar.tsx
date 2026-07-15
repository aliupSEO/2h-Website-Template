import { LayoutGrid, List, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui'
import type { ClientStatus, ClientsViewMode } from '@/features/clients/types'
import { CLIENT_STATUSES } from '@/features/clients/schemas'
import { cn } from '@/lib/utils'

type ClientsToolbarProps = {
  viewMode: ClientsViewMode
  onViewModeChange: (mode: ClientsViewMode) => void
  statusFilter: 'all' | ClientStatus
  onStatusFilterChange: (status: 'all' | ClientStatus) => void
}

export function ClientsToolbar({
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
}: ClientsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={statusFilter === 'all' ? 'brand' : 'outline'}
          onClick={() => onStatusFilterChange('all')}
        >
          All
        </Button>
        {CLIENT_STATUSES.map((status) => (
          <Button
            key={status.value}
            type="button"
            size="sm"
            variant={statusFilter === status.value ? 'brand' : 'outline'}
            onClick={() => onStatusFilterChange(status.value)}
          >
            {status.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg bg-muted p-0.5">
          <button
            type="button"
            aria-label="Table view"
            className={cn(
              'rounded-md p-2 transition-colors',
              viewMode === 'table'
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => onViewModeChange('table')}
          >
            <List className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Cards view"
            className={cn(
              'rounded-md p-2 transition-colors',
              viewMode === 'cards'
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => onViewModeChange('cards')}
          >
            <LayoutGrid className="size-4" />
          </button>
        </div>

        <Button asChild variant="brand">
          <Link to="/clients/new">
            <Plus data-icon="inline-start" />
            Create client
          </Link>
        </Button>
      </div>
    </div>
  )
}
