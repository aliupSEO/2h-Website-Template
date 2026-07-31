import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Loading } from '@/components/common';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FormField,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import {
    roleOptionsForActor,
    inviteUserSchema,
    type InviteUserSchema,
} from '@/features/admin/schemas';
import type { AppRole } from '@/constants/roles';

type InviteUserDialogProps = {
    open: boolean;
    actorRole: AppRole;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: InviteUserSchema) => Promise<void>;
};

export const InviteUserDialog = ({
    open,
    actorRole,
    onOpenChange,
    onSubmit,
}: InviteUserDialogProps) => {
    const roleOptions = roleOptionsForActor(actorRole);
    const defaultRole = roleOptions[0]?.value ?? 'user';

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<InviteUserSchema>({
        resolver: zodResolver(inviteUserSchema),
        defaultValues: {
            fullName: '',
            email: '',
            role: defaultRole,
        },
    });

    useEffect(() => {
        if (!open) {
            reset({
                fullName: '',
                email: '',
                role: defaultRole,
            });
        }
    }, [open, reset, defaultRole]);

    const submit = handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
        reset();
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite user</DialogTitle>
                    <DialogDescription>
                        Send an invitation email so the user can accept and set
                        their password.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <FormField
                        label="Name"
                        htmlFor="invite-full-name"
                        required
                        error={errors.fullName?.message}
                    >
                        <Input
                            id="invite-full-name"
                            placeholder="Jane Doe"
                            className="h-10"
                            aria-invalid={Boolean(errors.fullName)}
                            {...register('fullName')}
                        />
                    </FormField>

                    <FormField
                        label="Email"
                        htmlFor="invite-email"
                        required
                        error={errors.email?.message}
                    >
                        <Input
                            id="invite-email"
                            type="email"
                            autoComplete="email"
                            placeholder="jane@example.com"
                            className="h-10"
                            aria-invalid={Boolean(errors.email)}
                            {...register('email')}
                        />
                    </FormField>

                    <FormField
                        label="Role"
                        htmlFor="invite-role"
                        required
                        error={errors.role?.message}
                    >
                        <Controller
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger id="invite-role" className="w-full">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="brand" disabled={isSubmitting}>
                            {isSubmitting ? <Loading size="sm" /> : 'Send invitation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
