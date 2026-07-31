import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
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
    Textarea,
} from '@/components/ui';
import {
    importEnvSchema,
    type ImportEnvSchema,
} from '@/features/env/schemas';

type ImportEnvDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (content: string) => Promise<void>;
};

export const ImportEnvDialog = ({
    open,
    onOpenChange,
    onImport,
}: ImportEnvDialogProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ImportEnvSchema>({
        resolver: zodResolver(importEnvSchema),
        defaultValues: { content: '' },
    });

    useEffect(() => {
        if (!open) {
            reset({ content: '' });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [open, reset]);

    const submit = handleSubmit(async (values) => {
        await onImport(values.content);
        onOpenChange(false);
    });

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        const text = await file.text();
        setValue('content', text, { shouldValidate: true });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Import .env</DialogTitle>
                    <DialogDescription>
                        Paste KEY=value lines or upload a .env file. Existing
                        keys are updated; invalid lines are skipped.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => void submit(event)}
                    noValidate
                >
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".env,text/plain"
                            className="sr-only"
                            onChange={(event) => {
                                void handleFile(event.target.files?.[0]);
                            }}
                        />
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Choose file
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Or paste below
                        </span>
                    </div>

                    <FormField
                        label="Contents"
                        htmlFor="env-import-content"
                        required
                        error={errors.content?.message}
                    >
                        <Textarea
                            id="env-import-content"
                            rows={10}
                            placeholder={'API_KEY=...\nDATABASE_URL=...'}
                            className="min-h-48 resize-y font-mono text-sm"
                            {...register('content')}
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
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loading size="sm" /> : 'Import'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
