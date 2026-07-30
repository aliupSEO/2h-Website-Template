import { Plus, Search, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';

type PluginsToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    onCreate: () => void;
    pluginCount: number;
};

export const PluginsToolbar = ({
    query,
    onQueryChange,
    onCreate,
    pluginCount,
}: PluginsToolbarProps) => {
    const hasQuery = query.trim().length > 0;

    return (
        <section className="overflow-hidden rounded-none">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                <div>
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">
                        Plugins
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {pluginCount} plugin{pluginCount === 1 ? '' : 's'} in
                        catalog
                    </p>
                </div>

                <Button
                    type="button"
                    variant="brand"
                    className="h-11 rounded-md px-4 text-sm"
                    onClick={onCreate}
                >
                    <Plus data-icon="inline-start" />
                    Create plugin
                </Button>
            </div>

            <div className="px-4 pb-3 sm:px-6">
                <div className="relative min-w-0 w-full sm:max-w-md">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/50" />
                    <Input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search by name or description…"
                        className="h-10 w-full rounded-md bg-[#111111] pl-9 pr-9 text-foreground ring-1 ring-white/10 placeholder:text-foreground/40"
                        aria-label="Search plugins"
                    />
                    {hasQuery ? (
                        <button
                            type="button"
                            aria-label="Clear search"
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-foreground/50 transition-colors hover:text-foreground"
                            onClick={() => onQueryChange('')}
                        >
                            <X className="size-3.5" />
                        </button>
                    ) : null}
                </div>
            </div>
        </section>
    );
};
