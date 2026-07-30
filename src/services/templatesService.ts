import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseClient } from '@/lib/supabase';
import type { Template, TemplateInput } from '@/features/templates/types';

type TemplateRow = Database['public']['Tables']['templates']['Row'];

const mapTemplate = (row: TemplateRow): Template => ({
    id: row.id,
    name: row.name,
    gitRepository: row.git_repository,
    url: row.url,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const templatesService = {
    list: async (): Promise<Template[]> => {
        const { data, error } = await getSupabaseClient()
            .from('templates')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return (data ?? []).map(mapTemplate);
    },

    create: async (input: TemplateInput): Promise<Template> => {
        const {
            data: { user },
        } = await getSupabaseClient().auth.getUser();

        const { data, error } = await getSupabaseClient()
            .from('templates')
            .insert({
                name: input.name.trim(),
                git_repository: input.gitRepository.trim(),
                url: input.url.trim(),
                category: input.category,
                created_by: user?.id ?? null,
                updated_by: user?.id ?? null,
            })
            .select('*')
            .single();

        if (error) throw error;
        return mapTemplate(data);
    },

    update: async (id: string, input: TemplateInput): Promise<Template> => {
        const {
            data: { user },
        } = await getSupabaseClient().auth.getUser();

        const { data, error } = await getSupabaseClient()
            .from('templates')
            .update({
                name: input.name.trim(),
                git_repository: input.gitRepository.trim(),
                url: input.url.trim(),
                category: input.category,
                updated_by: user?.id ?? null,
            })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return mapTemplate(data);
    },

    remove: async (id: string): Promise<void> => {
        const { error } = await getSupabaseClient()
            .from('templates')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};
