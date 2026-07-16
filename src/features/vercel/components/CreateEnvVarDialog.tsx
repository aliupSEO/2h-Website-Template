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
    createEnvVarSchema,
    VERCEL_ENV_TARGETS,
    type CreateEnvVarSchema,
} from '@/features/vercel/schemas';
import type { VercelEnvTarget } from '@/features/vercel/types';
import { cn } from '@/lib/utils';

type CreateEnvVarDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateEnvVarSchema) => Promise<void>;
};

export const CreateEnvVarDialog = ({
    open,
    onOpenChange,
    onSubmit,
}: CreateEnvVarDialogProps) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateEnvVarSchema>({
        resolver: zodResolver(createEnvVarSchema),
        defaultValues: {
            key: '',
            value: '',
            targets: ['production', 'preview'],
        },
    });

    const targets = watch('targets');

    useEffect(() => {
        if (!open) reset();
    }, [open, reset]);

    const toggleTarget = (target: VercelEnvTarget) => {
        const next = targets.includes(target)
            ? targets.filter((item) => item !== target)
            : [...targets, target];
        setValue('targets', next, { shouldDirty: true, shouldValidate: true });
    };

    const submit = handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
        reset();
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add environment variable</DialogTitle>
                    <DialogDescription>
                        Stored encrypted in Vercel for the selected environments.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
                    <FormField
                        label="Key"
                        htmlFor="env-key"
                        required
                        error={errors.key?.message}
                    >
                        <Input
                            id="env-key"
                            placeholder="API_URL"
                            className="h-10"
                            aria-invalid={Boolean(errors.key)}
                            {...register('key')}
                        />
                    </FormField>

                    <FormField
                        label="Value"
                        htmlFor="env-value"
                        required
                        error={errors.value?.message}
                    >
                        <Input
                            id="env-value"
                            placeholder="https://api.example.com"
                            className="h-10"
                            aria-invalid={Boolean(errors.value)}
                            {...register('value')}
                        />
                    </FormField>

                    <FormField
                        label="Environments"
                        htmlFor="env-targets"
                        required
                        error={errors.targets?.message}
                    >
                        <div className="flex flex-wrap gap-2">
                            {VERCEL_ENV_TARGETS.map((target) => {
                                const active = targets.includes(target.value);
                                return (
                                    <button
                                        key={target.value}
                                        type="button"
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-sm transition-colors',
                                            active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground',
                                        )}
                                        onClick={() => toggleTarget(target.value)}
                                    >
                                        {target.label}
                                    </button>
                                );
                            })}
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
                            {isSubmitting ? <Loading size="sm" /> : 'Add'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
