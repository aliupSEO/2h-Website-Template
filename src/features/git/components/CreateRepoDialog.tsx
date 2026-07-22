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
import { RepoVisibilityToggle } from './RepoVisibilityToggle';

type CreateRepoDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateRepoSchema) => Promise<void>;
};

const FIELD_CLASS = 'h-11 rounded-md bg-[#2a2a2a] text-foreground';

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
            <DialogContent className="gap-0 overflow-hidden rounded-xl border-0 bg-[#1a1a1a] p-0 sm:max-w-md">
                <DialogHeader className="space-y-1 border-b border-white/5 px-5 py-4 pr-12">
                    <DialogTitle className="text-lg">
                        Create repository
                    </DialogTitle>
                    <DialogDescription>
                        Creates a new repository on your linked GitHub account.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4 px-5 py-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <FormField
                        label="Name"
                        htmlFor="repo-name"
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            id="repo-name"
                            placeholder="my-project"
                            className={FIELD_CLASS}
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
                            className="min-h-[5.5rem] resize-none rounded-md bg-[#2a2a2a] text-foreground"
                            aria-invalid={Boolean(errors.description)}
                            {...register('description')}
                        />
                    </FormField>

                    <FormField label="Visibility" htmlFor="repo-visibility">
                        <RepoVisibilityToggle
                            id="repo-visibility"
                            isPrivate={Boolean(isPrivate)}
                            onChange={(next) =>
                                setValue('private', next, { shouldDirty: true })
                            }
                        />
                    </FormField>

                    <label
                        className={cn(
                            'flex cursor-pointer items-center gap-2.5 rounded-md bg-[#2a2a2a] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-[#323232]',
                        )}
                    >
                        <input
                            type="checkbox"
                            className="size-4 rounded-sm bg-[#2a2a2a] accent-primary"
                            {...register('autoInit')}
                        />
                        Initialize with README
                    </label>

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
                            {isSubmitting ? <Loading size="sm" /> : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
