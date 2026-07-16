import { Badge } from '@/components/ui';

type RepoVisibilityBadgeProps = {
    isPrivate: boolean;
};

export const RepoVisibilityBadge = ({ isPrivate }: RepoVisibilityBadgeProps) => {
    return (
        <Badge variant={isPrivate ? 'secondary' : 'outline'}>
            {isPrivate ? 'Private' : 'Public'}
        </Badge>
    );
};
