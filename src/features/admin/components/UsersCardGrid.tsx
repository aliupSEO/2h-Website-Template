import { canModifyTargetRole, type AppRole } from '@/constants/roles';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/features/admin/types';
import { AccountStatusBadge, AuthStatusBadge } from './UserStatusBadge';
import { UserRoleBadge } from './UserRoleBadge';
import { UserRowActions } from './UserRowActions';
import { ScrollReveal } from '@/components/common';

type UsersCardGridProps = {
    users: AdminUser[];
    currentUserId: string | undefined;
    actorRole: AppRole;
    onEdit: (user: AdminUser) => void;
    onSetPassword: (user: AdminUser) => void;
    onSendReset: (user: AdminUser) => void;
};

const formatDate = (value: string | null) => {
    if (!value) return 'Never signed in';
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

export const UsersCardGrid = ({
    users,
    currentUserId,
    actorRole,
    onEdit,
    onSetPassword,
    onSendReset,
}: UsersCardGridProps) => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user, index) => {
                const isSelf = user.id === currentUserId;
                const canModify = isSelf || canModifyTargetRole(actorRole, user.role);

                return (
                    <ScrollReveal key={user.id} delay={Math.min(index * 50, 500)}>
                        <article
                        className={cn(
                            'group/user relative flex h-full flex-col overflow-hidden rounded-3xl',
                            'bg-card ring-1 ring-white/[0.08]',
                            'transition-[box-shadow,ring-color,background-color] duration-300 ease-out',
                            'hover:bg-[#323232] hover:ring-primary/40',
                            'hover:shadow-[0_0_0_1px_rgba(198,245,50,0.1),0_12px_40px_rgba(0,0,0,0.45)]',
                            !user.isActive && 'opacity-70'
                        )}
                    >
                        <span
                            aria-hidden
                            className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover/user:scale-x-100"
                        />

                        <div className="relative flex flex-1 flex-col p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <AccountStatusBadge user={user} />
                                    <AuthStatusBadge user={user} />
                                </div>
                                <UserRowActions
                                    user={user}
                                    isSelf={isSelf}
                                    canModify={canModify}
                                    onEdit={onEdit}
                                    onSetPassword={onSetPassword}
                                    onSendReset={onSendReset}
                                />
                            </div>

                            <h3 className="mt-1 block truncate font-heading text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 ease-out group-hover/user:text-primary">
                                {user.fullName || 'No Name'}
                            </h3>

                            <div className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground/70">
                                <p className="truncate">{user.email}</p>
                            </div>

                            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-5">
                                <UserRoleBadge role={user.role} />
                                <span className="text-xs text-primary tabular-nums">
                                    {formatDate(user.lastSignInAt)}
                                </span>
                            </div>
                        </div>
                    </article>
                    </ScrollReveal>
                );
            })}
        </div>
    );
};
