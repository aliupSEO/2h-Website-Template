import { KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

type EnvVarCountBadgeProps = {
    count: number;
    className?: string;
};

export const EnvVarCountBadge = ({
    count,
    className,
}: EnvVarCountBadgeProps) => {
    return (
        <span
            className={cn(
                'inline-flex h-6 w-[3.5rem] shrink-0 items-center justify-center gap-1 rounded bg-primary text-xs font-bold tabular-nums text-black',
                className,
            )}
        >
            <KeyRound className="size-3.5 shrink-0 text-black" />
            {count}
        </span>
    );
};
