import { canModifyTargetRole, type AppRole } from '@/constants/roles';
import { cn } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { AdminUser } from '@/features/admin/types';
import { AccountStatusBadge, AuthStatusBadge } from './UserStatusBadge';
import { UserRoleBadge } from './UserRoleBadge';
import { UserRowActions } from './UserRowActions';

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

const headClass =
    'h-14 px-4 text-sm font-extrabold tracking-wide text-black uppercase sm:px-6';

export const UsersTable = ({
    users,
    currentUserId,
    actorRole,
    onEdit,
    onSetPassword,
    onSendReset,
}: UsersTableProps) => {
    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-muted shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-0 bg-primary hover:bg-primary">
                        <TableHead className={headClass}>Name</TableHead>
                        <TableHead className={headClass}>Email</TableHead>
                        <TableHead className={headClass}>Role</TableHead>
                        <TableHead className={headClass}>Account</TableHead>
                        <TableHead className={headClass}>Auth</TableHead>
                        <TableHead className={headClass}>Last sign-in</TableHead>
                        <TableHead className={cn(headClass, 'w-[7.5rem] text-right')}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => {
                        const isSelf = user.id === currentUserId;
                        const canModify =
                            isSelf || canModifyTargetRole(actorRole, user.role);

                        return (
                            <TableRow key={user.id} className="group/row border-white/5 hover:bg-white/[0.035]">
                                <TableCell className="px-4 py-3.5 font-medium sm:px-6">
                                    {user.fullName ?? '—'}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">{user.email}</TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <UserRoleBadge role={user.role} />
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <AccountStatusBadge user={user} />
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <AuthStatusBadge user={user} />
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    {formatDate(user.lastSignInAt)}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 text-right sm:px-6">
                                    <UserRowActions
                                        user={user}
                                        isSelf={isSelf}
                                        canModify={canModify}
                                        onEdit={onEdit}
                                        onSetPassword={onSetPassword}
                                        onSendReset={onSendReset}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
