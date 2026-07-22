import { useNavigate } from 'react-router-dom';
import { DocumentTitle } from '@/components/common';
import { Button } from '@/components/ui';
import { ProfileView } from '@/features/profile';

export const ProfilePage = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full space-y-6">
            <DocumentTitle title="Profile" />

            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="font-heading text-2xl font-semibold tracking-tight">
                        Profile
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your photo, name, and password.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(-1)}
                >
                    Close
                </Button>
            </div>

            <ProfileView />
        </div>
    );
};
