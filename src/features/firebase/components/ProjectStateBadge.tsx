import { cn } from '@/lib/utils';

type ProjectStateBadgeProps = {
    state: string;
};

export const ProjectStateBadge = ({ state }: ProjectStateBadgeProps) => {
    const normalized = state.trim().toUpperCase();
    const isActive = normalized === 'ACTIVE' || normalized === 'ENABLED';

    return (
        <span
            className={cn(
                'inline-flex h-6 items-center justify-center rounded px-2.5 text-xs font-bold tracking-wide',
                isActive
                    ? 'bg-primary text-black'
                    : 'bg-white/10 text-foreground/80',
            )}
        >
            {normalized || 'UNKNOWN'}
        </span>
    );
};
