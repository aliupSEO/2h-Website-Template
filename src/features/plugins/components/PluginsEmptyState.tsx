import { Puzzle, Plus } from 'lucide-react';
import { Button } from '@/components/ui';

type PluginsEmptyStateProps = {
    title: string;
    description: string;
    showCreate?: boolean;
    onCreate?: () => void;
};

export const PluginsEmptyState = ({
    title,
    description,
    showCreate = false,
    onCreate,
}: PluginsEmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-black shadow-[0_0_20px_rgba(198,245,50,0.2)]">
                <Puzzle className="size-8" />
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
                    Create plugin
                </Button>
            ) : null}
        </div>
    );
};
