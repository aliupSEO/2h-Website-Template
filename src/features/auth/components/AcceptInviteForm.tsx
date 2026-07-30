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

type InviteState = 'checking' | 'ready' | 'missing';

export const AcceptInviteForm = () => {
    const navigate = useNavigate();
    const [inviteState, setInviteState] = useState<InviteState>('checking');

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

        const checkInviteSession = async () => {
            try {
                const session = await authService.getSession();
                if (!active) return;
                setInviteState(session ? 'ready' : 'missing');
            }
            catch {
                if (!active) return;
                setInviteState('missing');
            }
        };

        void checkInviteSession();

        const subscription = authService.onAuthStateChange((session) => {
            if (!active) return;
            setInviteState(session ? 'ready' : 'missing');
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    const onSubmit = async (values: ResetPasswordSchema) => {
        try {
            await authService.updatePassword(values.password);
            toast.success('Account ready — welcome to 2H Central Hub');
            navigate('/dashboard', { replace: true });
        }
        catch (error) {
            toast.error(
                getAuthErrorMessage(
                    error instanceof Error ? error : null,
                    'Could not set password',
                ),
            );
        }
    };

    if (inviteState === 'checking') {
        return (
            <div className="flex justify-center py-6">
                <Loading size="md" label="Checking invitation…" />
            </div>
        );
    }

    if (inviteState === 'missing') {
        return (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    This invitation link is invalid or has expired. Ask an admin
                    to resend your invitation.
                </p>
                <Button asChild variant="brand" size="lg" className="w-full">
                    <Link to="/auth/sign-in">Back to sign in</Link>
                </Button>
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
                label="Password"
                htmlFor="invite-password"
                required
                error={errors.password?.message}
            >
                <Input
                    id="invite-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-11 bg-[#2a2a2a] aria-invalid:bg-[#2a2a2a]"
                    aria-invalid={Boolean(errors.password)}
                    {...register('password')}
                />
            </FormField>

            <FormField
                label="Confirm password"
                htmlFor="invite-confirm-password"
                required
                error={errors.confirmPassword?.message}
            >
                <Input
                    id="invite-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-11 bg-[#2a2a2a] aria-invalid:bg-[#2a2a2a]"
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
                {isSubmitting ? <Loading size="sm" /> : 'Create account'}
            </Button>
        </form>
    );
};
