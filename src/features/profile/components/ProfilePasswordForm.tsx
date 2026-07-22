import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loading } from '@/components/common';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    FormField,
    Input,
} from '@/components/ui';
import { toast } from '@/lib/toast';
import {
    profilePasswordSchema,
    type ProfilePasswordSchema,
} from '../schemas';

const FIELD_CLASS = 'h-10 bg-muted aria-invalid:bg-muted';

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
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                    Reset your password. Use at least 8 characters.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className="space-y-4"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <FormField
                        label="Current password"
                        htmlFor="profile-current-password"
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

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            variant="brand"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loading size="sm" />
                            ) : (
                                'Update password'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
