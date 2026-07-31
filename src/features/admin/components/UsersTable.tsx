import { APP_ROLE_LABELS, canModifyTargetRole, type AppRole } from '@/constants/roles';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { AdminUser } from '@/features/admin/types';
import { AccountStatusBadge, AuthStatusBadge } from './UserStatusBadge';

type UsersTableProps = {
    users: AdminUser[];
    currentUserId: string | undefined;
    actorRole: AppRole;
    onEdit: (user: AdminUser) => void;
    onSetPassword: (user: AdminUser) => void;
    onSendReset: (user: AdminUser) => void;
};

const formatDate = (value: string | null) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

export const UsersTable = ({
    users,
    currentUserId,
    actorRole,
    onEdit,
    onSetPassword,
    onSendReset,
}: UsersTableProps) => {
    return (
        <div className="rounded-xl border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Auth</TableHead>
                        <TableHead>Last sign-in</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => {
                        const isSelf = user.id === currentUserId;
                        const canModify =
                            isSelf || canModifyTargetRole(actorRole, user.role);

                        return (
                            <TableRow key={user.id} className="border-white/5">
                                <TableCell className="font-medium">
                                    {user.fullName ?? '—'}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    {APP_ROLE_LABELS[user.role]}
                                </TableCell>
                                <TableCell>
                                    <AccountStatusBadge user={user} />
                                </TableCell>
                                <TableCell>
                                    <AuthStatusBadge user={user} />
                                </TableCell>
                                <TableCell>
                                    {formatDate(user.lastSignInAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {canModify ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEdit(user)}
                                            >
                                                Edit
                                            </Button>
                                        ) : null}
                                        {!isSelf && canModify ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        onSetPassword(user)
                                                    }
                                                >
                                                    Set password
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        onSendReset(user)
                                                    }
                                                >
                                                    Send reset
                                                </Button>
                                            </>
                                        ) : null}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
