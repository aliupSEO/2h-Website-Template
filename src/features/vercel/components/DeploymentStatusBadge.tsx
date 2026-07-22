import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

type DeploymentStatusBadgeProps = {
    state: string;
};

const STATE_CLASS: Record<string, string> = {
    READY: 'border-0 bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground',
    BUILDING:
        'border-0 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30',
    QUEUED:
        'border-0 bg-white/10 px-2 py-0.5 text-xs font-semibold text-foreground/80 ring-1 ring-white/10',
    INITIALIZING:
        'border-0 bg-white/10 px-2 py-0.5 text-xs font-semibold text-foreground/80 ring-1 ring-white/10',
    ERROR: 'border-0 bg-destructive/20 px-2 py-0.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30',
    CANCELED:
        'border-0 bg-white/5 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-white/10',
    BLOCKED:
        'border-0 bg-destructive/20 px-2 py-0.5 text-xs font-semibold text-destructive ring-1 ring-destructive/30',
};

export const DeploymentStatusBadge = ({
    state,
}: DeploymentStatusBadgeProps) => {
    const normalized = state.toUpperCase();
    const className =
        STATE_CLASS[normalized] ??
        'border-0 bg-white/10 px-2 py-0.5 text-xs font-medium text-foreground/80 ring-1 ring-white/10';

    return (
        <Badge className={cn('rounded-md', className)}>{normalized}</Badge>
    );
};
