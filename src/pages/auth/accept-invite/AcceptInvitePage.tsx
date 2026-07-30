import { AuthLayout } from '@/components/common';
import { AcceptInviteForm } from '@/features/auth';

export const AcceptInvitePage = () => {
    return (
        <AuthLayout
            title="Accept invitation"
            documentTitle="Accept Invitation"
            description="Choose a password to activate your 2H Central Hub account."
        >
            <AcceptInviteForm />
        </AuthLayout>
    );
};
