import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Loading } from '@/components/common';
import { Button, FormField, Input } from '@/components/ui';
import { getAuthErrorMessage } from '@/features/auth/utils/authErrors';
import { toast } from '@/lib/toast';
import { authService } from '@/services/authService';
import {
    resetPasswordSchema,
    type ResetPasswordSchema,
} from '../schemas';

type RecoveryState = 'checking' | 'ready' | 'missing';

export const ResetPasswordForm = () => {
    const navigate = useNavigate();
    const [recoveryState, setRecoveryState] = useState<RecoveryState>('checking');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        let active = true;

        const checkRecoverySession = async () => {
            try {
                const session = await authService.getSession();
                if (!active) return;
                setRecoveryState(session ? 'ready' : 'missing');
            }
            catch {
                if (!active) return;
                setRecoveryState('missing');
            }
        };

        void checkRecoverySession();

        const subscription = authService.onAuthStateChange((session) => {
            if (!active) return;
            setRecoveryState(session ? 'ready' : 'missing');
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    const onSubmit = async (values: ResetPasswordSchema) => {
        try {
            await authService.updatePassword(values.password);
            toast.success('Password updated');
            navigate('/dashboard', { replace: true });
        }
        catch (error) {
            toast.error(
                getAuthErrorMessage(
                    error instanceof Error ? error : null,
                    'Could not update password',
                ),
            );
        }
    };

    if (recoveryState === 'checking') {
        return (
            <div className="flex justify-center py-6">
                <Loading size="md" label="Checking reset link…" />
            </div>
        );
    }

    if (recoveryState === 'missing') {
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    This reset link is invalid or has expired. Request a new
                    one from the forgot password page.
                </p>
                <Button asChild variant="brand" size="lg" className="w-full">
                    <Link to="/auth/forgot-password">Request new link</Link>
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        to="/auth/sign-in"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        Back to sign in
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <form
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <FormField
                label="New password"
                htmlFor="reset-password"
                required
                error={errors.password?.message}
            >
                <Input
                    id="reset-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-10"
                    aria-invalid={Boolean(errors.password)}
                    {...register('password')}
                />
            </FormField>

            <FormField
                label="Confirm password"
                htmlFor="reset-confirm-password"
                required
                error={errors.confirmPassword?.message}
            >
                <Input
                    id="reset-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-10"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    {...register('confirmPassword')}
                />
            </FormField>

            <Button
                type="submit"
                variant="brand"
                size="lg"
                className="h-11 w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? <Loading size="sm" /> : 'Update password'}
            </Button>
        </form>
    );
};
