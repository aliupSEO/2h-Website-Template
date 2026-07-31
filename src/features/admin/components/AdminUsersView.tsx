import { useEffect, useMemo, useState } from 'react';
import {
    ConfirmModal,
    DocumentTitle,
    LoadingScreen,
} from '@/components/common';
import type {
    AdminSetPasswordSchema,
    EditUserSchema,
    InviteUserSchema,
} from '@/features/admin/schemas';
import type { AdminUser, UserStatusFilter } from '@/features/admin/types';
import { EditUserDialog } from './EditUserDialog';
import { InviteUserDialog } from './InviteUserDialog';
import { SetPasswordDialog } from './SetPasswordDialog';
import { UsersEmptyState } from './UsersEmptyState';
import { UsersTable } from './UsersTable';
import { UsersToolbar } from './UsersToolbar';
import { toast } from '@/lib/toast';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';

export const AdminUsersView = () => {
    const currentUser = useAuthStore((state) => state.user);
    const users = useAdminStore((state) => state.users);
    const loading = useAdminStore((state) => state.loading);
    const error = useAdminStore((state) => state.error);
    const fetchUsers = useAdminStore((state) => state.fetchUsers);
    const inviteUser = useAdminStore((state) => state.inviteUser);
    const updateUser = useAdminStore((state) => state.updateUser);
    const setUserPassword = useAdminStore((state) => state.setUserPassword);
    const sendPasswordReset = useAdminStore((state) => state.sendPasswordReset);

    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
    const [inviteOpen, setInviteOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
    const [resetUser, setResetUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        void fetchUsers().catch(() => undefined);
    }, [fetchUsers]);

    const counts = useMemo(() => ({
        all: users.length,
        active: users.filter((user) => user.isActive).length,
        inactive: users.filter((user) => !user.isActive).length,
        pending: users.filter((user) => !user.emailConfirmed).length,
        confirmed: users.filter((user) => user.emailConfirmed).length,
    }), [users]);

    const filteredUsers = useMemo(() => {
        const needle = query.trim().toLowerCase();

        return users.filter((user) => {
            if (statusFilter === 'active' && !user.isActive) return false;
            if (statusFilter === 'inactive' && user.isActive) return false;
            if (statusFilter === 'pending' && user.emailConfirmed) return false;
            if (statusFilter === 'confirmed' && !user.emailConfirmed) {
                return false;
            }

            if (!needle) return true;

            const haystack = [
                user.fullName ?? '',
                user.email,
                user.role,
                user.isActive ? 'active' : 'inactive',
                user.emailConfirmed ? 'confirmed' : 'pending',
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(needle);
        });
    }, [query, statusFilter, users]);

    const handleInvite = async (values: InviteUserSchema) => {
        try {
            const result = await inviteUser(values);
            toast.success(
                result.resent
                    ? 'Invitation resent'
                    : 'Invitation sent',
            );
        }
        catch (inviteError) {
            toast.error(
                inviteError instanceof Error
                    ? inviteError.message
                    : 'Could not send invitation',
            );
            throw inviteError;
        }
    };

    const handleEdit = async (user: AdminUser, values: EditUserSchema) => {
        try {
            await updateUser(user.id, values);
            toast.success('User updated');
        }
        catch (updateError) {
            toast.error(
                updateError instanceof Error
                    ? updateError.message
                    : 'Could not update user',
            );
            throw updateError;
        }
    };

    const handleSetPassword = async (
        user: AdminUser,
        values: AdminSetPasswordSchema,
    ) => {
        try {
            await setUserPassword(user.id, { password: values.password });
            toast.success('Password updated');
        }
        catch (passwordError) {
            toast.error(
                passwordError instanceof Error
                    ? passwordError.message
                    : 'Could not update password',
            );
            throw passwordError;
        }
    };

    const handleSendReset = async () => {
        if (!resetUser) return;
        try {
            await sendPasswordReset(resetUser.id);
            toast.success('Password reset email sent');
        }
        catch (resetError) {
            toast.error(
                resetError instanceof Error
                    ? resetError.message
                    : 'Could not send reset email',
            );
            throw resetError;
        }
    };

    if (loading && users.length === 0) {
        return <LoadingScreen label="Loading users…" />;
    }

    return (
        <>
            <DocumentTitle title="Admin" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Admin
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Invite users, manage roles, and control account access.
                    </p>
                </div>

                <UsersToolbar
                    query={query}
                    onQueryChange={setQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    counts={counts}
                    onInvite={() => setInviteOpen(true)}
                />

                {error && users.length === 0 ? (
                    <UsersEmptyState
                        title="Could not load users"
                        description={error}
                        actionLabel="Try again"
                        onAction={() => void fetchUsers()}
                    />
                ) : filteredUsers.length === 0 ? (
                    <UsersEmptyState
                        title="No users found"
                        description={
                            query || statusFilter !== 'all'
                                ? 'Try a different search or status filter.'
                                : 'Invite your first team member to get started.'
                        }
                        showInvite={!query && statusFilter === 'all'}
                        onInvite={() => setInviteOpen(true)}
                    />
                ) : (
                    <UsersTable
                        users={filteredUsers}
                        currentUserId={currentUser?.id}
                        actorRole={currentUser?.role ?? 'user'}
                        onEdit={setEditingUser}
                        onSetPassword={setPasswordUser}
                        onSendReset={setResetUser}
                    />
                )}
            </div>

            <InviteUserDialog
                open={inviteOpen}
                actorRole={currentUser?.role ?? 'user'}
                onOpenChange={setInviteOpen}
                onSubmit={handleInvite}
            />

            <EditUserDialog
                open={Boolean(editingUser)}
                user={editingUser}
                currentUserId={currentUser?.id}
                actorRole={currentUser?.role ?? 'user'}
                onOpenChange={(open) => {
                    if (!open) setEditingUser(null);
                }}
                onSubmit={handleEdit}
            />

            <SetPasswordDialog
                open={Boolean(passwordUser)}
                user={passwordUser}
                onOpenChange={(open) => {
                    if (!open) setPasswordUser(null);
                }}
                onSubmit={handleSetPassword}
            />

            <ConfirmModal
                open={Boolean(resetUser)}
                onOpenChange={(open) => {
                    if (!open) setResetUser(null);
                }}
                title="Send password reset?"
                description={
                    resetUser
                        ? `Email a reset link to ${resetUser.email}.`
                        : ''
                }
                confirmLabel="Send reset email"
                onConfirm={handleSendReset}
            />
        </>
    );
};
