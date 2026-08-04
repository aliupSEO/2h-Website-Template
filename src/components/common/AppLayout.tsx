import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { LoadingScreen } from './LoadingScreen';

/** Shell for authenticated pages. Auth gating lives in `PrivateRoute`. */
export const AppLayout = () => {
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        setIsTransitioning(true);
        const timer = setTimeout(() => {
            setIsTransitioning(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <div className="flex h-svh overflow-hidden bg-background">
            <AppSidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-muted">
                <AppHeader />
                <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-muted p-4 sm:p-6">
                    {isTransitioning ? (
                        <div className="flex flex-1 flex-col items-center justify-center animate-in fade-in duration-300">
                            <LoadingScreen delayMs={0} variant="robot" />
                        </div>
                    ) : (
                        <div
                            key={location.pathname}
                            className="flex flex-1 flex-col animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-3 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        >
                            <Outlet />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
