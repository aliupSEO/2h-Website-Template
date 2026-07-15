import { create } from 'zustand';
import type { AuthStatus, AuthUser } from '@/features/auth/types';

type AuthState = {
    status: AuthStatus;
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    setStatus: (status: AuthStatus) => void;
    clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    status: 'bootstrapping',
    user: null,
    setUser: (user) => set({ user }),
    setStatus: (status) => set({ status }),
    clearSession: () => set({ user: null }),
}));
