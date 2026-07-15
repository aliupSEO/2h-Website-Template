import type { Session, User } from '@supabase/supabase-js';
import { InactiveAccountError } from '@/features/auth/utils/authErrors';
import { mapAuthUser } from '@/features/auth/utils/mapAuthUser';
import type { AuthUser } from '@/features/auth/types';
import { getSupabaseClient } from '@/lib/supabase';
import type { Database } from '@/lib/supabase/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const authRedirectTo = (path: string) => {
    const origin = window.location.origin.replace(/\/$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${normalized}`;
};

const fetchProfile = async (userId: string): Promise<ProfileRow | null> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.warn('[auth] profile fetch failed', error.message);
        return null;
    }

    return data;
};

const resolveAuthUser = async (user: User): Promise<AuthUser> => {
    const profile = await fetchProfile(user.id);

    if (profile && !profile.is_active) {
        await getSupabaseClient().auth.signOut();
        throw new InactiveAccountError();
    }

    return mapAuthUser(user, profile);
};

export const authService = {
    getSession: async (): Promise<Session | null> => {
        const { data, error } = await getSupabaseClient().auth.getSession();
        if (error) throw error;
        return data.session;
    },

    onAuthStateChange: (
        callback: (session: Session | null) => void | Promise<void>,
    ) => {
        const { data } = getSupabaseClient().auth.onAuthStateChange(
            (_event, session) => {
                void callback(session);
            },
        );
        return data.subscription;
    },

    resolveUserFromSession: async (
        session: Session | null,
    ): Promise<AuthUser | null> => {
        if (!session?.user) return null;
        return resolveAuthUser(session.user);
    },

    signInWithPassword: async (input: {
        email: string;
        password: string;
    }): Promise<AuthUser> => {
        const { data, error } = await getSupabaseClient().auth.signInWithPassword({
            email: input.email.trim(),
            password: input.password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Sign in failed');

        return resolveAuthUser(data.user);
    },

    signInWithGoogle: async () => {
        const { error } = await getSupabaseClient().auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: authRedirectTo('/dashboard'),
            },
        });

        if (error) throw error;
    },

    resetPasswordForEmail: async (email: string) => {
        const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
            email.trim(),
            {
                redirectTo: authRedirectTo('/auth/reset-password'),
            },
        );

        if (error) throw error;
    },

    updatePassword: async (password: string) => {
        const { error } = await getSupabaseClient().auth.updateUser({
            password,
        });

        if (error) throw error;
    },

    signOut: async () => {
        const { error } = await getSupabaseClient().auth.signOut();
        if (error) throw error;
    },
};
