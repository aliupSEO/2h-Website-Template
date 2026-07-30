import type { AppRole } from '../../src/constants/roles.js';
import { APP_ROLES } from '../../src/constants/roles.js';
import {
    sendAdminPasswordResetEmail,
    sendInviteEmail,
    sendResetPasswordEmail,
} from '../email/client.js';
import { getAppUrl } from '../email/env.js';
import { getSupabaseAdminClient } from '../supabase/admin-client.js';
import { requireAdmin } from './auth.js';
import type {
    AdminApiErrorBody,
    AdminSetPasswordInput,
    AdminUserDto,
    InviteUserInput,
    UpdateUserInput,
} from './types.js';

export type HandlerResult<T> =
    | { ok: true; data: T; status: number }
    | { ok: false; body: AdminApiErrorBody; status: number };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^.{8,}$/;

const toError = (error: unknown, fallback = 'Unexpected server error'): AdminApiErrorBody => {
    if (error instanceof Error) {
        return { error: error.message, status: 500 };
    }
    return { error: fallback, status: 500 };
};

const mapUser = (
    profile: {
        id: string;
        email: string;
        full_name: string | null;
        role: AppRole;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    },
    authMeta?: {
        last_sign_in_at?: string | null;
        invited_at?: string | null;
        email_confirmed_at?: string | null;
    },
): AdminUserDto => ({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    isActive: profile.is_active,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    lastSignInAt: authMeta?.last_sign_in_at ?? null,
    invitedAt: authMeta?.invited_at ?? null,
    emailConfirmed: Boolean(authMeta?.email_confirmed_at),
});

const findAuthUserByEmail = async (email: string) => {
    const admin = getSupabaseAdminClient();
    const normalized = email.trim().toLowerCase();

    for (let page = 1; page <= 10; page += 1) {
        const { data, error } = await admin.auth.admin.listUsers({
            page,
            perPage: 200,
        });

        if (error) throw error;

        const match = data.users.find(
            (user) => user.email?.toLowerCase() === normalized,
        );
        if (match) return match;
        if (data.users.length < 200) break;
    }

    return null;
};

const validateInvite = (body: unknown): InviteUserInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';

    const input = body as Record<string, unknown>;
    const fullName =
        typeof input.fullName === 'string' ? input.fullName.trim() : '';
    const email = typeof input.email === 'string' ? input.email.trim() : '';
    const role = input.role;

    if (!fullName) return 'Name is required';
    if (fullName.length > 120) return 'Name is too long';
    if (!email || !emailPattern.test(email)) return 'Enter a valid email';
    if (!APP_ROLES.includes(role as AppRole)) return 'Select a valid role';

    return { fullName, email, role: role as AppRole };
};

const validateUpdate = (body: unknown): UpdateUserInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';

    const input = body as Record<string, unknown>;
    const next: UpdateUserInput = {};

    if (input.fullName !== undefined) {
        if (typeof input.fullName !== 'string' || !input.fullName.trim()) {
            return 'Name is required';
        }
        if (input.fullName.trim().length > 120) return 'Name is too long';
        next.fullName = input.fullName.trim();
    }

    if (input.role !== undefined) {
        if (!APP_ROLES.includes(input.role as AppRole)) {
            return 'Select a valid role';
        }
        next.role = input.role as AppRole;
    }

    if (input.isActive !== undefined) {
        if (typeof input.isActive !== 'boolean') {
            return 'Active status must be true or false';
        }
        next.isActive = input.isActive;
    }

    if (
        next.fullName === undefined &&
        next.role === undefined &&
        next.isActive === undefined
    ) {
        return 'Nothing to update';
    }

    return next;
};

const validatePassword = (body: unknown): AdminSetPasswordInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';

    const input = body as Record<string, unknown>;
    const password = typeof input.password === 'string' ? input.password : '';

    if (!passwordPattern.test(password)) {
        return 'Password must be at least 8 characters';
    }

    return { password };
};

export const handleListUsers = async (
    authorization: string | undefined,
): Promise<HandlerResult<{ users: AdminUserDto[] }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        const admin = getSupabaseAdminClient();
        const { data: profiles, error } = await admin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const authUsers = new Map<string, {
            last_sign_in_at?: string | null;
            invited_at?: string | null;
            email_confirmed_at?: string | null;
        }>();

        for (let page = 1; page <= 10; page += 1) {
            const { data, error: listError } = await admin.auth.admin.listUsers({
                page,
                perPage: 200,
            });
            if (listError) throw listError;

            for (const user of data.users) {
                authUsers.set(user.id, {
                    last_sign_in_at: user.last_sign_in_at ?? null,
                    invited_at: user.invited_at ?? null,
                    email_confirmed_at: user.email_confirmed_at ?? null,
                });
            }

            if (data.users.length < 200) break;
        }

        return {
            ok: true,
            status: 200,
            data: {
                users: (profiles ?? []).map((profile) =>
                    mapUser(profile, authUsers.get(profile.id)),
                ),
            },
        };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleInviteUser = async (
    authorization: string | undefined,
    body: unknown,
): Promise<HandlerResult<{ user: AdminUserDto; resent: boolean }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        const parsed = validateInvite(body);
        if (typeof parsed === 'string') {
            return {
                ok: false,
                body: { error: parsed, status: 400 },
                status: 400,
            };
        }

        const admin = getSupabaseAdminClient();
        const existing = await findAuthUserByEmail(parsed.email);
        const resent = Boolean(existing);

        if (existing?.last_sign_in_at) {
            return {
                ok: false,
                body: {
                    error: 'This user already has an account. Use password reset instead.',
                    status: 409,
                },
                status: 409,
            };
        }

        const { data: linkData, error: linkError } =
            await admin.auth.admin.generateLink({
                type: 'invite',
                email: parsed.email,
                options: {
                    redirectTo: `${getAppUrl()}/auth/accept-invite`,
                    data: {
                        full_name: parsed.fullName,
                        role: parsed.role,
                    },
                },
            });

        if (linkError) throw linkError;

        const actionLink = linkData.properties.action_link;
        if (!actionLink) {
            throw new Error('Could not create invitation link');
        }

        const userId = linkData.user.id;

        const { data: profile, error: profileError } = await admin
            .from('profiles')
            .update({
                full_name: parsed.fullName,
                role: parsed.role,
                email: parsed.email,
                is_active: true,
            })
            .eq('id', userId)
            .select('*')
            .single();

        if (profileError) throw profileError;

        await sendInviteEmail({
            to: parsed.email,
            name: parsed.fullName,
            inviteLink: actionLink,
        });

        return {
            ok: true,
            status: resent ? 200 : 201,
            data: {
                user: mapUser(profile, {
                    invited_at: linkData.user.invited_at,
                    email_confirmed_at: linkData.user.email_confirmed_at,
                    last_sign_in_at: linkData.user.last_sign_in_at,
                }),
                resent,
            },
        };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleUpdateUser = async (
    authorization: string | undefined,
    userId: string,
    body: unknown,
): Promise<HandlerResult<{ user: AdminUserDto }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        if (!userId.trim()) {
            return {
                ok: false,
                body: { error: 'User id is required', status: 400 },
                status: 400,
            };
        }

        const parsed = validateUpdate(body);
        if (typeof parsed === 'string') {
            return {
                ok: false,
                body: { error: parsed, status: 400 },
                status: 400,
            };
        }

        if (userId === auth.admin.userId) {
            if (parsed.isActive === false) {
                return {
                    ok: false,
                    body: { error: 'You cannot deactivate your own account', status: 400 },
                    status: 400,
                };
            }
            if (parsed.role && parsed.role !== 'admin') {
                return {
                    ok: false,
                    body: { error: 'You cannot change your own admin role', status: 400 },
                    status: 400,
                };
            }
        }

        const admin = getSupabaseAdminClient();
        const updates: {
            full_name?: string;
            role?: AppRole;
            is_active?: boolean;
        } = {};
        if (parsed.fullName !== undefined) updates.full_name = parsed.fullName;
        if (parsed.role !== undefined) updates.role = parsed.role;
        if (parsed.isActive !== undefined) updates.is_active = parsed.isActive;

        const { data: profile, error } = await admin
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select('*')
            .maybeSingle();

        if (error) throw error;
        if (!profile) {
            return {
                ok: false,
                body: { error: 'User not found', status: 404 },
                status: 404,
            };
        }

        if (parsed.fullName !== undefined || parsed.role !== undefined) {
            await admin.auth.admin.updateUserById(userId, {
                user_metadata: {
                    ...(parsed.fullName !== undefined
                        ? { full_name: parsed.fullName }
                        : {}),
                    ...(parsed.role !== undefined ? { role: parsed.role } : {}),
                },
            });
        }

        const authUser = await admin.auth.admin.getUserById(userId);

        return {
            ok: true,
            status: 200,
            data: {
                user: mapUser(profile, {
                    last_sign_in_at: authUser.data.user?.last_sign_in_at ?? null,
                    invited_at: authUser.data.user?.invited_at ?? null,
                    email_confirmed_at: authUser.data.user?.email_confirmed_at ?? null,
                }),
            },
        };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleAdminSetPassword = async (
    authorization: string | undefined,
    userId: string,
    body: unknown,
): Promise<HandlerResult<{ sent: boolean }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        if (userId === auth.admin.userId) {
            return {
                ok: false,
                body: {
                    error: 'Use your profile page to change your own password',
                    status: 400,
                },
                status: 400,
            };
        }

        const parsed = validatePassword(body);
        if (typeof parsed === 'string') {
            return {
                ok: false,
                body: { error: parsed, status: 400 },
                status: 400,
            };
        }

        const admin = getSupabaseAdminClient();
        const { data: profile, error: profileError } = await admin
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) {
            return {
                ok: false,
                body: { error: 'User not found', status: 404 },
                status: 404,
            };
        }

        const { error } = await admin.auth.admin.updateUserById(userId, {
            password: parsed.password,
        });

        if (error) throw error;

        return {
            ok: true,
            status: 200,
            data: { sent: false },
        };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleAdminSendPasswordReset = async (
    authorization: string | undefined,
    userId: string,
): Promise<HandlerResult<{ sent: boolean }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        if (userId === auth.admin.userId) {
            return {
                ok: false,
                body: {
                    error: 'Use your profile page to change your own password',
                    status: 400,
                },
                status: 400,
            };
        }

        const admin = getSupabaseAdminClient();
        const { data: profile, error: profileError } = await admin
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) {
            return {
                ok: false,
                body: { error: 'User not found', status: 404 },
                status: 404,
            };
        }

        const { data: linkData, error: linkError } =
            await admin.auth.admin.generateLink({
                type: 'recovery',
                email: profile.email,
                options: {
                    redirectTo: `${getAppUrl()}/auth/reset-password`,
                },
            });

        if (linkError) throw linkError;

        const resetLink = linkData.properties.action_link;
        if (!resetLink) throw new Error('Could not create reset link');

        await sendAdminPasswordResetEmail({
            to: profile.email,
            name: profile.full_name ?? profile.email,
            resetLink,
        });

        return {
            ok: true,
            status: 200,
            data: { sent: true },
        };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleForgotPassword = async (
    body: unknown,
): Promise<HandlerResult<{ sent: boolean }>> => {
    try {
        if (!body || typeof body !== 'object') {
            return {
                ok: true,
                status: 200,
                data: { sent: true },
            };
        }

        const input = body as Record<string, unknown>;
        const email = typeof input.email === 'string' ? input.email.trim() : '';

        if (!email || !emailPattern.test(email)) {
            return {
                ok: true,
                status: 200,
                data: { sent: true },
            };
        }

        const admin = getSupabaseAdminClient();
        const existing = await findAuthUserByEmail(email);

        if (!existing) {
            return {
                ok: true,
                status: 200,
                data: { sent: true },
            };
        }

        const { data: linkData, error: linkError } =
            await admin.auth.admin.generateLink({
                type: 'recovery',
                email,
                options: {
                    redirectTo: `${getAppUrl()}/auth/reset-password`,
                },
            });

        if (linkError) throw linkError;

        const resetLink = linkData.properties.action_link;
        if (resetLink) {
            await sendResetPasswordEmail({ to: email, resetLink });
        }

        return {
            ok: true,
            status: 200,
            data: { sent: true },
        };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};
