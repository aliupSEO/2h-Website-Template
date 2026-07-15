import { useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ConfirmModal } from '@/components/common/ConfirmModal'
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores/authStore'

function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.trim() || 'U'
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

export function AppHeader() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleSignOut() {
    signOut()
    toast.success('Signed out')
    navigate('/auth/sign-in', { replace: true })
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-end border-b border-border bg-background px-4 sm:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-0">
            <Avatar className="size-9 cursor-pointer ring-1 ring-white/20">
              <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                {getInitials(user?.name, user?.email)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-52 rounded-xl border border-white/20 bg-surface p-1.5 text-foreground shadow-[0_16px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
          >
            <div className="border-b border-white/10 px-2.5 py-2">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name ?? 'Account'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? ''}
              </p>
            </div>

            <DropdownMenuItem
              className="mt-1 cursor-pointer gap-2 rounded-lg px-2.5 py-2 text-foreground focus:bg-white/10 focus:text-foreground"
              onClick={() => navigate('/profile')}
            >
              <UserRound className="size-4 text-foreground" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-white/10" />

            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg px-2.5 py-2 text-destructive focus:bg-destructive/15 focus:text-destructive"
              onClick={() => setConfirmOpen(true)}
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Sign out?"
        description="You will need to sign in again to access the hub."
        confirmLabel="Sign out"
        variant="destructive"
        onConfirm={handleSignOut}
      />
    </>
  )
}
