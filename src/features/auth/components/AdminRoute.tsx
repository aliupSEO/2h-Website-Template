import { Navigate, Outlet } from 'react-router-dom';
import { LoadingScreen } from '@/components/common';
import { canManageProfiles } from '@/constants/roles';
import { useAuthStore } from '@/stores/authStore';

export const AdminRoute = () => {
    const status = useAuthStore((state) => state.status);
    const user = useAuthStore((state) => state.user);

    if (status === 'bootstrapping') {
        return <LoadingScreen label="Loading…" />;
    }

    if (!user) {
        return <Navigate to="/auth/sign-in" replace />;
    }

    if (!canManageProfiles(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
