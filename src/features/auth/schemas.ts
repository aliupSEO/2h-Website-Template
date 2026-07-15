import { z } from 'zod';

export const signInSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});
export type SignInSchema = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Enter a valid email'),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Confirm your password'),
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
