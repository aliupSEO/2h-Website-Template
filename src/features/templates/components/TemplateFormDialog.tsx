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
import { GitRepoPicker } from '@/features/vercel/components/GitRepoPicker';
import type { GitRepo } from '@/features/git/types';
import {
    TEMPLATE_CATEGORY_OPTIONS,
    templateSchema,
    type TemplateSchema,
} from '@/features/templates/schemas';
import type { Template } from '@/features/templates/types';
import { githubService } from '@/services/githubService';

type TemplateFormDialogProps = {
    open: boolean;
    template: Template | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: TemplateSchema) => Promise<void>;
};

export const TemplateFormDialog = ({
    open,
    template,
    onOpenChange,
    onSubmit,
}: TemplateFormDialogProps) => {
    const isEdit = Boolean(template);
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
    } = useForm<TemplateSchema>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: '',
            gitRepository: '',
            url: '',
            category: 'websites',
        },
    });

    useEffect(() => {
        if (!open) {
            reset();
            return;
        }

        if (template) {
            reset({
                name: template.name,
                gitRepository: template.gitRepository,
                url: template.url,
                category: template.category,
            });
        }
        else {
            reset({
                name: '',
                gitRepository: '',
                url: '',
                category: 'websites',
            });
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
    }, [open, reset, template]);

    const submit = handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
        reset();
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Edit template' : 'Create template'}
                    </DialogTitle>
                    <DialogDescription>
                        Link a GitHub repository, name the template, and choose
                        whether it is for websites or apps.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <FormField
                        label="Name"
                        htmlFor="template-name"
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            id="template-name"
                            placeholder="Marketing landing starter"
                            className="h-10"
                            aria-invalid={Boolean(errors.name)}
                            {...register('name')}
                        />
                    </FormField>

                    <FormField
                        label="Category"
                        htmlFor="template-category"
                        required
                        error={errors.category?.message}
                    >
                        <Controller
                            control={control}
                            name="category"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        id="template-category"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TEMPLATE_CATEGORY_OPTIONS.map(
                                            (option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </FormField>

                    <FormField
                        label="GitHub repository"
                        htmlFor="template-git-repo"
                        required
                        error={
                            errors.gitRepository?.message ??
                            reposError ??
                            undefined
                        }
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
                                    <GitRepoPicker
                                        repos={repos}
                                        value={field.value}
                                        onChange={(fullName, repo) => {
                                            field.onChange(fullName);
                                            setValue('url', repo.cloneUrl, {
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
                        label="URL"
                        htmlFor="template-url"
                        required
                        error={errors.url?.message}
                    >
                        <Input
                            id="template-url"
                            placeholder="https://github.com/owner/repo.git"
                            className="h-10"
                            aria-invalid={Boolean(errors.url)}
                            {...register('url')}
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
                            {isSubmitting ? (
                                <Loading size="sm" />
                            ) : isEdit ? (
                                'Save changes'
                            ) : (
                                'Create template'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
