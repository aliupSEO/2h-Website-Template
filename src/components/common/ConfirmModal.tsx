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
                className="gap-5 border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.75)] ring-0"
            >
                <DialogHeader>
                    <DialogTitle className="text-foreground">{title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="default"
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
                        size="default"
                        disabled={pending}
                        className="gap-2"
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
