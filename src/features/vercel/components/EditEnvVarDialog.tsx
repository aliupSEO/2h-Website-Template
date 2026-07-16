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
    updateEnvVarSchema,
    VERCEL_ENV_TARGETS,
    type UpdateEnvVarSchema,
} from '@/features/vercel/schemas';
import type { VercelEnvTarget, VercelEnvVar } from '@/features/vercel/types';
import { cn } from '@/lib/utils';

type EditEnvVarDialogProps = {
    envVar: VercelEnvVar | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (envVar: VercelEnvVar, values: UpdateEnvVarSchema) => Promise<void>;
};

export const EditEnvVarDialog = ({
    envVar,
    onOpenChange,
    onSubmit,
}: EditEnvVarDialogProps) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<UpdateEnvVarSchema>({
        resolver: zodResolver(updateEnvVarSchema),
        defaultValues: {
            key: '',
            value: '',
            targets: ['production'],
        },
    });

    const targets = watch('targets');

    useEffect(() => {
        if (!envVar) return;
        reset({
            key: envVar.key,
            value: envVar.value ?? '',
            targets: envVar.targets.length > 0 ? envVar.targets : ['production'],
        });
    }, [envVar, reset]);

    const toggleTarget = (target: VercelEnvTarget) => {
        const next = targets.includes(target)
            ? targets.filter((item) => item !== target)
            : [...targets, target];
        setValue('targets', next, { shouldDirty: true, shouldValidate: true });
    };

    const submit = handleSubmit(async (values) => {
        if (!envVar) return;
        await onSubmit(envVar, values);
        onOpenChange(false);
    });

    return (
        <Dialog open={Boolean(envVar)} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit environment variable</DialogTitle>
                    <DialogDescription>
                        {envVar ? `Update ${envVar.key} in Vercel.` : ''}
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={(event) => void submit(event)} noValidate>
                    <FormField
                        label="Key"
                        htmlFor="edit-env-key"
                        required
                        error={errors.key?.message}
                    >
                        <Input
                            id="edit-env-key"
                            className="h-10"
                            aria-invalid={Boolean(errors.key)}
                            {...register('key')}
                        />
                    </FormField>

                    <FormField
                        label="Value"
                        htmlFor="edit-env-value"
                        error={errors.value?.message}
                    >
                        <Input
                            id="edit-env-value"
                            placeholder={envVar?.configured ? 'Leave blank to keep current' : ''}
                            className="h-10"
                            aria-invalid={Boolean(errors.value)}
                            {...register('value')}
                        />
                    </FormField>

                    <FormField
                        label="Environments"
                        htmlFor="edit-env-targets"
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
                            {isSubmitting ? <Loading size="sm" /> : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
