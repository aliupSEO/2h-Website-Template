import { KeyRound, Mail, MoreHorizontal, Pencil } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui';
import type { AdminUser } from '@/features/admin/types';

type UserRowActionsProps = {
    user: AdminUser;
    isSelf: boolean;
    canModify: boolean;
    onEdit: (user: AdminUser) => void;
    onSetPassword: (user: AdminUser) => void;
    onSendReset: (user: AdminUser) => void;
};

export const UserRowActions = ({
    user,
    isSelf,
    canModify,
    onEdit,
    onSetPassword,
    onSendReset,
}: UserRowActionsProps) => {
    if (!canModify) return null;

    return (
        <TooltipProvider>
            <div className="flex items-center justify-end gap-0.5 transition-opacity">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            size="icon-sm"
                            variant="outline"
                            onClick={() => onEdit(user)}
                            aria-label={`Edit ${user.fullName || user.email}`}
                            className="border-white/10 bg-white/5 text-foreground hover:bg-primary hover:text-black hover:border-primary"
                        >
                            <Pencil className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Edit user</p>
                    </TooltipContent>
                </Tooltip>

                {!isSelf ? (
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            size="icon-sm"
                                            variant="outline"
                                            aria-label={`Actions for ${user.fullName || user.email}`}
                                            className="border-white/10 bg-white/5 text-foreground hover:bg-primary hover:text-black hover:border-primary"
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>More actions</p>
                            </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
                        >
                            <DropdownMenuItem
                                className="cursor-pointer gap-2"
                                onClick={() => onSetPassword(user)}
                            >
                                <KeyRound className="size-4" />
                                Set password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer gap-2"
                                onClick={() => onSendReset(user)}
                            >
                                <Mail className="size-4" />
                                Send reset link
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </div>
        </TooltipProvider>
    );
};
