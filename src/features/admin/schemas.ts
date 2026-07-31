import { z } from 'zod';
import {
    APP_ROLE_LABELS,
    APP_ROLES,
    assignableRolesFor,
    type AppRole,
} from '@/constants/roles';

export const inviteUserSchema = z.object({
    fullName: z
        .string()
        .min(1, 'Name is required')
        .max(120, 'Name is too long'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Enter a valid email'),
    role: z.enum(APP_ROLES),
});
export type InviteUserSchema = z.infer<typeof inviteUserSchema>;

export const editUserSchema = z.object({
    fullName: z
        .string()
        .min(1, 'Name is required')
        .max(120, 'Name is too long'),
    role: z.enum(APP_ROLES),
    isActive: z.boolean(),
});
export type EditUserSchema = z.infer<typeof editUserSchema>;

export const adminSetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(1, 'Password is required')
            .min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Confirm the password'),
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });
export type AdminSetPasswordSchema = z.infer<typeof adminSetPasswordSchema>;

export const roleOptionsForActor = (actor: AppRole) => {
    return assignableRolesFor(actor).map((role) => ({
        value: role,
        label: APP_ROLE_LABELS[role],
    }));
};

/** @deprecated Prefer roleOptionsForActor(actorRole) */
export const ADMIN_ROLE_OPTIONS = APP_ROLES.map((role) => ({
    value: role,
    label: APP_ROLE_LABELS[role],
}));
