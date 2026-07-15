import { useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import {
    Avatar,
    AvatarFallback,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui';
import { getAuthErrorMessage } from '@/features/auth/utils/authErrors';
import { toast } from '@/lib/toast';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

const getInitials = (name?: string, email?: string) => {
    const source = name?.trim() || email?.trim() || 'U';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
};

export const AppHeader = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const clearSession = useAuthStore((state) => state.clearSession);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await authService.signOut();
            clearSession();
            toast.success('Signed out');
            navigate('/auth/sign-in', { replace: true });
        }
        catch (error) {
            toast.error(
                getAuthErrorMessage(
                    error instanceof Error ? error : null,
                    'Could not sign out',
                ),
            );
        }
    };
    return (<>
      <header className="flex h-14 shrink-0 items-center justify-end border-0 bg-surface px-4 shadow-[0_28px_90px_rgba(0,0,0,0.75)] sm:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-0">
            <Avatar className="size-9 cursor-pointer ring-0">
              <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                {getInitials(user?.name, user?.email)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-xl border-0 bg-surface p-1.5 text-foreground shadow-[0_28px_90px_rgba(0,0,0,0.75)] ring-0">
            <div className="px-2.5 py-2">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name ?? 'Account'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? ''}
              </p>
            </div>

            <DropdownMenuItem className="mt-1 cursor-pointer gap-2 rounded-lg px-2.5 py-2 text-foreground focus:bg-white/10 focus:text-foreground" onClick={() => navigate('/profile')}>
              <UserRound className="size-4 text-foreground"/>
              Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-white/10"/>

            <DropdownMenuItem variant="destructive" className="cursor-pointer gap-2 rounded-lg px-2.5 py-2 text-destructive focus:bg-destructive/15 focus:text-destructive focus:[&_svg]:text-destructive data-[highlighted]:bg-destructive/15 data-[highlighted]:text-destructive data-[highlighted]:[&_svg]:text-destructive [&_svg]:text-destructive" onClick={() => setConfirmOpen(true)}>
              <LogOut className="size-4 text-destructive"/>
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
    </>);
};
