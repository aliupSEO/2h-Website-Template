import {
  AppWindow,
  FileText,
  Flame,
  GitBranch,
  Globe,
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  Puzzle,
  Settings,
  Shield,
  Triangle,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

/** Sidebar links for the logged-in app shell. */
export const APP_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clients',
    to: '/clients',
    icon: Users,
  },
  {
    label: 'Apps',
    to: '/apps',
    icon: AppWindow,
  },
  {
    label: 'Websites',
    to: '/websites',
    icon: Globe,
  },
  {
    label: 'Plugins',
    to: '/plugins',
    icon: Puzzle,
  },
  {
    label: 'Templates',
    to: '/templates',
    icon: LayoutTemplate,
  },
  {
    label: 'Git',
    to: '/git',
    icon: GitBranch,
  },
  {
    label: 'Firebase',
    to: '/firebase',
    icon: Flame,
  },
  {
    label: 'Vercel',
    to: '/vercel',
    icon: Triangle,
  },
  {
    label: 'Env',
    to: '/env',
    icon: KeyRound,
  },
  {
    label: 'Invoices',
    to: '/invoices',
    icon: FileText,
  },
  {
    label: 'Admin Panel',
    to: '/admin',
    icon: Shield,
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: Settings,
  },
]
