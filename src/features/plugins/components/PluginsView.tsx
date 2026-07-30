import { useEffect, useMemo, useState } from 'react';
import { ConfirmModal, DocumentTitle, LoadingScreen } from '@/components/common';
import type { PluginSubmitValues } from '@/features/plugins/components/PluginFormDialog';
import { PluginFormDialog } from '@/features/plugins/components/PluginFormDialog';
import { PluginsCardGrid } from '@/features/plugins/components/PluginsCardGrid';
import { PluginsEmptyState } from '@/features/plugins/components/PluginsEmptyState';
import { PluginsToolbar } from '@/features/plugins/components/PluginsToolbar';
import type { Plugin } from '@/features/plugins/types';
import { toast } from '@/lib/toast';
import { usePluginsStore } from '@/stores/pluginsStore';

export const PluginsView = () => {
    const plugins = usePluginsStore((state) => state.plugins);
    const loading = usePluginsStore((state) => state.loading);
    const error = usePluginsStore((state) => state.error);
    const fetchPlugins = usePluginsStore((state) => state.fetchPlugins);
    const createPlugin = usePluginsStore((state) => state.createPlugin);
    const updatePlugin = usePluginsStore((state) => state.updatePlugin);
    const deletePlugin = usePluginsStore((state) => state.deletePlugin);
    const getDownloadUrl = usePluginsStore((state) => state.getDownloadUrl);

    const [query, setQuery] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Plugin | null>(null);

    useEffect(() => {
        void fetchPlugins().catch(() => undefined);
    }, [fetchPlugins]);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();

        return plugins.filter((plugin) => {
            if (!needle) return true;

            const haystack = [plugin.name, plugin.description ?? '']
                .join(' ')
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [plugins, query]);

    const handleSubmit = async (values: PluginSubmitValues) => {
        try {
            if (editingPlugin) {
                await updatePlugin(editingPlugin.id, values);
                toast.success('Plugin updated');
            }
            else {
                await createPlugin(values);
                toast.success('Plugin created');
            }
        }
        catch (submitError) {
            toast.error(
                submitError instanceof Error
                    ? submitError.message
                    : 'Could not save plugin',
            );
            throw submitError;
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deletePlugin(pendingDelete.id);
            toast.success('Plugin deleted');
        }
        catch (deleteError) {
            toast.error(
                deleteError instanceof Error
                    ? deleteError.message
                    : 'Could not delete plugin',
            );
            throw deleteError;
        }
    };

    const handleDownload = async (plugin: Plugin) => {
        try {
            const url = await getDownloadUrl(plugin);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = plugin.fileName ?? `${plugin.name}-plugin`;
            anchor.rel = 'noopener noreferrer';
            anchor.target = '_blank';
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            toast.success('Download started');
        }
        catch (downloadError) {
            toast.error(
                downloadError instanceof Error
                    ? downloadError.message
                    : 'Could not download file',
            );
            throw downloadError;
        }
    };

    if (loading && plugins.length === 0) {
        return <LoadingScreen label="Loading plugins…" />;
    }

    return (
        <>
            <DocumentTitle title="Plugins" />

            <PluginsToolbar
                query={query}
                onQueryChange={setQuery}
                pluginCount={plugins.length}
                onCreate={() => {
                    setEditingPlugin(null);
                    setFormOpen(true);
                }}
            />

            <div className="px-4 pb-8 sm:px-6">
                {error && plugins.length === 0 ? (
                    <PluginsEmptyState
                        title="Could not load plugins"
                        description={error}
                    />
                ) : filtered.length === 0 ? (
                    <PluginsEmptyState
                        title="No plugins found"
                        description={
                            query
                                ? 'Try a different search term.'
                                : 'Create your first plugin with a name, description, and file.'
                        }
                        showCreate={!query}
                        onCreate={() => {
                            setEditingPlugin(null);
                            setFormOpen(true);
                        }}
                    />
                ) : (
                    <PluginsCardGrid
                        plugins={filtered}
                        onEdit={(plugin) => {
                            setEditingPlugin(plugin);
                            setFormOpen(true);
                        }}
                        onDelete={setPendingDelete}
                        onDownload={handleDownload}
                    />
                )}
            </div>

            <PluginFormDialog
                open={formOpen}
                plugin={editingPlugin}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditingPlugin(null);
                }}
                onSubmit={handleSubmit}
            />

            <ConfirmModal
                open={Boolean(pendingDelete)}
                onOpenChange={(open) => {
                    if (!open) setPendingDelete(null);
                }}
                title="Delete plugin?"
                description={
                    pendingDelete
                        ? `Remove “${pendingDelete.name}” and its stored file. This cannot be undone.`
                        : ''
                }
                confirmLabel="Delete plugin"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    );
};
