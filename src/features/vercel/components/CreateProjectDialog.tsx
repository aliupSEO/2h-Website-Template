import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
    createProjectSchema,
    VERCEL_FRAMEWORKS,
    type CreateProjectSchema,
} from '@/features/vercel/schemas';
import type { GitRepo } from '@/features/git/types';
import { githubService } from '@/services/githubService';

type CreateProjectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateProjectSchema) => Promise<void>;
};

export const CreateProjectDialog = ({
    open,
    onOpenChange,
    onSubmit,
}: CreateProjectDialogProps) => {
    const [repos, setRepos] = useState<GitRepo[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [reposError, setReposError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateProjectSchema>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: '',
            framework: 'vite',
            gitRepository: '',
        },
    });

    useEffect(() => {
        if (!open) {
            reset();
            return;
        }

        let active = true;
        const loadRepos = async () => {
            setLoadingRepos(true);
            setReposError(null);
            try {
                const result = await githubService.listRepos(1, 100);
                if (!active) return;
                setRepos(result.repos);
            }
            catch (error) {
                if (!active) return;
                setReposError(
                    error instanceof Error
                        ? error.message
                        : 'Could not load GitHub repositories',
                );
            }
            finally {
                if (active) setLoadingRepos(false);
            }
        };

        void loadRepos();
        return () => {
            active = false;
        };
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
                    <DialogTitle>Import from GitHub</DialogTitle>
                    <DialogDescription>
                        Create a Vercel project linked to a GitHub repository.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <FormField
                        label="GitHub repository"
                        htmlFor="vercel-git-repo"
                        required
                        error={errors.gitRepository?.message ?? reposError ?? undefined}
                    >
                        {loadingRepos ? (
                            <div className="flex h-10 items-center">
                                <Loading size="sm" label="Loading repos…" />
                            </div>
                        ) : (
                            <Controller
                                control={control}
                                name="gitRepository"
                                render={({ field }) => (
                                    <Select
                                        value={field.value || undefined}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            const repo = repos.find(
                                                (item) => item.fullName === value,
                                            );
                                            if (repo) {
                                                setValue('name', repo.name, {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger
                                            id="vercel-git-repo"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Select a repository" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {repos.map((repo) => (
                                                <SelectItem
                                                    key={repo.id}
                                                    value={repo.fullName}
                                                >
                                                    {repo.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        )}
                    </FormField>

                    <FormField
                        label="Project name"
                        htmlFor="vercel-project-name"
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            id="vercel-project-name"
                            placeholder="my-app"
                            className="h-10"
                            aria-invalid={Boolean(errors.name)}
                            {...register('name')}
                        />
                    </FormField>

                    <FormField
                        label="Framework"
                        htmlFor="vercel-project-framework"
                        error={errors.framework?.message}
                    >
                        <Controller
                            control={control}
                            name="framework"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        id="vercel-project-framework"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select a framework" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VERCEL_FRAMEWORKS.map((framework) => (
                                            <SelectItem
                                                key={framework.value}
                                                value={framework.value}
                                            >
                                                {framework.label}
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
                            {isSubmitting ? <Loading size="sm" /> : 'Import project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
