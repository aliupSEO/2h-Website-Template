import { Lock, Unlock } from 'lucide-react';

type RepoVisibilityBadgeProps = {
    isPrivate: boolean;
};

export const RepoVisibilityBadge = ({ isPrivate }: RepoVisibilityBadgeProps) => {
    if (isPrivate) {
        return (
            <span className="inline-flex h-6 items-center gap-1 rounded bg-amber-400 px-2.5 text-xs font-bold text-black">
                <Lock className="size-3 text-black" />
                Private
            </span>
        );
    }

    return (
        <span className="inline-flex h-6 items-center gap-1 rounded bg-primary px-2.5 text-xs font-bold text-black">
            <Unlock className="size-3 text-black" />
            Public
        </span>
    );
};
