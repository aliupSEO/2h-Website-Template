import { z } from 'zod';

export const addFirebaseSchema = z.object({
    projectId: z
        .string()
        .min(1, 'Select a GCP project')
        .regex(
            /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
            'Invalid Google Cloud project id',
        ),
});
export type AddFirebaseSchema = z.infer<typeof addFirebaseSchema>;

export const createWebAppSchema = z.object({
    displayName: z
        .string()
        .min(1, 'Display name is required')
        .max(100, 'Display name is too long'),
});
export type CreateWebAppSchema = z.infer<typeof createWebAppSchema>;

export const addAuthorizedDomainSchema = z.object({
    domain: z
        .string()
        .min(1, 'Domain is required')
        .max(253, 'Domain is too long')
        .regex(
            /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i,
            'Enter a valid domain (e.g. app.example.com)',
        ),
});
export type AddAuthorizedDomainSchema = z.infer<typeof addAuthorizedDomainSchema>;

export const FIREBASE_IDP_OPTIONS = [
    { value: 'google.com', label: 'Google' },
    { value: 'facebook.com', label: 'Facebook' },
    { value: 'github.com', label: 'GitHub' },
    { value: 'apple.com', label: 'Apple' },
    { value: 'microsoft.com', label: 'Microsoft' },
    { value: 'twitter.com', label: 'Twitter / X' },
    { value: 'yahoo.com', label: 'Yahoo' },
] as const;

export const upsertIdpProviderSchema = z.object({
    idpId: z.string().min(1, 'Provider is required'),
    enabled: z.boolean(),
    clientId: z.string().min(1, 'Client ID is required'),
    clientSecret: z.string().min(1, 'Client secret is required'),
});
export type UpsertIdpProviderSchema = z.infer<typeof upsertIdpProviderSchema>;

export const enableFirestoreSchema = z.object({
    locationId: z.string().optional(),
});
export type EnableFirestoreSchema = z.infer<typeof enableFirestoreSchema>;

export const enableStorageSchema = z.object({
    location: z.string().optional(),
    bucketName: z.string().optional(),
});
export type EnableStorageSchema = z.infer<typeof enableStorageSchema>;
