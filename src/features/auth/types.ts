import type { AppRole } from '@/constants/roles';

export type AuthUser = {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: AppRole;
};

export type AuthStatus = 'bootstrapping' | 'ready';
