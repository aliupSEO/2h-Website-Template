/** Hub usage roles — stored in `profiles.role` (Postgres enum `app_role`). */
export const APP_ROLES = ['super_admin', 'admin', 'manager', 'user'] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const APP_ROLE_LABELS: Record<AppRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    manager: 'Manager',
    user: 'User',
};

export const isStaffRole = (role: AppRole) => {
    return (
        role === 'super_admin' ||
        role === 'admin' ||
        role === 'manager'
    );
};

export const canManageClients = (role: AppRole) => {
    return isStaffRole(role);
};

export const canDeleteClients = (role: AppRole) => {
    return role === 'super_admin' || role === 'admin';
};

export const canManageProfiles = (role: AppRole) => {
    return role === 'super_admin' || role === 'admin';
};

export const canManageAdmins = (role: AppRole) => {
    return role === 'super_admin';
};

export const isElevatedAdminRole = (role: AppRole) => {
    return role === 'super_admin' || role === 'admin';
};

export const assignableRolesFor = (actor: AppRole): AppRole[] => {
    if (actor === 'super_admin') return [...APP_ROLES];
    if (actor === 'admin') return ['manager', 'user'];
    return [];
};

export const canModifyTargetRole = (
    actor: AppRole,
    targetRole: AppRole,
): boolean => {
    if (actor === 'super_admin') return true;
    if (actor === 'admin') {
        return targetRole === 'manager' || targetRole === 'user';
    }
    return false;
};

export const roleOptionsFor = (actor: AppRole) => {
    return assignableRolesFor(actor).map((role) => ({
        value: role,
        label: APP_ROLE_LABELS[role],
    }));
};
