import type { AppRole } from '../../src/constants/roles.js';

export type AdminUserDto = {
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

export type AdminApiErrorBody = {
    error: string;
    status: number;
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

export type ForgotPasswordInput = {
    email: string;
};
