import { useEffect, type ReactNode } from 'react';
import { InactiveAccountError } from '@/features/auth/utils/authErrors';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

type AuthBootstrapProps = {
    children: ReactNode;
};

export const AuthBootstrap = ({ children }: AuthBootstrapProps) => {
    const setUser = useAuthStore((state) => state.setUser);
    const setStatus = useAuthStore((state) => state.setStatus);
    const clearSession = useAuthStore((state) => state.clearSession);

    useEffect(() => {
        let active = true;

        const syncSession = async () => {
            try {
                const session = await authService.getSession();
                if (!active) return;

                try {
                    const user = await authService.resolveUserFromSession(session);
                    if (!active) return;
                    setUser(user);
                }
                catch (error) {
                    if (!active) return;
                    clearSession();
                    if (!(error instanceof InactiveAccountError)) {
                        console.warn('[auth] session sync failed', error);
                    }
                }
            }
            catch (error) {
                if (!active) return;
                clearSession();
                console.warn('[auth] getSession failed', error);
            }
            finally {
                if (active) setStatus('ready');
            }
        };

        void syncSession();

        const subscription = authService.onAuthStateChange(async (session) => {
            if (!active) return;

            try {
                const user = await authService.resolveUserFromSession(session);
                if (!active) return;
                setUser(user);
            }
            catch (error) {
                if (!active) return;
                clearSession();
                if (!(error instanceof InactiveAccountError)) {
                    console.warn('[auth] auth state sync failed', error);
                }
            }
            finally {
                if (active) setStatus('ready');
            }
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, [clearSession, setStatus, setUser]);

    return children;
};
