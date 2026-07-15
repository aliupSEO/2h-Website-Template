import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Loading } from '@/components/common';
import { Button, FormField, Input } from '@/components/ui';
import { toast } from '@/lib/toast';
import { forgotPasswordSchema, type ForgotPasswordSchema, } from '../schemas';
export const ForgotPasswordForm = () => {
    const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });
    const onSubmit = async (values: ForgotPasswordSchema) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 400));
            setSubmittedEmail(values.email.trim());
            toast.success('Reset link sent');
        }
        catch {
            toast.error('Could not send reset link');
        }
    };
    if (submittedEmail) {
        return (<div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          If an account exists for{' '}
          <span className="font-medium text-foreground">{submittedEmail}</span>,
          you will receive a reset link shortly.
        </p>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link to="/auth/sign-in">Back to sign in</Link>
        </Button>
      </div>);
    }
    return (<form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Email" htmlFor="forgot-email" required error={errors.email?.message}>
        <Input id="forgot-email" type="email" autoComplete="email" placeholder="you@example.com" className="h-10" aria-invalid={Boolean(errors.email)} {...register('email')}/>
      </FormField>

      <Button type="submit" variant="brand" size="lg" className="h-11 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loading size="sm"/> : 'Send reset link'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Link to="/auth/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>);
};
