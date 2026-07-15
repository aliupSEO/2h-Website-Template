import { AuthLayout } from '@/components/common';
import { ResetPasswordForm } from '@/features/auth';

export const ResetPasswordPage = () => {
    return (
        <AuthLayout
            title="Reset password"
            documentTitle="Reset Password"
            description="Choose a new password for your account."
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
};
