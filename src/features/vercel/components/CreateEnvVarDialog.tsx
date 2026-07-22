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

const FIELD_CLASS = 'h-11 rounded-md bg-[#2a2a2a] text-foreground';

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
            <DialogContent className="gap-0 overflow-hidden rounded-xl border-0 bg-[#1a1a1a] p-0 sm:max-w-md">
                <DialogHeader className="border-b border-white/5 px-5 py-4">
                    <DialogTitle>Add environment variable</DialogTitle>
                    <DialogDescription>
                        Stored encrypted in Vercel for the selected environments.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4 px-5 py-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <FormField
                        label="Key"
                        htmlFor="env-key"
                        required
                        error={errors.key?.message}
                    >
                        <Input
                            id="env-key"
                            placeholder="API_URL"
                            className={FIELD_CLASS}
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
                            className={FIELD_CLASS}
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
                        <div className="flex flex-wrap gap-2 rounded-md bg-[#111111] p-1 ring-1 ring-white/10">
                            {VERCEL_ENV_TARGETS.map((target) => {
                                const active = targets.includes(target.value);
                                return (
                                    <button
                                        key={target.value}
                                        type="button"
                                        className={cn(
                                            'rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-foreground/70 hover:text-foreground',
                                        )}
                                        onClick={() =>
                                            toggleTarget(target.value)
                                        }
                                    >
                                        {target.label}
                                    </button>
                                );
                            })}
                        </div>
                    </FormField>

                    <DialogFooter className="gap-2 border-t border-white/5 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11"
                            disabled={isSubmitting}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="brand"
                            className="h-11"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loading size="sm" /> : 'Add'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
