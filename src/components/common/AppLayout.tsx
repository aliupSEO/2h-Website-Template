import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
export const AppLayout = () => {
    const user = useAuthStore((state) => state.user);
    if (!user) {
        return <Navigate to="/auth/sign-in" replace/>;
    }
    return (<div className="flex h-svh overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-auto bg-muted p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>);
};
