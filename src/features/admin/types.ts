import type { AppRole } from '@/constants/roles';

export type AdminUser = {
    id: string;
    email: string;
    fullName: string | null;
    role: AppRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastSignInAt: string | null;
    invitedAt: string | null;
    emailConfirmed: boolean;
};

export type InviteUserInput = {
    fullName: string;
    email: string;
    role: AppRole;
};

export type UpdateUserInput = {
    fullName?: string;
    role?: AppRole;
    isActive?: boolean;
};

export type AdminSetPasswordInput = {
    password: string;
};

export type UserStatusFilter =
    | 'all'
    | 'active'
    | 'inactive'
    | 'pending'
    | 'confirmed';
