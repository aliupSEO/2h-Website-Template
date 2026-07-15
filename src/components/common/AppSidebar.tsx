import { Link, NavLink } from 'react-router-dom'

import logo2h from '@/assets/logo-2h.png'
import { APP_NAV_ITEMS } from '@/constants/navigation'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col self-stretch border-0 bg-surface text-sidebar-foreground shadow-[0_28px_90px_rgba(0,0,0,0.75)]">
      <div className="flex justify-center px-3 py-4">
        <Link to="/dashboard" className="flex flex-col items-start gap-1">
          <img
            src={logo2h}
            alt="2H Web Solutions"
            className="h-9 w-auto max-w-full object-contain object-left"
          />
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
            Central Hub
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {APP_NAV_ITEMS.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
