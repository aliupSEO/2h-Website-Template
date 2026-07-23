import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

/** Shell for authenticated pages. Auth gating lives in `PrivateRoute`. */
export const AppLayout = () => {
    return (
        <div className="flex h-svh overflow-hidden bg-background">
            <AppSidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted">
                <AppHeader />
                <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-muted p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
