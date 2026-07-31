import { KeyRound, Plus } from 'lucide-react';
import { Button } from '@/components/ui';

type EnvEmptyStateProps = {
    title: string;
    description: string;
    showCreate?: boolean;
    onCreate?: () => void;
};

export const EnvEmptyState = ({
    title,
    description,
    showCreate = false,
    onCreate,
}: EnvEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <KeyRound className="size-6" />
            </div>
            <h2 className="font-heading text-lg font-semibold tracking-tight">
                {title}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {description}
            </p>
            {showCreate && onCreate ? (
                <Button
                    type="button"
                    variant="brand"
                    className="mt-6"
                    onClick={onCreate}
                >
                    <Plus data-icon="inline-start" />
                    Add variable
                </Button>
            ) : null}
        </div>
    );
};
