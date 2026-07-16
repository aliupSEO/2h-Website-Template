import { Badge } from '@/components/ui';

const STATE_STYLES: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    READY: 'default',
    BUILDING: 'secondary',
    QUEUED: 'secondary',
    INITIALIZING: 'secondary',
    ERROR: 'destructive',
    CANCELED: 'outline',
    BLOCKED: 'destructive',
};

type DeploymentStatusBadgeProps = {
    state: string;
};

export const DeploymentStatusBadge = ({ state }: DeploymentStatusBadgeProps) => {
    const normalized = state.toUpperCase();
    const variant = STATE_STYLES[normalized] ?? 'outline';

    return <Badge variant={variant}>{normalized}</Badge>;
};
