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
        <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both overflow-hidden rounded-2xl bg-[#1a1a1a] ring-1 ring-white/[0.08] duration-500 [animation-delay:80ms] transition-[box-shadow,ring-color] hover:ring-primary/25 hover:shadow-[0_0_0_1px_rgba(198,245,50,0.08),0_20px_60px_rgba(0,0,0,0.35)]">
            <span
                aria-hidden
                className="block h-0.5 origin-left bg-gradient-to-r from-primary via-primary/50 to-transparent transition-transform duration-500"
            />

            <div className="relative border-b border-white/[0.06] px-6 py-6 transition-colors duration-300 hover:bg-white/[0.02] sm:px-8 sm:py-7">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 left-10 size-40 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 hover:opacity-100"
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
                <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both border-b border-white/[0.06] p-6 duration-500 [animation-delay:160ms] transition-colors hover:bg-white/[0.025] sm:p-8 lg:border-b-0">
                    <ProfileNameForm
                        defaultFirstName={firstName}
                        defaultLastName={lastName}
                    />
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both p-6 duration-500 [animation-delay:240ms] transition-colors hover:bg-white/[0.025] sm:p-8">
                    <ProfilePasswordForm />
                </div>
            </div>
        </div>
    );
};
