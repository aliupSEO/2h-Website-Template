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

const FIELD_CLASS = 'w-full h-11 rounded-md bg-[#2a2a2a] text-foreground border-transparent';

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
            <DialogContent className="gap-0 overflow-hidden rounded-xl border-0 bg-[#1a1a1a] p-0 sm:max-w-md">
                <DialogHeader className="space-y-1 border-b border-white/5 px-5 py-4 pr-12">
                    <DialogTitle className="text-lg">Set password</DialogTitle>
                    <DialogDescription>
                        Set a new password for {user?.email}. The user can sign
                        in immediately with this password.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4 px-5 py-4"
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
                            className={FIELD_CLASS}
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
                            className={FIELD_CLASS}
                            aria-invalid={Boolean(errors.confirmPassword)}
                            {...register('confirmPassword')}
                        />
                    </FormField>

                    <DialogFooter className="gap-2 border-t border-white/5 pt-4 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-md"
                            disabled={isSubmitting}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="brand" 
                            className="h-11 min-w-24 rounded-md"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loading size="sm" /> : 'Update password'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
