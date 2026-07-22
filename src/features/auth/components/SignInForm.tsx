import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ButtonSpinner } from '@/components/common';
import { Button, FormField, Input, Separator } from '@/components/ui';
import {
    getAuthErrorMessage,
    InactiveAccountError,
} from '@/features/auth/utils/authErrors';
import { toast } from '@/lib/toast';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { signInSchema, type SignInSchema } from '../schemas';
import { GoogleSignInButton } from './GoogleSignInButton';

export const SignInForm = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

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
    });

    const onSubmit = async (values: SignInSchema) => {
        try {
            const user = await authService.signInWithPassword({
                email: values.email,
                password: values.password,
            });
            setUser(user);
            toast.success('Signed in');
            navigate('/dashboard', { replace: true });
        }
        catch (error) {
            if (error instanceof InactiveAccountError) {
                toast.error(error.message);
                return;
            }
            toast.error(
                getAuthErrorMessage(
                    error instanceof Error ? error : null,
                    'Could not sign in',
                ),
            );
        }
    };

    return (
        <div className="space-y-7">
            <form
                className="space-y-5"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                <FormField
                    label="Email"
                    htmlFor="sign-in-email"
                    error={errors.email?.message}
                >
                    <Input
                        id="sign-in-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="h-11 bg-[#2a2a2a] aria-invalid:bg-[#2a2a2a]"
                        aria-invalid={Boolean(errors.email)}
                        disabled={isSubmitting}
                        {...register('email')}
                    />
                </FormField>

                <FormField
                    label="Password"
                    htmlFor="sign-in-password"
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
                        className="h-11 bg-[#2a2a2a] aria-invalid:bg-[#2a2a2a]"
                        aria-invalid={Boolean(errors.password)}
                        disabled={isSubmitting}
                        {...register('password')}
                    />
                </FormField>

                <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    className="mt-2 h-11 w-full gap-2 font-semibold"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <ButtonSpinner />
                            Signing in…
                        </>
                    ) : (
                        'Sign in'
                    )}
                </Button>
            </form>

            <div className="relative flex items-center gap-3">
                <Separator className="flex-1 bg-white/10" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1 bg-white/10" />
            </div>

            <GoogleSignInButton disabled={isSubmitting} />
        </div>
    );
};
