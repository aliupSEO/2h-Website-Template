import type { AppRole } from '../../src/constants/roles.js';
import {
    assignableRolesFor,
    canManageProfiles,
    canModifyTargetRole,
} from '../../src/constants/roles.js';
import { getSupabaseAdminClient } from '../supabase/admin-client.js';

export type AdminContext = {
    userId: string;
    email: string;
    role: AppRole;
};

export type AdminAuthResult =
    | { ok: true; admin: AdminContext }
    | { ok: false; status: number; error: string };

const readBearerToken = (authorization: string | undefined): string | null => {
    if (!authorization?.startsWith('Bearer ')) return null;
    const token = authorization.slice('Bearer '.length).trim();
    return token || null;
};

export const requireAdmin = async (
    authorization: string | undefined,
): Promise<AdminAuthResult> => {
    const token = readBearerToken(authorization);
    if (!token) {
        return { ok: false, status: 401, error: 'Missing authorization token' };
    }

    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.auth.getUser(token);

    if (error || !data.user) {
        return { ok: false, status: 401, error: 'Invalid or expired session' };
    }

    const { data: profile, error: profileError } = await admin
        .from('profiles')
        .select('role, email, is_active')
        .eq('id', data.user.id)
        .maybeSingle();

    if (profileError || !profile) {
        return { ok: false, status: 403, error: 'Profile not found' };
    }

    if (!profile.is_active) {
        return { ok: false, status: 403, error: 'Account is inactive' };
    }

    if (!canManageProfiles(profile.role as AppRole)) {
        return { ok: false, status: 403, error: 'Admin access required' };
    }

    return {
        ok: true,
        admin: {
            userId: data.user.id,
            email: profile.email,
            role: profile.role as AppRole,
        },
    };
};

export const assertCanAssignRole = (
    actor: AppRole,
    role: AppRole,
): string | null => {
    if (!assignableRolesFor(actor).includes(role)) {
        return 'You cannot assign this role';
    }
    return null;
};

export const assertCanModifyTarget = (
    actor: AppRole,
    targetRole: AppRole,
): string | null => {
    if (!canModifyTargetRole(actor, targetRole)) {
        return 'You cannot modify this user';
    }
    return null;
};
