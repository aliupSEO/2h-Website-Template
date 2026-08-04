import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
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
    Textarea,
} from '@/components/ui';
import {
    importEnvSchema,
    type ImportEnvSchema,
} from '@/features/env/schemas';
import { cn } from '@/lib/utils';

const FIELD_CLASS = 'w-full h-11 rounded-md bg-[#2a2a2a] text-foreground border-transparent';

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
            <DialogContent className="gap-0 overflow-hidden rounded-xl border-0 bg-[#1a1a1a] p-0 sm:max-w-lg">
                <DialogHeader className="space-y-1 border-b border-white/5 px-5 py-4 pr-12">
                    <DialogTitle className="text-lg">Import .env</DialogTitle>
                    <DialogDescription>
                        Paste KEY=value lines or upload a .env file. Existing
                        keys are updated; invalid lines are skipped.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4 px-5 py-4"
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
                            variant="outline"
                            className="h-10 rounded-md bg-[#2a2a2a] border-transparent"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Choose file
                        </Button>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
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
                            className={cn("min-h-48 resize-y py-3 font-mono text-sm", FIELD_CLASS)}
                            aria-invalid={Boolean(errors.content)}
                            {...register('content')}
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
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : 'Import'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
