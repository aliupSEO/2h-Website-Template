import { z } from 'zod';

const envKeySchema = z
    .string()
    .trim()
    .min(1, 'Key is required')
    .regex(
        /^[A-Za-z_][A-Za-z0-9_]*$/,
        'Use letters, numbers, and underscores; start with a letter or underscore',
    );

export const upsertEnvVarSchema = z.object({
    key: envKeySchema,
    value: z.string().min(1, 'Value is required'),
});

export type UpsertEnvVarSchema = z.infer<typeof upsertEnvVarSchema>;

export const updateEnvVarSchema = z.object({
    value: z.string().min(1, 'Value is required'),
});

export type UpdateEnvVarSchema = z.infer<typeof updateEnvVarSchema>;

export const importEnvSchema = z.object({
    content: z.string().trim().min(1, 'Paste or upload a .env file'),
});

export type ImportEnvSchema = z.infer<typeof importEnvSchema>;
