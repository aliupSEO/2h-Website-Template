import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DocumentTitle } from '@/components/common';
import { Button } from '@/components/ui';
import { ProfileView } from '@/features/profile';

export const ProfilePage = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full space-y-6">
            <DocumentTitle title="Profile" />

            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                        Profile
                    </h1>
                    <p className="mt-1.5 text-base text-foreground/50">
                        Manage your photo, name, and password.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0 gap-2 rounded-md px-4 text-sm ring-1 ring-white/12 hover:bg-white/[0.06]"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Button>
            </div>

            <ProfileView />
        </div>
    );
};
