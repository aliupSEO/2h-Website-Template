import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { Loading } from '@/components/common'
import { Button, FormField, Input, Separator } from '@/components/ui'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores/authStore'

import { signInSchema, type SignInSchema } from '../schemas'
import { GoogleSignInButton } from './GoogleSignInButton'

export function SignInForm() {
  const navigate = useNavigate()
  const signIn = useAuthStore((state) => state.signIn)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: SignInSchema) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      signIn(values.email.trim())
      toast.success('Signed in')
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('Could not sign in')
    }
  }

  return (
    <div className="space-y-6">
      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormField
          label="Email"
          htmlFor="sign-in-email"
          required
          error={errors.email?.message}
        >
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-10"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="sign-in-password"
          required
          error={errors.password?.message}
          action={
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <Input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-10"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="mt-1 h-11 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loading size="sm" /> : 'Sign in'}
        </Button>
      </form>

      <div className="relative flex items-center gap-3">
        <Separator className="flex-1 bg-white/10" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1 bg-white/10" />
      </div>

      <GoogleSignInButton />
    </div>
  )
}
