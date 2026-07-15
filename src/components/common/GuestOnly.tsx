import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
export const GuestOnly = () => {
    const user = useAuthStore((state) => state.user);
    if (user) {
        return <Navigate to="/dashboard" replace/>;
    }
    return <Outlet />;
};
