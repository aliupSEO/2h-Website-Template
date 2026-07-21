import { Plus, Search } from 'lucide-react';
import { Button, Input } from '@/components/ui';

type ProjectsToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    onAddFirebase: () => void;
};

export const ProjectsToolbar = ({
    query,
    onQueryChange,
    onAddFirebase,
}: ProjectsToolbarProps) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[220px] flex-1 sm:max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search Firebase projects…"
                    className="h-10 pl-9"
                    aria-label="Search Firebase projects"
                />
            </div>

            <Button type="button" variant="brand" onClick={onAddFirebase}>
                <Plus data-icon="inline-start" />
                Add Firebase
            </Button>
        </div>
    );
};
