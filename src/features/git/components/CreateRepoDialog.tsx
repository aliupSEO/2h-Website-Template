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
    Textarea,
} from '@/components/ui';
import {
    createRepoSchema,
    type CreateRepoSchema,
} from '@/features/git/schemas';
import { cn } from '@/lib/utils';

type CreateRepoDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateRepoSchema) => Promise<void>;
};

export const CreateRepoDialog = ({
    open,
    onOpenChange,
    onSubmit,
}: CreateRepoDialogProps) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateRepoSchema>({
        resolver: zodResolver(createRepoSchema),
        defaultValues: {
            name: '',
            description: '',
            private: true,
            autoInit: true,
        },
    });

    const isPrivate = watch('private');

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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create repository</DialogTitle>
                    <DialogDescription>
                        Creates a new repository on your linked GitHub account.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
                    <FormField
                        label="Name"
                        htmlFor="repo-name"
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            id="repo-name"
                            placeholder="my-project"
                            className="h-10"
                            aria-invalid={Boolean(errors.name)}
                            {...register('name')}
                        />
                    </FormField>

                    <FormField
                        label="Description"
                        htmlFor="repo-description"
                        error={errors.description?.message}
                    >
                        <Textarea
                            id="repo-description"
                            placeholder="Short description"
                            rows={3}
                            aria-invalid={Boolean(errors.description)}
                            {...register('description')}
                        />
                    </FormField>

                    <FormField label="Visibility" htmlFor="repo-private-public">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={isPrivate ? 'brand' : 'outline'}
                                onClick={() => setValue('private', true, { shouldDirty: true })}
                            >
                                Private
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={!isPrivate ? 'brand' : 'outline'}
                                onClick={() => setValue('private', false, { shouldDirty: true })}
                            >
                                Public
                            </Button>
                        </div>
                    </FormField>

                    <label
                        className={cn(
                            'flex cursor-pointer items-center gap-2 text-sm text-muted-foreground',
                        )}
                    >
                        <input
                            type="checkbox"
                            className="size-4 rounded bg-muted accent-primary"
                            {...register('autoInit')}
                        />
                        Initialize with README
                    </label>

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
                            {isSubmitting ? <Loading size="sm" /> : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
