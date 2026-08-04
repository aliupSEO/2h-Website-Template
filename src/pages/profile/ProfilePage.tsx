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

            <div className="flex animate-in fade-in slide-in-from-top-2 fill-mode-both duration-500 items-center justify-between gap-4">
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
                    className="group h-11 shrink-0 gap-2 rounded-md px-4 text-sm ring-1 ring-white/12 transition-[background-color,box-shadow,color] duration-200 hover:bg-primary hover:text-primary-foreground hover:ring-primary/35"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                    Back
                </Button>
            </div>

            <ProfileView />
        </div>
    );
};
