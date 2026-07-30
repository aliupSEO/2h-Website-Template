import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
} from '@/components/ui';
import {
    adminSetPasswordSchema,
    type AdminSetPasswordSchema,
} from '@/features/admin/schemas';
import type { AdminUser } from '@/features/admin/types';

type SetPasswordDialogProps = {
    open: boolean;
    user: AdminUser | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (
        user: AdminUser,
        values: AdminSetPasswordSchema,
    ) => Promise<void>;
};

export const SetPasswordDialog = ({
    open,
    user,
    onOpenChange,
    onSubmit,
}: SetPasswordDialogProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AdminSetPasswordSchema>({
        resolver: zodResolver(adminSetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const submit = handleSubmit(async (values) => {
        if (!user) return;
        await onSubmit(user, values);
        onOpenChange(false);
        reset();
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Set password</DialogTitle>
                    <DialogDescription>
                        Set a new password for {user?.email}. The user can sign
                        in immediately with this password.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <FormField
                        label="New password"
                        htmlFor="admin-new-password"
                        required
                        error={errors.password?.message}
                    >
                        <Input
                            id="admin-new-password"
                            type="password"
                            autoComplete="new-password"
                            className="h-10"
                            aria-invalid={Boolean(errors.password)}
                            {...register('password')}
                        />
                    </FormField>

                    <FormField
                        label="Confirm password"
                        htmlFor="admin-confirm-password"
                        required
                        error={errors.confirmPassword?.message}
                    >
                        <Input
                            id="admin-confirm-password"
                            type="password"
                            autoComplete="new-password"
                            className="h-10"
                            aria-invalid={Boolean(errors.confirmPassword)}
                            {...register('confirmPassword')}
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
                            {isSubmitting ? <Loading size="sm" /> : 'Update password'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
