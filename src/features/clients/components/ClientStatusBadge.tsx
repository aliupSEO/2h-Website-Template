import { Badge } from '@/components/ui';
import type { ClientStatus } from '@/features/clients/types';
import { cn } from '@/lib/utils';
const STATUS_STYLES: Record<ClientStatus, string> = {
    active: 'bg-primary text-black',
    inactive: 'bg-white/10 text-white',
    draft: 'bg-amber-400 text-black',
};
const STATUS_LABELS: Record<ClientStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    draft: 'Draft',
};
type ClientStatusBadgeProps = {
    status: ClientStatus;
};
export const ClientStatusBadge = ({ status }: ClientStatusBadgeProps) => {
    return (
        <span
            className={cn(
                'inline-flex h-6 items-center rounded px-2.5 text-[11px] font-bold tracking-wide uppercase',
                STATUS_STYLES[status]
            )}
        >
            {STATUS_LABELS[status]}
        </span>
    );
};
