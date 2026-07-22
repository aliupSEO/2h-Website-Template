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
    profileNameSchema,
    type ProfileNameSchema,
} from '../schemas';

const FIELD_CLASS = 'h-10 bg-muted aria-invalid:bg-muted';

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
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Display name</CardTitle>
                <CardDescription>
                    Update how your name appears across the hub.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className="space-y-4"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                            label="First name"
                            htmlFor="profile-first-name"
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

                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            variant="brand"
                            disabled={isSubmitting || !isDirty}
                        >
                            {isSubmitting ? <Loading size="sm" /> : 'Save name'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
