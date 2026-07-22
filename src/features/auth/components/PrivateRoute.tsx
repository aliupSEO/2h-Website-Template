import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const PrivateRoute = () => {
    const status = useAuthStore((state) => state.status);
    const user = useAuthStore((state) => state.user);

    // After auth is ready, send guests to sign-in. While bootstrapping, keep the
    // shell/page visible so refresh does not flash a blank black screen.
    if (status === 'ready' && !user) {
        return <Navigate to="/auth/sign-in" replace />;
    }

    return <Outlet />;
};
