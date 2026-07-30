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
    ADMIN_ROLE_OPTIONS,
    editUserSchema,
    type EditUserSchema,
} from '@/features/admin/schemas';
import type { AdminUser } from '@/features/admin/types';

type EditUserDialogProps = {
    open: boolean;
    user: AdminUser | null;
    currentUserId: string | undefined;
    onOpenChange: (open: boolean) => void;
    onSubmit: (user: AdminUser, values: EditUserSchema) => Promise<void>;
};

export const EditUserDialog = ({
    open,
    user,
    currentUserId,
    onOpenChange,
    onSubmit,
}: EditUserDialogProps) => {
    const isSelf = user?.id === currentUserId;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EditUserSchema>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            fullName: '',
            role: 'user',
            isActive: true,
        },
    });

    useEffect(() => {
        if (!open || !user) return;
        reset({
            fullName: user.fullName ?? '',
            role: user.role,
            isActive: user.isActive,
        });
    }, [open, reset, user]);

    const submit = handleSubmit(async (values) => {
        if (!user) return;
        await onSubmit(user, values);
        onOpenChange(false);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit user</DialogTitle>
                    <DialogDescription>
                        Update role and account status for {user?.email}.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <FormField
                        label="Name"
                        htmlFor="edit-full-name"
                        required
                        error={errors.fullName?.message}
                    >
                        <Input
                            id="edit-full-name"
                            className="h-10"
                            aria-invalid={Boolean(errors.fullName)}
                            {...register('fullName')}
                        />
                    </FormField>

                    <FormField
                        label="Role"
                        htmlFor="edit-role"
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
                                    disabled={isSelf}
                                >
                                    <SelectTrigger id="edit-role" className="w-full">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ADMIN_ROLE_OPTIONS.map((option) => (
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

                    <FormField
                        label="Account status"
                        htmlFor="edit-active"
                        error={errors.isActive?.message}
                    >
                        <Controller
                            control={control}
                            name="isActive"
                            render={({ field }) => (
                                <Select
                                    value={field.value ? 'active' : 'inactive'}
                                    onValueChange={(value) =>
                                        field.onChange(value === 'active')
                                    }
                                    disabled={isSelf}
                                >
                                    <SelectTrigger id="edit-active" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
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
                            {isSubmitting ? <Loading size="sm" /> : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
