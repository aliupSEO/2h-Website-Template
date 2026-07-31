import { z } from 'zod';

export const pluginFormSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(120, 'Name is too long'),
    description: z
        .string()
        .max(2000, 'Description is too long')
        .optional()
        .or(z.literal('')),
    isActive: z.boolean(),
});

export type PluginFormSchema = z.infer<typeof pluginFormSchema>;
