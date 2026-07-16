import { z } from 'zod';

const repoName = z
    .string()
    .min(1, 'Repository name is required')
    .max(100, 'Repository name is too long')
    .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Use only letters, numbers, dots, hyphens, and underscores',
    );

export const createRepoSchema = z.object({
    name: repoName,
    description: z.string().max(350, 'Description is too long').optional(),
    private: z.boolean(),
    autoInit: z.boolean(),
});
export type CreateRepoSchema = z.infer<typeof createRepoSchema>;

export const updateRepoSchema = z.object({
    name: repoName,
    description: z.string().max(350, 'Description is too long'),
    private: z.boolean(),
});
export type UpdateRepoSchema = z.infer<typeof updateRepoSchema>;
