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
    updateRepoSchema,
    type UpdateRepoSchema,
} from '@/features/git/schemas';
import type { GitRepo } from '@/features/git/types';

type EditRepoDialogProps = {
    repo: GitRepo | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (repo: GitRepo, values: UpdateRepoSchema) => Promise<void>;
};

export const EditRepoDialog = ({
    repo,
    onOpenChange,
    onSubmit,
}: EditRepoDialogProps) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<UpdateRepoSchema>({
        resolver: zodResolver(updateRepoSchema),
        defaultValues: {
            name: '',
            description: '',
            private: true,
        },
    });

    const isPrivate = watch('private');

    useEffect(() => {
        if (!repo) return;
        reset({
            name: repo.name,
            description: repo.description ?? '',
            private: repo.private,
        });
    }, [repo, reset]);

    const submit = handleSubmit(async (values) => {
        if (!repo) return;
        await onSubmit(repo, values);
        onOpenChange(false);
    });

    return (
        <Dialog open={Boolean(repo)} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit repository</DialogTitle>
                    <DialogDescription>
                        {repo ? `Update ${repo.fullName} on GitHub.` : ''}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
                    <FormField
                        label="Name"
                        htmlFor="edit-repo-name"
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            id="edit-repo-name"
                            className="h-10"
                            aria-invalid={Boolean(errors.name)}
                            {...register('name')}
                        />
                    </FormField>

                    <FormField
                        label="Description"
                        htmlFor="edit-repo-description"
                        error={errors.description?.message}
                    >
                        <Textarea
                            id="edit-repo-description"
                            rows={3}
                            aria-invalid={Boolean(errors.description)}
                            {...register('description')}
                        />
                    </FormField>

                    <FormField label="Visibility" htmlFor="edit-repo-visibility">
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
