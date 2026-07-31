import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseClient } from '@/lib/supabase';
import {
    buildPluginStoragePath,
    HUB_PLUGINS_BUCKET,
} from '@/lib/supabase/storage';
import type { Plugin, PluginInput } from '@/features/plugins/types';

type PluginRow = Database['public']['Tables']['plugins']['Row'];

const mapPlugin = (row: PluginRow): Plugin => ({
    id: row.id,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    storagePath: row.storage_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

const normalizeDescription = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

const removeStorageObject = async (path: string | null | undefined) => {
    if (!path) return;

    const { error } = await getSupabaseClient()
        .storage
        .from(HUB_PLUGINS_BUCKET)
        .remove([path]);

    if (error) throw error;
};

const uploadPluginFile = async (pluginId: string, file: File) => {
    const storagePath = buildPluginStoragePath(pluginId, file.name);
    const { error } = await getSupabaseClient()
        .storage
        .from(HUB_PLUGINS_BUCKET)
        .upload(storagePath, file, {
            upsert: true,
            contentType: file.type || undefined,
        });

    if (error) throw error;

    return {
        storagePath,
        fileName: file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
    };
};

export const pluginsService = {
    list: async (): Promise<Plugin[]> => {
        const { data, error } = await getSupabaseClient()
            .from('plugins')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return (data ?? []).map(mapPlugin);
    },

    create: async (input: PluginInput): Promise<Plugin> => {
        if (!input.file) {
            throw new Error('Upload a plugin file');
        }

        const {
            data: { user },
        } = await getSupabaseClient().auth.getUser();

        const id = crypto.randomUUID();
        const fileMeta = await uploadPluginFile(id, input.file);

        const { data, error } = await getSupabaseClient()
            .from('plugins')
            .insert({
                id,
                name: input.name.trim(),
                description: normalizeDescription(input.description),
                is_active: input.isActive ?? true,
                file_name: fileMeta.fileName,
                mime_type: fileMeta.mimeType,
                size_bytes: fileMeta.sizeBytes,
                storage_path: fileMeta.storagePath,
                created_by: user?.id ?? null,
                updated_by: user?.id ?? null,
            })
            .select('*')
            .single();

        if (error) {
            await removeStorageObject(fileMeta.storagePath);
            throw error;
        }

        return mapPlugin(data);
    },

    update: async (id: string, input: PluginInput): Promise<Plugin> => {
        const {
            data: { user },
        } = await getSupabaseClient().auth.getUser();

        const { data: existing, error: existingError } = await getSupabaseClient()
            .from('plugins')
            .select('*')
            .eq('id', id)
            .single();

        if (existingError) throw existingError;

        let filePatch: {
            file_name: string | null;
            mime_type: string | null;
            size_bytes: number | null;
            storage_path: string | null;
        } = {
            file_name: existing.file_name,
            mime_type: existing.mime_type,
            size_bytes: existing.size_bytes,
            storage_path: existing.storage_path,
        };

        if (input.removeFile) {
            await removeStorageObject(existing.storage_path);
            filePatch = {
                file_name: null,
                mime_type: null,
                size_bytes: null,
                storage_path: null,
            };
        }

        if (input.file) {
            if (existing.storage_path) {
                await removeStorageObject(existing.storage_path);
            }

            const fileMeta = await uploadPluginFile(id, input.file);
            filePatch = {
                file_name: fileMeta.fileName,
                mime_type: fileMeta.mimeType,
                size_bytes: fileMeta.sizeBytes,
                storage_path: fileMeta.storagePath,
            };
        }

        const { data, error } = await getSupabaseClient()
            .from('plugins')
            .update({
                name: input.name.trim(),
                description: normalizeDescription(input.description),
                ...(input.isActive !== undefined
                    ? { is_active: input.isActive }
                    : {}),
                ...filePatch,
                updated_by: user?.id ?? null,
            })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return mapPlugin(data);
    },

    setActive: async (id: string, isActive: boolean): Promise<Plugin> => {
        const {
            data: { user },
        } = await getSupabaseClient().auth.getUser();

        const { data, error } = await getSupabaseClient()
            .from('plugins')
            .update({
                is_active: isActive,
                updated_by: user?.id ?? null,
            })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return mapPlugin(data);
    },

    remove: async (id: string): Promise<void> => {
        const { data: existing, error: existingError } = await getSupabaseClient()
            .from('plugins')
            .select('storage_path')
            .eq('id', id)
            .single();

        if (existingError) throw existingError;

        await removeStorageObject(existing.storage_path);

        const { error } = await getSupabaseClient()
            .from('plugins')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    getDownloadUrl: async (plugin: Plugin): Promise<string> => {
        if (!plugin.storagePath) {
            throw new Error('This plugin has no file to download');
        }

        const { data, error } = await getSupabaseClient()
            .storage
            .from(HUB_PLUGINS_BUCKET)
            .createSignedUrl(plugin.storagePath, 120);

        if (error) throw error;
        if (!data?.signedUrl) {
            throw new Error('Could not create download link');
        }

        return data.signedUrl;
    },
};
