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
