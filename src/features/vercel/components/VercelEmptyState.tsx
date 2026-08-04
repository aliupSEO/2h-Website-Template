import type { ReactNode } from 'react';
import { Button } from '@/components/ui';

type VercelEmptyStateProps = {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: ReactNode;
};

export const VercelEmptyState = ({
    title,
    description,
    actionLabel,
    onAction,
    icon,
}: VercelEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
            {icon ? (
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-black shadow-[0_0_20px_rgba(198,245,50,0.2)]">
                    {icon}
                </div>
            ) : null}
            <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            <p className="mt-2.5 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
            {actionLabel && onAction ? (
                <Button
                    type="button"
                    variant="brand"
                    className="mt-6 h-10 rounded-md px-4"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            ) : null}
        </div>
    );
};
