import type { AdminUser } from '@/features/admin/types';

export const AccountStatusBadge = ({ user }: { user: AdminUser }) => {
    return (
        <span
            className={
                user.isActive
                    ? 'inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'
                    : 'inline-flex rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive'
            }
        >
            {user.isActive ? 'Active' : 'Inactive'}
        </span>
    );
};

export const AuthStatusBadge = ({ user }: { user: AdminUser }) => {
    return (
        <span
            className={
                user.emailConfirmed
                    ? 'inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300'
                    : 'inline-flex rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300'
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
            <span className="inline-flex rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                Inactive
            </span>
        );
    }

    if (!user.emailConfirmed) {
        return (
            <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                Pending
            </span>
        );
    }

    return (
        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Active
        </span>
    );
};
