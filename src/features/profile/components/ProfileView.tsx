import { APP_ROLE_LABELS } from '@/constants/roles';
import { useAuthStore } from '@/stores/authStore';
import { splitDisplayName } from '../utils';
import { ProfileIdentity } from './ProfileIdentity';
import { ProfileNameForm } from './ProfileNameForm';
import { ProfilePasswordForm } from './ProfilePasswordForm';

export const ProfileView = () => {
    const user = useAuthStore((state) => state.user);
    const { firstName, lastName } = splitDisplayName(user?.name ?? '');

    return (
        <div className="overflow-hidden rounded-2xl bg-[#1a1a1a] ring-1 ring-white/[0.08]">
            <span
                aria-hidden
                className="block h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent"
            />

            <div className="relative border-b border-white/[0.06] px-6 py-6 sm:px-8 sm:py-7">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 left-10 size-40 rounded-full bg-primary/10 blur-3xl"
                />
                <div className="relative">
                    <ProfileIdentity
                        name={user?.name}
                        email={user?.email}
                        roleLabel={APP_ROLE_LABELS[user?.role ?? 'user']}
                        avatarUrl={user?.avatarUrl}
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-white/[0.06]">
                <div className="border-b border-white/[0.06] p-6 sm:p-8 lg:border-b-0">
                    <ProfileNameForm
                        defaultFirstName={firstName}
                        defaultLastName={lastName}
                    />
                </div>
                <div className="p-6 sm:p-8">
                    <ProfilePasswordForm />
                </div>
            </div>
        </div>
    );
};
