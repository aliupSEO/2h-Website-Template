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
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/25">
                <Shield className="size-8" />
            </div>
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {title}
            </h2>
            <p className="mt-2.5 max-w-sm text-sm text-muted-foreground">
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
