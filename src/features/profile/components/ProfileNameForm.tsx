import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loading } from '@/components/common';
import { Button, FormField, Input } from '@/components/ui';
import { toast } from '@/lib/toast';
import { profileService } from '@/services/profileService';
import { useAuthStore } from '@/stores/authStore';
import { profileNameSchema, type ProfileNameSchema } from '../schemas';

const FIELD_CLASS =
    'h-12 rounded-md bg-field px-4 text-base text-foreground ring-1 ring-white/15 placeholder:text-foreground/40 transition-[box-shadow,ring-color,background-color] duration-200 hover:ring-primary/35 hover:bg-[#303030] aria-invalid:bg-field';

type ProfileNameFormProps = {
    defaultFirstName: string;
    defaultLastName: string;
};

export const ProfileNameForm = ({
    defaultFirstName,
    defaultLastName,
}: ProfileNameFormProps) => {
    const setUser = useAuthStore((state) => state.setUser);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileNameSchema>({
        resolver: zodResolver(profileNameSchema),
        defaultValues: {
            firstName: defaultFirstName,
            lastName: defaultLastName,
        },
    });

    useEffect(() => {
        reset({
            firstName: defaultFirstName,
            lastName: defaultLastName,
        });
    }, [defaultFirstName, defaultLastName, reset]);

    const onSubmit = async (values: ProfileNameSchema) => {
        try {
            const updated = await profileService.updateName(values);
            setUser(updated);
            reset(values);
            toast.success('Name updated');
        }
        catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Could not update name',
            );
            throw error;
        }
    };

    return (
        <form
            className="space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
        >
            <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                    Display name
                </h2>
                <p className="mt-1 text-sm text-foreground/50">
                    How your name appears across the hub.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label="First name"
                    htmlFor="profile-first-name"
                    required
                    error={errors.firstName?.message}
                >
                    <Input
                        id="profile-first-name"
                        autoComplete="given-name"
                        placeholder="First name"
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(errors.firstName)}
                        {...register('firstName')}
                    />
                </FormField>

                <FormField
                    label="Last name"
                    htmlFor="profile-last-name"
                    required
                    error={errors.lastName?.message}
                >
                    <Input
                        id="profile-last-name"
                        autoComplete="family-name"
                        placeholder="Last name"
                        className={FIELD_CLASS}
                        aria-invalid={Boolean(errors.lastName)}
                        {...register('lastName')}
                    />
                </FormField>
            </div>

            <div className="flex justify-end pt-1">
                <Button
                    type="submit"
                    variant="brand"
                    className="h-11 rounded-md px-6 text-sm transition-[transform,box-shadow,background-color] duration-200 hover:shadow-[0_0_24px_rgba(198,245,50,0.25)] hover:brightness-105 active:scale-[0.98]"
                    disabled={isSubmitting || !isDirty}
                >
                    {isSubmitting ? <Loading size="sm" /> : 'Save name'}
                </Button>
            </div>
        </form>
    );
};
