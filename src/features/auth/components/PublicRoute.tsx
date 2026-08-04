import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

type PublicRouteProps = {
    /**
     * When true, signed-in users are redirected to the hub.
     * Set false for flows that may have a recovery session (e.g. reset password).
     */
    guestOnly?: boolean;
};

export const PublicRoute = ({ guestOnly = true }: PublicRouteProps) => {
    const status = useAuthStore((state) => state.status);
    const user = useAuthStore((state) => state.user);

    const location = useLocation();

    if (status === 'ready' && guestOnly && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div
            key={location.pathname}
            className="animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-3 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex min-h-svh w-full flex-col"
        >
            <Outlet />
        </div>
    );
};
