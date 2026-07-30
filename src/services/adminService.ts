import type {
    AdminSetPasswordInput,
    AdminUser,
    InviteUserInput,
    UpdateUserInput,
} from '@/features/admin/types';
import { apiEndpoints } from '@/lib/api-endpoints';
import { getSupabaseClient } from '@/lib/supabase';

const parseError = async (response: Response) => {
    try {
        const body = (await response.json()) as { error?: string };
        if (body.error) return body.error;
    }
    catch {
        // ignore
    }
    return `Request failed (${response.status})`;
};

const getAccessToken = async () => {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    const token = data.session?.access_token;
    if (!token) throw new Error('Your session expired. Sign in again.');
    return token;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const token = await getAccessToken();
    const response = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...init?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(await parseError(response));
    }

    return (await response.json()) as T;
};

export const adminService = {
    listUsers: async (): Promise<AdminUser[]> => {
        const data = await request<{ users: AdminUser[] }>(
            apiEndpoints.admin.users,
        );
        return data.users;
    },

    inviteUser: async (
        input: InviteUserInput,
    ): Promise<{ user: AdminUser; resent: boolean }> => {
        return request<{ user: AdminUser; resent: boolean }>(
            apiEndpoints.admin.users,
            {
                method: 'POST',
                body: JSON.stringify(input),
            },
        );
    },

    updateUser: async (
        userId: string,
        input: UpdateUserInput,
    ): Promise<AdminUser> => {
        const data = await request<{ user: AdminUser }>(
            apiEndpoints.admin.user(userId),
            {
                method: 'PATCH',
                body: JSON.stringify(input),
            },
        );
        return data.user;
    },

    setUserPassword: async (
        userId: string,
        input: AdminSetPasswordInput,
    ): Promise<void> => {
        await request<{ sent: boolean }>(
            apiEndpoints.admin.userPassword(userId),
            {
                method: 'PUT',
                body: JSON.stringify(input),
            },
        );
    },

    sendPasswordReset: async (userId: string): Promise<void> => {
        await request<{ sent: boolean }>(
            apiEndpoints.admin.userPassword(userId),
            { method: 'POST' },
        );
    },
};

export const authApiService = {
    forgotPassword: async (email: string): Promise<void> => {
        const response = await fetch(apiEndpoints.auth.forgotPassword, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            throw new Error(await parseError(response));
        }
    },
};
