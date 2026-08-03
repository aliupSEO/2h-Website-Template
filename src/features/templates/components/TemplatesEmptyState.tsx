import { LayoutTemplate, Plus } from 'lucide-react';
import { Button } from '@/components/ui';

type TemplatesEmptyStateProps = {
    title: string;
    description: string;
    showCreate?: boolean;
    onCreate?: () => void;
};

export const TemplatesEmptyState = ({
    title,
    description,
    showCreate = false,
    onCreate,
}: TemplatesEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
            <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/25">
                <LayoutTemplate className="size-8" />
            </div>
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {title}
            </h2>
            <p className="mt-2.5 max-w-sm text-sm text-muted-foreground">
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
                    Create template
                </Button>
            ) : null}
        </div>
    );
};
