import { useState } from 'react';
import { ButtonSpinner } from '@/components/common/ButtonSpinner';
import { Button } from '@/components/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type ConfirmModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void | Promise<void>;
};

export const ConfirmModal = ({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    onConfirm,
}: ConfirmModalProps) => {
    const [pending, setPending] = useState(false);

    const handleConfirm = async () => {
        try {
            setPending(true);
            await onConfirm();
            onOpenChange(false);
        }
        finally {
            setPending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="gap-5 overflow-hidden rounded-xl border-0 bg-[#1a1a1a] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.75)] ring-0 sm:max-w-md"
            >
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg text-foreground">{title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-md"
                        disabled={pending}
                        onClick={() => onOpenChange(false)}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={
                            variant === 'destructive' ? 'destructive' : 'brand'
                        }
                        className="h-11 min-w-24 rounded-md gap-2"
                        disabled={pending}
                        onClick={() => void handleConfirm()}
                    >
                        {pending ? (
                            <>
                                <ButtonSpinner />
                                {confirmLabel}
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
