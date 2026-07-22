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
import { RepoVisibilityToggle } from './RepoVisibilityToggle';

type EditRepoDialogProps = {
    repo: GitRepo | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (repo: GitRepo, values: UpdateRepoSchema) => Promise<void>;
};

const FIELD_CLASS = 'h-11 rounded-md bg-[#2a2a2a] text-foreground';

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
            <DialogContent className="gap-0 overflow-hidden rounded-xl border-0 bg-[#1a1a1a] p-0 sm:max-w-md">
                <DialogHeader className="space-y-1 border-b border-white/5 px-5 py-4 pr-12">
                    <DialogTitle className="text-lg">
                        Edit repository
                    </DialogTitle>
                    <DialogDescription>
                        {repo ? `Update ${repo.fullName} on GitHub.` : ''}
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4 px-5 py-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <FormField
                        label="Name"
                        htmlFor="edit-repo-name"
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            id="edit-repo-name"
                            className={FIELD_CLASS}
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
                            className="min-h-[5.5rem] resize-none rounded-md bg-[#2a2a2a] text-foreground"
                            aria-invalid={Boolean(errors.description)}
                            {...register('description')}
                        />
                    </FormField>

                    <FormField
                        label="Visibility"
                        htmlFor="edit-repo-visibility"
                    >
                        <RepoVisibilityToggle
                            id="edit-repo-visibility"
                            isPrivate={Boolean(isPrivate)}
                            onChange={(next) =>
                                setValue('private', next, { shouldDirty: true })
                            }
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
                            className="h-11 min-w-28 rounded-md"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loading size="sm" />
                            ) : (
                                'Save changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
