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
    editUserSchema,
    type EditUserSchema,
} from '@/features/admin/schemas';
import type { AdminUser } from '@/features/admin/types';
import { APP_ROLE_LABELS, type AppRole } from '@/constants/roles';
import { UserRoleBadge } from './UserRoleBadge';
import { AccountStatusBadge } from './UserStatusBadge';

type EditUserDialogProps = {
    open: boolean;
    user: AdminUser | null;
    currentUserId: string | undefined;
    actorRole: AppRole;
    onOpenChange: (open: boolean) => void;
    onSubmit: (user: AdminUser, values: EditUserSchema) => Promise<void>;
};

const FIELD_CLASS = 'w-full h-11 rounded-md bg-[#2a2a2a] text-foreground border-transparent';

export const EditUserDialog = ({
    open,
    user,
    currentUserId,
    actorRole,
    onOpenChange,
    onSubmit,
}: EditUserDialogProps) => {
    const isSelf = user?.id === currentUserId;
    const roleOptions = roleOptionsForActor(actorRole);

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
            <DialogContent className="gap-0 overflow-hidden rounded-xl border-0 bg-[#1a1a1a] p-0 sm:max-w-md">
                <DialogHeader className="space-y-1 border-b border-white/5 px-5 py-4 pr-12">
                    <DialogTitle className="text-lg">Edit user</DialogTitle>
                    <DialogDescription>
                        Update role and account status for {user?.email}.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4 px-5 py-4"
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
                            className={FIELD_CLASS}
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
                                    <SelectTrigger id="edit-role" className={FIELD_CLASS}>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/10 bg-[#1a1a1a]">
                                        {roleOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="focus:bg-[#2a2a2a] focus:text-foreground"
                                            >
                                                <UserRoleBadge role={option.value as AppRole} variant="ghost" />
                                            </SelectItem>
                                        ))}
                                        {user &&
                                        !roleOptions.some(
                                            (option) =>
                                                option.value === user.role,
                                        ) ? (
                                            <SelectItem 
                                                value={user.role}
                                                className="focus:bg-[#2a2a2a] focus:text-foreground"
                                            >
                                                <UserRoleBadge role={user.role as AppRole} variant="ghost" />
                                            </SelectItem>
                                        ) : null}
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
                                    <SelectTrigger id="edit-active" className={FIELD_CLASS}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/10 bg-[#1a1a1a]">
                                        <SelectItem 
                                            value="active"
                                            className="focus:bg-[#2a2a2a] focus:text-foreground"
                                        >
                                            <AccountStatusBadge isActive={true} variant="ghost" />
                                        </SelectItem>
                                        <SelectItem 
                                            value="inactive"
                                            className="focus:bg-[#2a2a2a] focus:text-foreground"
                                        >
                                            <AccountStatusBadge isActive={false} variant="ghost" />
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
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
                            {isSubmitting ? <Loading size="sm" /> : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
