import { Badge } from '@/components/ui'
import type { ClientStatus } from '@/features/clients/types'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<ClientStatus, string> = {
  active: 'bg-primary/15 text-primary',
  inactive: 'bg-muted text-muted-foreground',
  draft: 'bg-white/10 text-foreground',
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
}

type ClientStatusBadgeProps = {
  status: ClientStatus
}

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('rounded-md border-0', STATUS_STYLES[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}
