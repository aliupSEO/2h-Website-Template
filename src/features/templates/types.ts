import type { TemplateCategory } from '@/lib/supabase/database.types';

export type { TemplateCategory };

export type Template = {
    id: string;
    name: string;
    gitRepository: string;
    url: string;
    category: TemplateCategory;
    createdAt: string;
    updatedAt: string;
};

export type TemplateInput = {
    name: string;
    gitRepository: string;
    url: string;
    category: TemplateCategory;
};

export type TemplateCategoryFilter = 'all' | TemplateCategory;
