import { AuthLayout } from '@/components/common'
import { ForgotPasswordForm } from '@/features/auth'

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot password"
      description="We will email you a link to reset your password."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
