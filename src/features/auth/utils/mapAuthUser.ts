import type { User } from '@supabase/supabase-js';
import type { AppRole } from '@/constants/roles';
import type { Database } from '@/lib/supabase/database.types';
import type { AuthUser } from '../types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const DEFAULT_ROLE: AppRole = 'user';

const displayNameFromUser = (user: User, profile: ProfileRow | null) => {
    const fromProfile = profile?.full_name?.trim();
    if (fromProfile) return fromProfile;

    const metaName =
        typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name.trim()
            : typeof user.user_metadata?.name === 'string'
              ? user.user_metadata.name.trim()
              : '';
    if (metaName) return metaName;

    const email = user.email ?? profile?.email ?? '';
    return email.split('@')[0] || 'User';
};

export const mapAuthUser = (
    user: User,
    profile: ProfileRow | null,
): AuthUser => {
    const email = (profile?.email || user.email || '').trim();

    return {
        id: user.id,
        email,
        name: displayNameFromUser(user, profile),
        avatarUrl: profile?.avatar_url ?? null,
        role: profile?.role ?? DEFAULT_ROLE,
    };
};
