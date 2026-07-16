import { Plus, Search } from 'lucide-react';
import { Button, Input } from '@/components/ui';

type ProjectsToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    onCreate: () => void;
};

export const ProjectsToolbar = ({
    query,
    onQueryChange,
    onCreate,
}: ProjectsToolbarProps) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[220px] flex-1 sm:max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search projects…"
                    className="h-10 pl-9"
                    aria-label="Search projects"
                />
            </div>

            <Button type="button" variant="brand" onClick={onCreate}>
                <Plus data-icon="inline-start" />
                Import from GitHub
            </Button>
        </div>
    );
};
