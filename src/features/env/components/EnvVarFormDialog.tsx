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
    updateEnvVarSchema,
    upsertEnvVarSchema,
    type UpdateEnvVarSchema,
    type UpsertEnvVarSchema,
} from '@/features/env/schemas';
import type { HubEnvVar } from '@/features/env/types';

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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
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
                        className="space-y-4"
                        onSubmit={(event) => void submitEdit(event)}
                        noValidate
                    >
                        <FormField label="Key" htmlFor="env-edit-key">
                            <Input
                                id="env-edit-key"
                                value={item?.key ?? ''}
                                disabled
                                className="h-10 font-mono"
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
                                className="min-h-24 resize-y font-mono text-sm"
                                {...editForm.register('value')}
                            />
                        </FormField>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="brand"
                                disabled={editForm.formState.isSubmitting}
                            >
                                {editForm.formState.isSubmitting ? (
                                    <Loading size="sm" />
                                ) : (
                                    'Save value'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <form
                        className="space-y-4"
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
                                className="h-10 font-mono"
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
                                className="min-h-24 resize-y font-mono text-sm"
                                {...createForm.register('value')}
                            />
                        </FormField>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="brand"
                                disabled={createForm.formState.isSubmitting}
                            >
                                {createForm.formState.isSubmitting ? (
                                    <Loading size="sm" />
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
