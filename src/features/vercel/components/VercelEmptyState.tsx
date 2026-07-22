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
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            {icon ? (
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                    {icon}
                </div>
            ) : null}
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
            {actionLabel && onAction ? (
                <Button
                    type="button"
                    variant="brand"
                    className="mt-5 h-10 rounded-md px-4"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            ) : null}
        </div>
    );
};
