import { AuthLayout } from '@/components/common';
import { SignInForm } from '@/features/auth';
export const SignInPage = () => {
    return (<AuthLayout title="Sign in" documentTitle="Sign In" description="Enter your credentials to access the hub.">
      <SignInForm />
    </AuthLayout>);
};
