import { create } from 'zustand';
export type AuthUser = {
    email: string;
    name: string;
};
type AuthState = {
    user: AuthUser | null;
    signIn: (email: string) => void;
    signOut: () => void;
};
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    signIn: (email) => set({
        user: {
            email,
            name: email.split('@')[0] || 'User',
        },
    }),
    signOut: () => set({ user: null }),
}));
