/** Hub usage roles — stored in `profiles.role` (Postgres enum `app_role`). */
export const APP_ROLES = ['admin', 'manager', 'user'] as const;
export type AppRole = (typeof APP_ROLES)[number];
export const APP_ROLE_LABELS: Record<AppRole, string> = {
    admin: 'Admin',
    manager: 'Manager',
    user: 'User',
};
export const isStaffRole = (role: AppRole) => {
    return role === 'admin' || role === 'manager';
};
export const canManageClients = (role: AppRole) => {
    return isStaffRole(role);
};
export const canDeleteClients = (role: AppRole) => {
    return role === 'admin';
};
export const canManageProfiles = (role: AppRole) => {
    return role === 'admin';
};
