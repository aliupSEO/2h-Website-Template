import { FileUp, Plus, Search, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';

type EnvToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    varCount: number;
    onAdd: () => void;
    onImport: () => void;
};

export const EnvToolbar = ({
    query,
    onQueryChange,
    varCount,
    onAdd,
    onImport,
}: EnvToolbarProps) => {
    const hasQuery = query.trim().length > 0;

    return (
        <div className="space-y-3 px-4 pt-6 pb-4 sm:px-6">
            <div className="flex flex-col gap-1">
                <h1 className="font-heading text-2xl font-semibold tracking-tight">
                    Env
                </h1>
                <p className="text-sm text-muted-foreground">
                    Hub secrets store · {varCount} variable
                    {varCount === 1 ? '' : 's'}
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search keys…"
                        className="h-10 bg-muted pl-9 pr-9"
                    />
                    {hasQuery ? (
                        <button
                            type="button"
                            aria-label="Clear search"
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => onQueryChange('')}
                        >
                            <X className="size-3.5" />
                        </button>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="gap-2"
                        onClick={onImport}
                    >
                        <FileUp className="size-4" />
                        Import .env
                    </Button>
                    <Button
                        type="button"
                        variant="brand"
                        className="gap-2"
                        onClick={onAdd}
                    >
                        <Plus className="size-4" />
                        Add variable
                    </Button>
                </div>
            </div>
        </div>
    );
};
