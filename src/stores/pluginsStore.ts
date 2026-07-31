import { create } from 'zustand';
import type { Plugin, PluginInput } from '@/features/plugins/types';
import { pluginsService } from '@/services/pluginsService';

type PluginsStore = {
    plugins: Plugin[];
    loading: boolean;
    error: string | null;
    fetchPlugins: () => Promise<void>;
    createPlugin: (input: PluginInput) => Promise<Plugin>;
    updatePlugin: (id: string, input: PluginInput) => Promise<Plugin>;
    setPluginActive: (id: string, isActive: boolean) => Promise<Plugin>;
    deletePlugin: (id: string) => Promise<void>;
    getDownloadUrl: (plugin: Plugin) => Promise<string>;
};

export const usePluginsStore = create<PluginsStore>((set, get) => ({
    plugins: [],
    loading: false,
    error: null,

    fetchPlugins: async () => {
        set({ loading: true, error: null });
        try {
            const plugins = await pluginsService.list();
            set({ plugins, loading: false });
        }
        catch (error) {
            set({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Could not load plugins',
            });
            throw error;
        }
    },

    createPlugin: async (input) => {
        const plugin = await pluginsService.create(input);
        set({ plugins: [plugin, ...get().plugins], error: null });
        return plugin;
    },

    updatePlugin: async (id, input) => {
        const plugin = await pluginsService.update(id, input);
        set({
            plugins: get().plugins.map((item) =>
                item.id === id ? plugin : item,
            ),
            error: null,
        });
        return plugin;
    },

    setPluginActive: async (id, isActive) => {
        const plugin = await pluginsService.setActive(id, isActive);
        set({
            plugins: get().plugins.map((item) =>
                item.id === id ? plugin : item,
            ),
            error: null,
        });
        return plugin;
    },

    deletePlugin: async (id) => {
        await pluginsService.remove(id);
        set({
            plugins: get().plugins.filter((item) => item.id !== id),
            error: null,
        });
    },

    getDownloadUrl: (plugin) => pluginsService.getDownloadUrl(plugin),
}));
