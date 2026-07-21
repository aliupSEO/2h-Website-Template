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
    createWebAppSchema,
    type CreateWebAppSchema,
} from '@/features/firebase/schemas';

type CreateWebAppDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateWebAppSchema) => Promise<void>;
};

export const CreateWebAppDialog = ({
    open,
    onOpenChange,
    onSubmit,
}: CreateWebAppDialogProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateWebAppSchema>({
        resolver: zodResolver(createWebAppSchema),
        defaultValues: { displayName: '' },
    });

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const submit = handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
        reset();
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create web app</DialogTitle>
                    <DialogDescription>
                        Registers a Firebase Web App and makes client config
                        available for copy into env files.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <FormField
                        label="Display name"
                        htmlFor="firebase-web-app-name"
                        required
                        error={errors.displayName?.message}
                    >
                        <Input
                            id="firebase-web-app-name"
                            {...register('displayName')}
                            placeholder="My web app"
                            className="h-10"
                        />
                    </FormField>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="brand"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loading size="sm" /> : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
