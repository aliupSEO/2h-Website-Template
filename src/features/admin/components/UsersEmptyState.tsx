import { Shield, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui';

type UsersEmptyStateProps = {
    title: string;
    description: string;
    showInvite?: boolean;
    onInvite?: () => void;
    actionLabel?: string;
    onAction?: () => void;
};

export const UsersEmptyState = ({
    title,
    description,
    showInvite = false,
    onInvite,
    actionLabel,
    onAction,
}: UsersEmptyStateProps) => {
    const showAction = (showInvite && onInvite) || (actionLabel && onAction);

    return (
        <div className="flex flex-col items-center rounded-xl bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <Shield className="size-6" />
            </div>
            <h2 className="font-heading text-lg font-semibold tracking-tight">
                {title}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
            {showAction ? (
                <Button
                    type="button"
                    variant="brand"
                    className="mt-6 gap-2"
                    onClick={onInvite ?? onAction}
                >
                    {showInvite ? (
                        <>
                            <UserPlus className="size-4" />
                            Invite user
                        </>
                    ) : (
                        actionLabel
                    )}
                </Button>
            ) : null}
        </div>
    );
};
