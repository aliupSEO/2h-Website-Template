import { cn } from '@/lib/utils';

type FrameworkBadgeProps = {
    framework: string;
    className?: string;
};

export const FrameworkBadge = ({
    framework,
    className,
}: FrameworkBadgeProps) => {
    return (
        <span
            className={cn(
                'inline-flex h-6 w-[4.75rem] shrink-0 items-center justify-center truncate rounded bg-primary px-2 text-xs font-bold tracking-wide text-black capitalize',
                className,
            )}
            title={framework}
        >
            {framework}
        </span>
    );
};
