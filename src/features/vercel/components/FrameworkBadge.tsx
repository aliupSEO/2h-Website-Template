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
                'inline-flex items-center rounded-md bg-primary/20 px-2.5 py-1 text-xs font-semibold tracking-wide text-primary capitalize ring-1 ring-primary/40',
                className,
            )}
        >
            {framework}
        </span>
    );
};
