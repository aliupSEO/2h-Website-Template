import { ButtonSpinner } from '@/components/common';
import { cn } from '@/lib/utils';

type DeploymentStatusBadgeProps = {
    state: string;
};

const STATE_CLASS: Record<string, string> = {
    READY: 'bg-primary text-black',
    BUILDING: 'bg-amber-400 text-black',
    QUEUED: 'bg-zinc-400 text-black',
    INITIALIZING: 'bg-sky-400 text-black',
    ERROR: 'bg-destructive text-white',
    CANCELED: 'bg-zinc-500 text-white',
    BLOCKED: 'bg-destructive text-white',
};

const IN_PROGRESS = new Set(['BUILDING', 'QUEUED', 'INITIALIZING']);

export const DeploymentStatusBadge = ({
    state,
}: DeploymentStatusBadgeProps) => {
    const normalized = state.toUpperCase();
    const isLoading = IN_PROGRESS.has(normalized);

    return (
        <span
            aria-busy={isLoading || undefined}
            className={cn(
                'inline-flex h-6 items-center gap-1.5 rounded px-2.5 text-xs font-bold tracking-wide',
                STATE_CLASS[normalized] ?? 'bg-zinc-400 text-black',
                isLoading && 'animate-pulse',
            )}
        >
            {isLoading ? (
                <ButtonSpinner className="size-3 border-[1.5px]" />
            ) : null}
            {normalized}
        </span>
    );
};
