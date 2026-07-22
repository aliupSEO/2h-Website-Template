import { Lock, Unlock } from 'lucide-react';
import { Badge } from '@/components/ui';

type RepoVisibilityBadgeProps = {
    isPrivate: boolean;
};

export const RepoVisibilityBadge = ({ isPrivate }: RepoVisibilityBadgeProps) => {
    if (isPrivate) {
        return (
            <Badge className="inline-flex items-center gap-1 rounded-md border-0 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30">
                <Lock className="size-3" />
                Private
            </Badge>
        );
    }

    return (
        <Badge className="inline-flex items-center gap-1 rounded-md border-0 bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            <Unlock className="size-3" />
            Public
        </Badge>
    );
};
