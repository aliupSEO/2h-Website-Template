import { useEffect, useMemo, useState } from 'react';
import { ConfirmModal, DocumentTitle, LoadingScreen } from '@/components/common';
import { EnvEmptyState } from './EnvEmptyState';
import { EnvToolbar } from './EnvToolbar';
import { EnvVarFormDialog } from './EnvVarFormDialog';
import { EnvVarsTable } from './EnvVarsTable';
import { EnvVarsCardGrid } from './EnvVarsCardGrid';
import { ImportEnvDialog } from './ImportEnvDialog';
import { RevealEnvDialog } from './RevealEnvDialog';
import type {
    UpdateEnvVarSchema,
    UpsertEnvVarSchema,
} from '@/features/env/schemas';
import type { HubEnvVar } from '@/features/env/types';
import { toast } from '@/lib/toast';
import { useEnvStore } from '@/stores/envStore';

export const EnvVarsView = () => {
    const vars = useEnvStore((state) => state.vars);
    const loading = useEnvStore((state) => state.loading);
    const error = useEnvStore((state) => state.error);
    const fetchVars = useEnvStore((state) => state.fetchVars);
    const upsertVar = useEnvStore((state) => state.upsertVar);
    const updateVar = useEnvStore((state) => state.updateVar);
    const deleteVar = useEnvStore((state) => state.deleteVar);
    const revealVar = useEnvStore((state) => state.revealVar);
    const importFile = useEnvStore((state) => state.importFile);

    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
    const [formOpen, setFormOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<HubEnvVar | null>(null);
    const [revealItem, setRevealItem] = useState<HubEnvVar | null>(null);
    const [pendingDelete, setPendingDelete] = useState<HubEnvVar | null>(null);

    useEffect(() => {
        void fetchVars().catch(() => undefined);
    }, [fetchVars]);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return vars;
        return vars.filter((item) => item.key.toLowerCase().includes(needle));
    }, [query, vars]);

    const handleCreate = async (values: UpsertEnvVarSchema) => {
        try {
            await upsertVar(values);
            toast.success('Variable saved');
        }
        catch (createError) {
            toast.error(
                createError instanceof Error
                    ? createError.message
                    : 'Could not save variable',
            );
            throw createError;
        }
    };

    const handleUpdate = async (
        item: HubEnvVar,
        values: UpdateEnvVarSchema,
    ) => {
        try {
            await updateVar(item.id, values);
            toast.success('Value updated');
        }
        catch (updateError) {
            toast.error(
                updateError instanceof Error
                    ? updateError.message
                    : 'Could not update value',
            );
            throw updateError;
        }
    };

    const handleImport = async (content: string) => {
        try {
            const result = await importFile(content);
            toast.success(
                `Imported ${result.imported}, updated ${result.updated}${
                    result.skipped ? `, skipped ${result.skipped}` : ''
                }`,
            );
        }
        catch (importError) {
            toast.error(
                importError instanceof Error
                    ? importError.message
                    : 'Could not import file',
            );
            throw importError;
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deleteVar(pendingDelete.id);
            toast.success('Variable deleted');
        }
        catch (deleteError) {
            toast.error(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Could not delete variable',
            );
            throw deleteError;
        }
    };

    if (loading && vars.length === 0) {
        return <LoadingScreen label="Loading env…" />;
    }

    return (
        <div className="space-y-4">
            <DocumentTitle title="Env" />

            <div className="-m-4 space-y-0 bg-muted sm:-m-6">
                <EnvToolbar
                    query={query}
                    onQueryChange={setQuery}
                    varCount={vars.length}
                    onAdd={() => {
                        setEditingItem(null);
                        setFormOpen(true);
                    }}
                    onImport={() => setImportOpen(true)}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                {error && vars.length === 0 ? (
                    <EnvEmptyState
                        title="Could not load env"
                        description={error}
                    />
                ) : filtered.length === 0 ? (
                    <EnvEmptyState
                        title="No variables found"
                        description={
                            query
                                ? 'Try a different search term.'
                                : 'Add a key/value or import a .env file. Values stay encrypted on the server.'
                        }
                        showCreate={!query}
                        onCreate={() => {
                            setEditingItem(null);
                            setFormOpen(true);
                        }}
                    />
                ) : viewMode === 'table' ? (
                    <EnvVarsTable
                        vars={filtered}
                        onReveal={setRevealItem}
                        onEdit={(item) => {
                            setEditingItem(item);
                            setFormOpen(true);
                        }}
                        onDelete={setPendingDelete}
                    />
                ) : (
                    <div className="relative px-4 py-6 sm:px-6">
                        <EnvVarsCardGrid
                            vars={filtered}
                            onReveal={setRevealItem}
                            onEdit={(item) => {
                                setEditingItem(item);
                                setFormOpen(true);
                            }}
                            onDelete={setPendingDelete}
                        />
                    </div>
                )}
            </div>

            <EnvVarFormDialog
                open={formOpen}
                item={editingItem}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditingItem(null);
                }}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
            />

            <ImportEnvDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                onImport={handleImport}
            />

            <RevealEnvDialog
                open={Boolean(revealItem)}
                item={revealItem}
                onOpenChange={(open) => {
                    if (!open) setRevealItem(null);
                }}
                onReveal={(item) => revealVar(item.id)}
            />

            <ConfirmModal
                open={Boolean(pendingDelete)}
                onOpenChange={(open) => {
                    if (!open) setPendingDelete(null);
                }}
                title="Delete variable?"
                description={
                    pendingDelete
                        ? `Remove “${pendingDelete.key}” from the Hub secrets store. This cannot be undone.`
                        : ''
                }
                confirmLabel="Delete variable"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
};
