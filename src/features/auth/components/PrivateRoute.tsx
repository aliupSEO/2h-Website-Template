import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const PrivateRoute = () => {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/auth/sign-in" replace />;
    }

    return <Outlet />;
};
