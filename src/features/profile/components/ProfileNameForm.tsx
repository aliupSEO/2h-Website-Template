import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loading } from '@/components/common';
import { Button, FormField, Input } from '@/components/ui';
import { toast } from '@/lib/toast';
import { profileNameSchema, type ProfileNameSchema } from '../schemas';

const FIELD_CLASS =
    'h-12 rounded-md bg-[#111111] px-4 text-base text-foreground ring-1 ring-white/10 placeholder:text-foreground/35 aria-invalid:bg-[#111111]';

type ProfileNameFormProps = {
    defaultFirstName: string;
    defaultLastName: string;
};

export const ProfileNameForm = ({
    defaultFirstName,
    defaultLastName,
}: ProfileNameFormProps) => {
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

    const onSubmit = async (values: ProfileNameSchema) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        reset(values);
        toast.success('Name updated');
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
                    className="h-11 rounded-md px-6 text-sm"
                    disabled={isSubmitting || !isDirty}
                >
                    {isSubmitting ? <Loading size="sm" /> : 'Save name'}
                </Button>
            </div>
        </form>
    );
};
