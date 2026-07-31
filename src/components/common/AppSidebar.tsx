import { Link, NavLink } from 'react-router-dom';
import logo2h from '@/assets/logo-2h.png';
import { APP_NAV_GROUPS } from '@/constants/navigation';
import { canManageProfiles } from '@/constants/roles';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
        'relative flex w-full items-center gap-3 px-4 py-3 text-[15px] font-medium transition-colors',
        isActive
            ? 'bg-primary font-semibold text-black'
            : 'text-foreground/60 hover:bg-white/[0.05] hover:text-foreground',
    );

export const AppSidebar = () => {
    const user = useAuthStore((state) => state.user);
    const navGroups = APP_NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
            if (item.to !== '/admin' && item.to !== '/env') return true;
            return user ? canManageProfiles(user.role) : false;
        }),
    })).filter((group) => group.items.length > 0);

    return (
        <aside className="flex h-full w-64 shrink-0 flex-col self-stretch border-0 bg-surface text-sidebar-foreground">
            <div className="shrink-0 border-b border-white/[0.06] px-4 py-5">
                <Link
                    to="/dashboard"
                    className="flex w-full flex-col items-start gap-1.5"
                >
                    <img
                        src={logo2h}
                        alt="2H Web Solutions"
                        className="h-9 w-auto max-w-full object-contain object-left"
                    />
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">
                        Central Hub
                    </span>
                </Link>
            </div>

            <nav
                className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-y-auto overscroll-contain py-4"
                aria-label="Main"
            >
                {navGroups.map((group) => (
                    <div key={group.label} className="w-full">
                        <p className="px-4 pb-2 text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                            {group.label}
                        </p>
                        <ul className="w-full">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.to} className="w-full">
                                        <NavLink
                                            to={item.to}
                                            className={navLinkClass}
                                        >
                                            <Icon
                                                className="size-5 shrink-0"
                                                aria-hidden
                                            />
                                            <span className="min-w-0 flex-1 truncate">
                                                {item.label}
                                            </span>
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
};
