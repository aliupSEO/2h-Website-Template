import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
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
    updateEnvVarSchema,
    upsertEnvVarSchema,
    type UpdateEnvVarSchema,
    type UpsertEnvVarSchema,
} from '@/features/env/schemas';
import type { HubEnvVar } from '@/features/env/types';
import { cn } from '@/lib/utils';

const FIELD_CLASS = 'w-full h-11 rounded-md bg-[#2a2a2a] text-foreground border-transparent';

type EnvVarFormDialogProps = {
    open: boolean;
    item: HubEnvVar | null;
    onOpenChange: (open: boolean) => void;
    onCreate: (values: UpsertEnvVarSchema) => Promise<void>;
    onUpdate: (item: HubEnvVar, values: UpdateEnvVarSchema) => Promise<void>;
};

export const EnvVarFormDialog = ({
    open,
    item,
    onOpenChange,
    onCreate,
    onUpdate,
}: EnvVarFormDialogProps) => {
    const isEdit = Boolean(item);

    const createForm = useForm<UpsertEnvVarSchema>({
        resolver: zodResolver(upsertEnvVarSchema),
        defaultValues: { key: '', value: '' },
    });

    const editForm = useForm<UpdateEnvVarSchema>({
        resolver: zodResolver(updateEnvVarSchema),
        defaultValues: { value: '' },
    });

    useEffect(() => {
        if (!open) {
            createForm.reset({ key: '', value: '' });
            editForm.reset({ value: '' });
            return;
        }

        if (item) {
            editForm.reset({ value: '' });
        }
        else {
            createForm.reset({ key: '', value: '' });
        }
    }, [open, item, createForm, editForm]);

    const submitCreate = createForm.handleSubmit(async (values) => {
        await onCreate(values);
        onOpenChange(false);
    });

    const submitEdit = editForm.handleSubmit(async (values) => {
        if (!item) return;
        await onUpdate(item, values);
        onOpenChange(false);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden rounded-xl border-0 bg-[#1a1a1a] p-0 sm:max-w-md">
                <DialogHeader className="space-y-1 border-b border-white/5 px-5 py-4 pr-12">
                    <DialogTitle className="text-lg">
                        {isEdit ? 'Update value' : 'Add variable'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? `Replace the encrypted value for ${item?.key}.`
                            : 'Keys and values are encrypted on the server. Values are never listed in plain text.'}
                    </DialogDescription>
                </DialogHeader>

                {isEdit ? (
                    <form
                        className="space-y-4 px-5 py-4"
                        onSubmit={(event) => void submitEdit(event)}
                        noValidate
                    >
                        <FormField label="Key" htmlFor="env-edit-key">
                            <Input
                                id="env-edit-key"
                                value={item?.key ?? ''}
                                disabled
                                className={cn("font-mono", FIELD_CLASS)}
                            />
                        </FormField>

                        <FormField
                            label="New value"
                            htmlFor="env-edit-value"
                            required
                            error={editForm.formState.errors.value?.message}
                        >
                            <Textarea
                                id="env-edit-value"
                                rows={4}
                                placeholder="Paste the new secret value"
                                className={cn("min-h-[5.5rem] resize-y py-3 font-mono text-sm", FIELD_CLASS)}
                                aria-invalid={Boolean(editForm.formState.errors.value)}
                                {...editForm.register('value')}
                            />
                        </FormField>

                        <DialogFooter className="gap-2 border-t border-white/5 pt-4 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 rounded-md"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="brand"
                                className="h-11 min-w-24 rounded-md"
                                disabled={editForm.formState.isSubmitting}
                            >
                                {editForm.formState.isSubmitting ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    'Save value'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <form
                        className="space-y-4 px-5 py-4"
                        onSubmit={(event) => void submitCreate(event)}
                        noValidate
                    >
                        <FormField
                            label="Key"
                            htmlFor="env-create-key"
                            required
                            error={createForm.formState.errors.key?.message}
                        >
                            <Input
                                id="env-create-key"
                                placeholder="API_SECRET"
                                className={cn("font-mono", FIELD_CLASS)}
                                aria-invalid={Boolean(createForm.formState.errors.key)}
                                {...createForm.register('key')}
                            />
                        </FormField>

                        <FormField
                            label="Value"
                            htmlFor="env-create-value"
                            required
                            error={createForm.formState.errors.value?.message}
                        >
                            <Textarea
                                id="env-create-value"
                                rows={4}
                                placeholder="Secret value"
                                className={cn("min-h-[5.5rem] resize-y py-3 font-mono text-sm", FIELD_CLASS)}
                                aria-invalid={Boolean(createForm.formState.errors.value)}
                                {...createForm.register('value')}
                            />
                        </FormField>

                        <DialogFooter className="gap-2 border-t border-white/5 pt-4 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 rounded-md"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="brand"
                                className="h-11 min-w-24 rounded-md"
                                disabled={createForm.formState.isSubmitting}
                            >
                                {createForm.formState.isSubmitting ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    'Add variable'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};
