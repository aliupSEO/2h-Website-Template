import { Crown, Shield, User, UserCog } from 'lucide-react';
import { APP_ROLE_LABELS, type AppRole } from '@/constants/roles';

type UserRoleBadgeProps = {
    role: AppRole;
    variant?: 'solid' | 'ghost';
};

export const UserRoleBadge = ({ role, variant = 'solid' }: UserRoleBadgeProps) => {
    const label = APP_ROLE_LABELS[role];
    let Icon = User;
    let colorClass = '';
    let ghostColorClass = '';

    switch (role) {
        case 'super_admin':
            Icon = Crown;
            colorClass = 'bg-purple-500 text-white';
            ghostColorClass = 'text-purple-400';
            break;
        case 'admin':
            Icon = Shield;
            colorClass = 'bg-blue-500 text-white';
            ghostColorClass = 'text-blue-400';
            break;
        case 'manager':
            Icon = UserCog;
            colorClass = 'bg-teal-500 text-white';
            ghostColorClass = 'text-teal-400';
            break;
        default:
            Icon = User;
            colorClass = 'bg-neutral-600 text-white';
            ghostColorClass = 'text-neutral-400';
            break;
    }

    if (variant === 'ghost') {
        return (
            <span className={`flex items-center gap-2 text-sm font-medium ${ghostColorClass}`}>
                <Icon className="size-4" />
                <span>{label}</span>
            </span>
        );
    }

    return (
        <span className={`inline-flex h-6 w-28 items-center gap-1.5 rounded px-2.5 text-xs font-bold ${colorClass}`}>
            <Icon className="size-3.5 shrink-0" />
            <span>{label}</span>
        </span>
    );
};
