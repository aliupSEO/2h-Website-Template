import { create } from 'zustand';
import type {
    AdminSetPasswordInput,
    AdminUser,
    InviteUserInput,
    UpdateUserInput,
} from '@/features/admin/types';
import { adminService } from '@/services/adminService';

type AdminStore = {
    users: AdminUser[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    inviteUser: (
        input: InviteUserInput,
    ) => Promise<{ user: AdminUser; resent: boolean }>;
    updateUser: (userId: string, input: UpdateUserInput) => Promise<AdminUser>;
    setUserPassword: (
        userId: string,
        input: AdminSetPasswordInput,
    ) => Promise<void>;
    sendPasswordReset: (userId: string) => Promise<void>;
};

export const useAdminStore = create<AdminStore>((set, get) => ({
    users: [],
    loading: false,
    error: null,

    fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
            const users = await adminService.listUsers();
            set({ users, loading: false });
        }
        catch (error) {
            set({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Could not load users',
            });
            throw error;
        }
    },

    inviteUser: async (input) => {
        const result = await adminService.inviteUser(input);
        const current = get().users;
        const without = current.filter((user) => user.id !== result.user.id);
        set({ users: [result.user, ...without], error: null });
        return result;
    },

    updateUser: async (userId, input) => {
        const user = await adminService.updateUser(userId, input);
        set({
            users: get().users.map((item) =>
                item.id === userId ? user : item,
            ),
            error: null,
        });
        return user;
    },

    setUserPassword: async (userId, input) => {
        await adminService.setUserPassword(userId, input);
    },

    sendPasswordReset: async (userId) => {
        await adminService.sendPasswordReset(userId);
    },
}));
