import { zodResolver } from '@hookform/resolvers/zod';
import { FileUp, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
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
import { formatFileSize } from '@/features/clients/utils';
import {
    PLUGIN_MAX_FILE_BYTES,
    pluginFormSchema,
    type PluginFormSchema,
} from '@/features/plugins/schemas';
import type { Plugin } from '@/features/plugins/types';

export type PluginSubmitValues = PluginFormSchema & {
    file?: File | null;
    removeFile?: boolean;
};

type PluginFormDialogProps = {
    open: boolean;
    plugin: Plugin | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: PluginSubmitValues) => Promise<void>;
};

export const PluginFormDialog = ({
    open,
    plugin,
    onOpenChange,
    onSubmit,
}: PluginFormDialogProps) => {
    const isEdit = Boolean(plugin);
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [removeExistingFile, setRemoveExistingFile] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PluginFormSchema>({
        resolver: zodResolver(pluginFormSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    useEffect(() => {
        if (!open) {
            reset();
            setSelectedFile(null);
            setRemoveExistingFile(false);
            setFileError(null);
            return;
        }

        if (plugin) {
            reset({
                name: plugin.name,
                description: plugin.description ?? '',
            });
        }
        else {
            reset({
                name: '',
                description: '',
            });
        }

        setSelectedFile(null);
        setRemoveExistingFile(false);
        setFileError(null);
    }, [open, plugin, reset]);

    const hasExistingFile =
        Boolean(plugin?.fileName) && !removeExistingFile && !selectedFile;
    const displayFileName = selectedFile?.name ?? plugin?.fileName ?? null;
    const displayFileSize = selectedFile?.size ?? plugin?.sizeBytes ?? null;

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        if (file.size > PLUGIN_MAX_FILE_BYTES) {
            setFileError('File must be 50 MB or smaller');
            return;
        }

        setSelectedFile(file);
        setRemoveExistingFile(false);
        setFileError(null);
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setFileError(null);
    };

    const removeCurrentFile = () => {
        setSelectedFile(null);
        setRemoveExistingFile(true);
        setFileError(null);
    };

    const submit = handleSubmit(async (values) => {
        if (!isEdit && !selectedFile) {
            setFileError('Upload a plugin file');
            return;
        }

        if (
            isEdit &&
            removeExistingFile &&
            !selectedFile
        ) {
            setFileError('Upload a replacement file or keep the current one');
            return;
        }

        await onSubmit({
            ...values,
            file: selectedFile,
            removeFile: removeExistingFile && !selectedFile,
        });
        onOpenChange(false);
        reset();
        setSelectedFile(null);
        setRemoveExistingFile(false);
        setFileError(null);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Edit plugin' : 'Create plugin'}
                    </DialogTitle>
                    <DialogDescription>
                        Add a name, optional description, and one private file
                        stored in secure Supabase storage.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <FormField
                        label="Name"
                        htmlFor="plugin-name"
                        required
                        error={errors.name?.message}
                    >
                        <Input
                            id="plugin-name"
                            placeholder="Analytics connector"
                            className="h-10"
                            aria-invalid={Boolean(errors.name)}
                            {...register('name')}
                        />
                    </FormField>

                    <FormField
                        label="Description"
                        htmlFor="plugin-description"
                        error={errors.description?.message}
                    >
                        <Textarea
                            id="plugin-description"
                            placeholder="What this plugin does…"
                            rows={3}
                            aria-invalid={Boolean(errors.description)}
                            {...register('description')}
                        />
                    </FormField>

                    <FormField
                        label="File"
                        htmlFor="plugin-file"
                        required={!isEdit}
                        error={fileError ?? undefined}
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs text-muted-foreground">
                                    One file per plugin. Max 50 MB.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => inputRef.current?.click()}
                                >
                                    <FileUp data-icon="inline-start" />
                                    {displayFileName ? 'Replace file' : 'Upload'}
                                </Button>
                                <input
                                    ref={inputRef}
                                    id="plugin-file"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {!displayFileName ? (
                                <p className="rounded-lg bg-muted/60 px-3 py-3 text-xs text-muted-foreground">
                                    No file uploaded.
                                </p>
                            ) : (
                                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm text-foreground">
                                            {displayFileName}
                                        </p>
                                        {displayFileSize != null ? (
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(displayFileSize)}
                                                {hasExistingFile ? ' · current file' : ''}
                                            </p>
                                        ) : null}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Remove ${displayFileName}`}
                                        onClick={() => {
                                            if (selectedFile) {
                                                clearSelectedFile();
                                                return;
                                            }

                                            removeCurrentFile();
                                        }}
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            )}
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
                        <Button
                            type="submit"
                            variant="brand"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loading size="sm" />
                            ) : isEdit ? (
                                'Save changes'
                            ) : (
                                'Create plugin'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
