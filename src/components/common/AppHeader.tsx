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

    const initials = getInitials(user?.name, user?.email);
    const displayName = user?.name ?? 'Account';
    const displayEmail = user?.email ?? '';

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

    return (
        <>
            <header className="flex h-14 shrink-0 items-center justify-end border-0 bg-surface px-4 shadow-[0_28px_90px_rgba(0,0,0,0.75)] sm:px-6">
                <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-0">
                        <Avatar className="size-9 cursor-pointer ring-0">
                            <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={10}
                        className="w-64 rounded-2xl border-0 bg-[#1a1a1a] p-0 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] ring-0"
                    >
                        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                            <Avatar className="size-10 shrink-0 ring-0">
                                <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                                    {displayName}
                                </p>
                                {displayEmail ? (
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                        {displayEmail}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="mx-4 h-px bg-white/10" />

                        <div className="p-2">
                            <DropdownMenuItem
                                className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground focus:bg-white/10 focus:text-foreground"
                                onClick={() => navigate('/profile')}
                            >
                                <UserRound className="size-4 text-muted-foreground" />
                                Profile
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5 bg-white/10" />

                            <DropdownMenuItem
                                variant="destructive"
                                className="cursor-pointer gap-2.5 rounded-xl px-3 py-2.5 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive focus:[&_svg]:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive data-[highlighted]:[&_svg]:text-destructive [&_svg]:text-destructive"
                                onClick={() => setConfirmOpen(true)}
                            >
                                <LogOut className="size-4" />
                                Sign out
                            </DropdownMenuItem>
                        </div>
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
    );
};
