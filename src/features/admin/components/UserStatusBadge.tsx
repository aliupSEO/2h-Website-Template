import type { AdminUser } from '@/features/admin/types';

export const AccountStatusBadge = ({ 
    user, 
    isActive, 
    variant = 'solid' 
}: { 
    user?: AdminUser; 
    isActive?: boolean;
    variant?: 'solid' | 'ghost';
}) => {
    const active = isActive ?? user?.isActive ?? false;

    if (variant === 'ghost') {
        return (
            <span className={active ? 'text-sm font-medium text-primary' : 'text-sm font-medium text-destructive'}>
                {active ? 'Active' : 'Inactive'}
            </span>
        );
    }

    return (
        <span
            className={
                active
                    ? 'inline-flex h-6 items-center rounded bg-primary px-2.5 text-xs font-bold text-black'
                    : 'inline-flex h-6 items-center rounded bg-destructive px-2.5 text-xs font-bold text-white'
            }
        >
            {active ? 'Active' : 'Inactive'}
        </span>
    );
};

export const AuthStatusBadge = ({ user }: { user: AdminUser }) => {
    return (
        <span
            className={
                user.emailConfirmed
                    ? 'inline-flex h-6 items-center rounded bg-emerald-500 px-2.5 text-xs font-bold text-white'
                    : 'inline-flex h-6 items-center rounded bg-amber-400 px-2.5 text-xs font-bold text-black'
            }
        >
            {user.emailConfirmed ? 'Confirmed' : 'Pending'}
        </span>
    );
};

/** @deprecated use AccountStatusBadge + AuthStatusBadge */
export const UserStatusBadge = ({ user }: { user: AdminUser }) => {
    if (!user.isActive) {
        return (
            <span className="inline-flex h-6 items-center rounded bg-destructive px-2.5 text-xs font-bold text-white">
                Inactive
            </span>
        );
    }

    if (!user.emailConfirmed) {
        return (
            <span className="inline-flex h-6 items-center rounded bg-amber-400 px-2.5 text-xs font-bold text-black">
                Pending
            </span>
        );
    }

    return (
        <span className="inline-flex h-6 items-center rounded bg-primary px-2.5 text-xs font-bold text-black">
            Active
        </span>
    );
};
