import { AuthLayout } from '@/components/common';
import { ForgotPasswordForm } from '@/features/auth';
export const ForgotPasswordPage = () => {
    return (<AuthLayout title="Forgot password" documentTitle="Forgot Password" description="We will email you a link to reset your password.">
      <ForgotPasswordForm />
    </AuthLayout>);
};
