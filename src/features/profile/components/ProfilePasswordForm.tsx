import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loading } from '@/components/common';
import { Button, FormField, Input } from '@/components/ui';
import { toast } from '@/lib/toast';
import {
    profilePasswordSchema,
    type ProfilePasswordSchema,
} from '../schemas';

const FIELD_CLASS =
    'h-12 rounded-md bg-field px-4 text-base text-foreground ring-1 ring-white/15 placeholder:text-foreground/40 transition-[box-shadow,ring-color,background-color] duration-200 hover:ring-primary/35 hover:bg-[#303030] aria-invalid:bg-field';

export const ProfilePasswordForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfilePasswordSchema>({
        resolver: zodResolver(profilePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (_values: ProfilePasswordSchema) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        reset();
        toast.success('Password updated');
    };

    return (
        <form
            className="space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                    Password
                </h2>
                <p className="mt-1 text-sm text-foreground/50">
                    Use at least 8 characters.
                </p>
            </div>

            <FormField
                label="Current password"
                htmlFor="profile-current-password"
                required
                error={errors.currentPassword?.message}
            >
                <Input
                    id="profile-current-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={FIELD_CLASS}
                    aria-invalid={Boolean(errors.currentPassword)}
                    {...register('currentPassword')}
                />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="New password"
                    htmlFor="profile-new-password"
                    required
                    error={errors.newPassword?.message}
                >
                    <Input
                        id="profile-new-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(errors.newPassword)}
                        {...register('newPassword')}
                    />
                </FormField>

                <FormField
                    label="Confirm password"
                    htmlFor="profile-confirm-password"
                    required
                    error={errors.confirmPassword?.message}
                >
                    <Input
                        id="profile-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(errors.confirmPassword)}
                        {...register('confirmPassword')}
                    />
                </FormField>
            </div>

            <div className="flex justify-end pt-1">
                <Button
                    type="submit"
                    variant="brand"
                    className="h-11 rounded-md px-6 text-sm transition-[transform,box-shadow,background-color] duration-200 hover:shadow-[0_0_24px_rgba(198,245,50,0.25)] hover:brightness-105 active:scale-[0.98]"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loading size="sm" /> : 'Update password'}
                </Button>
            </div>
        </form>
    );
};
