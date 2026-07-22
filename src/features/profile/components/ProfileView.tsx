import { APP_ROLE_LABELS } from '@/constants/roles';
import { useAuthStore } from '@/stores/authStore';
import { splitDisplayName } from '../utils';
import { ProfileNameForm } from './ProfileNameForm';
import { ProfilePasswordForm } from './ProfilePasswordForm';
import { ProfilePhotoCard } from './ProfilePhotoCard';

export const ProfileView = () => {
    const user = useAuthStore((state) => state.user);
    const { firstName, lastName } = splitDisplayName(user?.name ?? '');

    return (
        <div className="space-y-6">
            <ProfilePhotoCard
                name={user?.name}
                email={user?.email}
                roleLabel={APP_ROLE_LABELS[user?.role ?? 'user']}
                avatarUrl={user?.avatarUrl}
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <ProfileNameForm
                    defaultFirstName={firstName}
                    defaultLastName={lastName}
                />
                <ProfilePasswordForm />
            </div>
        </div>
    );
};
