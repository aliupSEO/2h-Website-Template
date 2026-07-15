import { AuthLayout } from '@/components/common'
import { SignInForm } from '@/features/auth'

export function SignInPage() {
  return (
    <AuthLayout
      title="Sign in"
      description="Enter your credentials to access the hub."
    >
      <SignInForm />
    </AuthLayout>
  )
}
