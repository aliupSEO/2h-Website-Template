import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

type PublicRouteProps = {
    /**
     * When true, signed-in users are redirected to the hub.
     * Set false for flows that may have a recovery session (e.g. reset password).
     */
    guestOnly?: boolean;
};

export const PublicRoute = ({ guestOnly = true }: PublicRouteProps) => {
    const user = useAuthStore((state) => state.user);

    if (guestOnly && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
