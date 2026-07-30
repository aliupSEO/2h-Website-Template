import { create } from 'zustand';
import type {
    Template,
    TemplateInput,
} from '@/features/templates/types';
import { templatesService } from '@/services/templatesService';

type TemplatesStore = {
    templates: Template[];
    loading: boolean;
    error: string | null;
    fetchTemplates: () => Promise<void>;
    createTemplate: (input: TemplateInput) => Promise<Template>;
    updateTemplate: (id: string, input: TemplateInput) => Promise<Template>;
    deleteTemplate: (id: string) => Promise<void>;
};

export const useTemplatesStore = create<TemplatesStore>((set, get) => ({
    templates: [],
    loading: false,
    error: null,

    fetchTemplates: async () => {
        set({ loading: true, error: null });
        try {
            const templates = await templatesService.list();
            set({ templates, loading: false });
        }
        catch (error) {
            set({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Could not load templates',
            });
            throw error;
        }
    },

    createTemplate: async (input) => {
        const template = await templatesService.create(input);
        set({ templates: [template, ...get().templates], error: null });
        return template;
    },

    updateTemplate: async (id, input) => {
        const template = await templatesService.update(id, input);
        set({
            templates: get().templates.map((item) =>
                item.id === id ? template : item,
            ),
            error: null,
        });
        return template;
    },

    deleteTemplate: async (id) => {
        await templatesService.remove(id);
        set({
            templates: get().templates.filter((item) => item.id !== id),
            error: null,
        });
    },
}));
