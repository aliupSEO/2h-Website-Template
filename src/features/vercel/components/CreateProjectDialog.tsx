import { zodResolver } from '@hookform/resolvers/zod';
import { FolderGit2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ButtonSpinner } from '@/components/common';
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
import type { GitRepo } from '@/features/git/types';
import {
    createProjectSchema,
    type CreateProjectSchema,
} from '@/features/vercel/schemas';
import { githubService } from '@/services/githubService';
import { FrameworkPicker } from './FrameworkPicker';
import { GitRepoPicker } from './GitRepoPicker';

type CreateProjectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateProjectSchema) => Promise<void>;
};

const FIELD_CLASS = 'h-11 rounded-md bg-[#2a2a2a] text-foreground';

export const CreateProjectDialog = ({
    open,
    onOpenChange,
    onSubmit,
}: CreateProjectDialogProps) => {
    const [repos, setRepos] = useState<GitRepo[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [reposError, setReposError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

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
                setRepos([]);
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
    }, [open, reset, reloadKey]);

    const submit = handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
        reset();
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[min(90dvh,42rem)] w-full flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-[#1a1a1a] p-0 shadow-[0_28px_90px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.08] sm:max-w-lg">
                <div className="h-0.5 shrink-0 bg-primary" aria-hidden />

                <DialogHeader className="shrink-0 space-y-0 border-b border-white/5 px-5 py-4 pr-12">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                            <FolderGit2 className="size-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <DialogTitle className="font-heading text-lg">
                                Import from GitHub
                            </DialogTitle>
                            <DialogDescription className="text-sm leading-snug">
                                Link a repository to create a Vercel project.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form
                    className="flex min-h-0 flex-1 flex-col"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
                        <FormField
                            label="GitHub repository"
                            htmlFor="vercel-git-repo"
                            required
                            error={
                                errors.gitRepository?.message ??
                                reposError ??
                                undefined
                            }
                        >
                            {loadingRepos ? (
                                <div className="flex h-32 flex-col items-center justify-center gap-2.5 rounded-xl bg-[#111111] ring-1 ring-white/10">
                                    <ButtonSpinner className="size-5 text-primary" />
                                    <p className="text-sm text-muted-foreground">
                                        Loading repos…
                                    </p>
                                </div>
                            ) : reposError ? (
                                <div className="flex flex-col items-center gap-3 rounded-xl bg-[#111111] px-4 py-6 text-center ring-1 ring-white/10">
                                    <p className="max-w-xs text-sm text-muted-foreground">
                                        {reposError}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 gap-2 rounded-md ring-1 ring-white/12"
                                        onClick={() =>
                                            setReloadKey((value) => value + 1)
                                        }
                                    >
                                        <RefreshCw className="size-3.5" />
                                        Try again
                                    </Button>
                                </div>
                            ) : repos.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 rounded-xl bg-[#111111] px-4 py-6 text-center ring-1 ring-white/10">
                                    <FolderGit2 className="size-5 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        No repositories found on the linked
                                        GitHub account.
                                    </p>
                                </div>
                            ) : (
                                <Controller
                                    control={control}
                                    name="gitRepository"
                                    render={({ field }) => (
                                        <GitRepoPicker
                                            repos={repos}
                                            value={field.value}
                                            disabled={isSubmitting}
                                            onChange={(fullName, repo) => {
                                                field.onChange(fullName);
                                                setValue('name', repo.name, {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                });
                                            }}
                                        />
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
                                className={FIELD_CLASS}
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
                                    <FrameworkPicker
                                        id="vercel-project-framework"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </FormField>
                    </div>

                    <DialogFooter className="shrink-0 gap-2 border-t border-white/5 bg-[#1a1a1a] px-5 py-4 sm:justify-end">
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
                            className="h-11 min-w-[8.5rem] rounded-md"
                            disabled={
                                isSubmitting ||
                                loadingRepos ||
                                Boolean(reposError) ||
                                repos.length === 0
                            }
                        >
                            {isSubmitting ? (
                                <ButtonSpinner />
                            ) : (
                                'Import project'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
