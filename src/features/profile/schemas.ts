import { z } from 'zod';

export const profileNameSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
});

export type ProfileNameSchema = z.infer<typeof profileNameSchema>;

export const profilePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Use at least 8 characters'),
        confirmPassword: z.string().min(1, 'Confirm your new password'),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type ProfilePasswordSchema = z.infer<typeof profilePasswordSchema>;
