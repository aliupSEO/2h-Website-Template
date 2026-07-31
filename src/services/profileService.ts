import type { AuthUser } from '@/features/auth/types';
import { getSupabaseClient } from '@/lib/supabase';
import {
    AVATARS_BUCKET,
    buildAvatarStoragePath,
} from '@/lib/supabase/storage';
import { authService } from '@/services/authService';

const AVATAR_MAX_BYTES = 5_242_880;

const requireSessionUser = async () => {
    const supabase = getSupabaseClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error('Not signed in');
    return user;
};

const refreshAuthUser = async (): Promise<AuthUser> => {
    const session = await authService.getSession();
    const authUser = await authService.resolveUserFromSession(session);
    if (!authUser) throw new Error('Not signed in');
    return authUser;
};

const extractAvatarPath = (avatarUrl: string | null | undefined) => {
    if (!avatarUrl) return null;
    const marker = `/object/public/${AVATARS_BUCKET}/`;
    const index = avatarUrl.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(
        avatarUrl.slice(index + marker.length).split('?')[0] ?? '',
    );
};

export const profileService = {
    updateName: async (input: {
        firstName: string;
        lastName: string;
    }): Promise<AuthUser> => {
        const user = await requireSessionUser();
        const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
        const supabase = getSupabaseClient();

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id);

        if (profileError) throw profileError;

        const { error: metaError } = await supabase.auth.updateUser({
            data: { full_name: fullName },
        });

        if (metaError) throw metaError;

        return refreshAuthUser();
    },

    updatePassword: async (input: {
        email: string;
        currentPassword: string;
        newPassword: string;
    }): Promise<void> => {
        const { error: verifyError } = await getSupabaseClient().auth.signInWithPassword({
            email: input.email.trim(),
            password: input.currentPassword,
        });

        if (verifyError) {
            throw new Error('Current password is incorrect');
        }

        await authService.updatePassword(input.newPassword);
    },

    uploadAvatar: async (file: File): Promise<AuthUser> => {
        if (!file.type.startsWith('image/')) {
            throw new Error('Choose an image file');
        }

        if (file.size > AVATAR_MAX_BYTES) {
            throw new Error('Image must be 5 MB or smaller');
        }

        const user = await requireSessionUser();
        const supabase = getSupabaseClient();
        const path = buildAvatarStoragePath(user.id, file.name);

        const { data: existing } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        const previousPath = extractAvatarPath(existing?.avatar_url);
        if (previousPath && previousPath !== path) {
            await supabase.storage.from(AVATARS_BUCKET).remove([previousPath]);
        }

        const { error: uploadError } = await supabase.storage
            .from(AVATARS_BUCKET)
            .upload(path, file, {
                upsert: true,
                contentType: file.type || undefined,
                cacheControl: '3600',
            });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
            .from(AVATARS_BUCKET)
            .getPublicUrl(path);

        const avatarUrl = `${publicData.publicUrl}?t=${Date.now()}`;

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', user.id);

        if (profileError) throw profileError;

        return refreshAuthUser();
    },

    removeAvatar: async (): Promise<AuthUser> => {
        const user = await requireSessionUser();
        const supabase = getSupabaseClient();

        const { data: existing } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .maybeSingle();

        const path = extractAvatarPath(existing?.avatar_url);
        if (path) {
            const { error: removeError } = await supabase.storage
                .from(AVATARS_BUCKET)
                .remove([path]);
            if (removeError) throw removeError;
        }

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', user.id);

        if (profileError) throw profileError;

        return refreshAuthUser();
    },
};
