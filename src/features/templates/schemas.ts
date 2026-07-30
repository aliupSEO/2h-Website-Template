import { z } from 'zod';

export const TEMPLATE_CATEGORIES = ['websites', 'apps'] as const;

export const TEMPLATE_CATEGORY_LABELS: Record<
    (typeof TEMPLATE_CATEGORIES)[number],
    string
> = {
    websites: 'Websites',
    apps: 'Apps',
};

export const templateSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(120, 'Name is too long'),
    gitRepository: z
        .string()
        .min(1, 'Select a GitHub repository')
        .regex(
            /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
            'Repository must be owner/repo',
        ),
    url: z.string().url('Enter a valid URL'),
    category: z.enum(TEMPLATE_CATEGORIES),
});

export type TemplateSchema = z.infer<typeof templateSchema>;

export const TEMPLATE_CATEGORY_OPTIONS = TEMPLATE_CATEGORIES.map((value) => ({
    value,
    label: TEMPLATE_CATEGORY_LABELS[value],
}));
