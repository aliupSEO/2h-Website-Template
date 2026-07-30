import { Plus, Search, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { SegmentedControl } from '@/features/git/components/SegmentedControl';
import type { TemplateCategoryFilter } from '@/features/templates/types';
import { TEMPLATE_CATEGORY_LABELS } from '@/features/templates/schemas';

type TemplatesToolbarProps = {
    query: string;
    onQueryChange: (value: string) => void;
    categoryFilter: TemplateCategoryFilter;
    onCategoryFilterChange: (filter: TemplateCategoryFilter) => void;
    onCreate: () => void;
    websitesCount: number;
    appsCount: number;
};

export const TemplatesToolbar = ({
    query,
    onQueryChange,
    categoryFilter,
    onCategoryFilterChange,
    onCreate,
    websitesCount,
    appsCount,
}: TemplatesToolbarProps) => {
    const hasQuery = query.trim().length > 0;

    return (
        <section className="overflow-hidden rounded-none">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    Templates
                </h1>

                <Button
                    type="button"
                    variant="brand"
                    className="h-11 rounded-md px-4 text-sm"
                    onClick={onCreate}
                >
                    <Plus data-icon="inline-start" />
                    Create template
                </Button>
            </div>

            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
                <div className="relative min-w-0 w-full sm:max-w-md">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/50" />
                    <Input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Filter by name or repository…"
                        className="h-10 w-full rounded-md bg-[#111111] pl-9 pr-9 text-foreground ring-1 ring-white/10 placeholder:text-foreground/40"
                        aria-label="Search templates"
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

                <SegmentedControl
                    aria-label="Category filter"
                    value={categoryFilter}
                    onChange={onCategoryFilterChange}
                    options={[
                        {
                            value: 'all',
                            label: (
                                <>
                                    All{' '}
                                    <span className="tabular-nums opacity-80">
                                        {websitesCount + appsCount}
                                    </span>
                                </>
                            ),
                        },
                        {
                            value: 'websites',
                            label: (
                                <>
                                    {TEMPLATE_CATEGORY_LABELS.websites}{' '}
                                    <span className="tabular-nums opacity-80">
                                        {websitesCount}
                                    </span>
                                </>
                            ),
                        },
                        {
                            value: 'apps',
                            label: (
                                <>
                                    {TEMPLATE_CATEGORY_LABELS.apps}{' '}
                                    <span className="tabular-nums opacity-80">
                                        {appsCount}
                                    </span>
                                </>
                            ),
                        },
                    ]}
                />
            </div>
        </section>
    );
};
