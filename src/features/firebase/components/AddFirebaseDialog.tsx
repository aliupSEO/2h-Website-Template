import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import {
    addFirebaseSchema,
    type AddFirebaseSchema,
} from '@/features/firebase/schemas';
import type { FirebaseAvailableProject } from '@/features/firebase/types';

type AddFirebaseDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableProjects: FirebaseAvailableProject[];
    loadingAvailable: boolean;
    availableError: string | null;
    onLoadAvailable: () => Promise<void>;
    onSubmit: (values: AddFirebaseSchema) => Promise<void>;
};

export const AddFirebaseDialog = ({
    open,
    onOpenChange,
    availableProjects,
    loadingAvailable,
    availableError,
    onLoadAvailable,
    onSubmit,
}: AddFirebaseDialogProps) => {
    const {
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AddFirebaseSchema>({
        resolver: zodResolver(addFirebaseSchema),
        defaultValues: { projectId: '' },
    });

    useEffect(() => {
        if (!open) {
            reset();
            return;
        }
        void onLoadAvailable();
    }, [open, onLoadAvailable, reset]);

    const submit = handleSubmit(async (values) => {
        await onSubmit(values);
        onOpenChange(false);
        reset();
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Firebase to GCP project</DialogTitle>
                    <DialogDescription>
                        Select an existing Google Cloud project that does not
                        yet have Firebase enabled.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <FormField
                        label="GCP project"
                        htmlFor="firebase-gcp-project"
                        required
                        error={errors.projectId?.message}
                    >
                        {loadingAvailable ? (
                            <div className="flex justify-center py-6">
                                <Loading size="sm" label="Loading projects…" />
                            </div>
                        ) : availableError ? (
                            <p className="text-sm text-destructive">
                                {availableError}
                            </p>
                        ) : (
                            <Controller
                                name="projectId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || undefined}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="h-10 w-full">
                                            <SelectValue placeholder="Select a project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableProjects.map((project) => (
                                                <SelectItem
                                                    key={project.projectId}
                                                    value={project.projectId}
                                                >
                                                    {project.displayName} (
                                                    {project.projectId})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        )}
                    </FormField>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="brand"
                            disabled={isSubmitting || loadingAvailable}
                        >
                            {isSubmitting ? (
                                <Loading size="sm" />
                            ) : (
                                'Add Firebase'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
