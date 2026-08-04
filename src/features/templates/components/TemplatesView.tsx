import { useEffect, useMemo, useState } from 'react';
import { ConfirmModal, DocumentTitle, LoadingScreen } from '@/components/common';
import type { TemplateSchema } from '@/features/templates/schemas';
import type { Template, TemplateCategoryFilter } from '@/features/templates/types';
import { TemplateFormDialog } from './TemplateFormDialog';
import { TemplatesCardGrid } from './TemplatesCardGrid';
import { TemplatesTable } from './TemplatesTable';
import { TemplatesEmptyState } from './TemplatesEmptyState';
import { TemplatesToolbar } from './TemplatesToolbar';
import { toast } from '@/lib/toast';
import { useTemplatesStore } from '@/stores/templatesStore';

export const TemplatesView = () => {
    const templates = useTemplatesStore((state) => state.templates);
    const loading = useTemplatesStore((state) => state.loading);
    const error = useTemplatesStore((state) => state.error);
    const fetchTemplates = useTemplatesStore((state) => state.fetchTemplates);
    const createTemplate = useTemplatesStore((state) => state.createTemplate);
    const updateTemplate = useTemplatesStore((state) => state.updateTemplate);
    const deleteTemplate = useTemplatesStore((state) => state.deleteTemplate);

    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
    const [categoryFilter, setCategoryFilter] =
        useState<TemplateCategoryFilter>('all');
    const [formOpen, setFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(
        null,
    );
    const [pendingDelete, setPendingDelete] = useState<Template | null>(null);

    useEffect(() => {
        void fetchTemplates().catch(() => undefined);
    }, [fetchTemplates]);

    const websitesCount = useMemo(
        () => templates.filter((item) => item.category === 'websites').length,
        [templates],
    );
    const appsCount = useMemo(
        () => templates.filter((item) => item.category === 'apps').length,
        [templates],
    );

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();

        return templates.filter((template) => {
            if (
                categoryFilter !== 'all' &&
                template.category !== categoryFilter
            ) {
                return false;
            }

            if (!needle) return true;

            const haystack = [
                template.name,
                template.gitRepository,
                template.url,
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [categoryFilter, query, templates]);

    const handleSubmit = async (values: TemplateSchema) => {
        try {
            if (editingTemplate) {
                await updateTemplate(editingTemplate.id, values);
                toast.success('Template updated');
            }
            else {
                await createTemplate(values);
                toast.success('Template created');
            }
        }
        catch (submitError) {
            toast.error(
                submitError instanceof Error
                    ? submitError.message
                    : 'Could not save template',
            );
            throw submitError;
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deleteTemplate(pendingDelete.id);
            toast.success('Template deleted');
        }
        catch (deleteError) {
            toast.error(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Could not delete template',
            );
            throw deleteError;
        }
    };

    if (loading && templates.length === 0) {
        return <LoadingScreen label="Loading templates…" />;
    }

    return (
        <div className="space-y-4">
            <DocumentTitle title="Templates" />

            <div className="-m-4 space-y-0 bg-muted sm:-m-6">
                <TemplatesToolbar
                query={query}
                onQueryChange={setQuery}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                onCreate={() => {
                    setEditingTemplate(null);
                    setFormOpen(true);
                }}
                websitesCount={websitesCount}
                appsCount={appsCount}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {error && templates.length === 0 ? (
                    <TemplatesEmptyState
                        title="Could not load templates"
                        description={error}
                    />
                ) : filtered.length === 0 ? (
                    <TemplatesEmptyState
                        title="No templates found"
                        description={
                            query || categoryFilter !== 'all'
                                ? 'Try a different search or category filter.'
                                : 'Create your first starter template from a GitHub repository.'
                        }
                        showCreate={!query && categoryFilter === 'all'}
                        onCreate={() => {
                            setEditingTemplate(null);
                            setFormOpen(true);
                        }}
                    />
                ) : viewMode === 'table' ? (
                    <TemplatesTable
                        templates={filtered}
                        onEdit={(template) => {
                            setEditingTemplate(template);
                            setFormOpen(true);
                        }}
                        onDelete={setPendingDelete}
                    />
                ) : (
                    <div className="relative px-4 py-6 sm:px-6">
                        <TemplatesCardGrid
                            templates={filtered}
                            onEdit={(template) => {
                                setEditingTemplate(template);
                                setFormOpen(true);
                            }}
                            onDelete={setPendingDelete}
                        />
                    </div>
                )}
            </div>

            <TemplateFormDialog
                open={formOpen}
                template={editingTemplate}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditingTemplate(null);
                }}
                onSubmit={handleSubmit}
            />

            <ConfirmModal
                open={Boolean(pendingDelete)}
                onOpenChange={(open) => {
                    if (!open) setPendingDelete(null);
                }}
                title="Delete template?"
                description={
                    pendingDelete
                        ? `Remove “${pendingDelete.name}” from the catalog. This cannot be undone.`
                        : ''
                }
                confirmLabel="Delete template"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
};
