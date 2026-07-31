import { useEffect, useRef, useState } from 'react';
import { Loading } from '@/components/common';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui';
import type { HubEnvVar } from '@/features/env/types';
import { toast } from '@/lib/toast';

type RevealEnvDialogProps = {
    open: boolean;
    item: HubEnvVar | null;
    onOpenChange: (open: boolean) => void;
    onReveal: (item: HubEnvVar) => Promise<{ key: string; value: string }>;
};

export const RevealEnvDialog = ({
    open,
    item,
    onOpenChange,
    onReveal,
}: RevealEnvDialogProps) => {
    const [value, setValue] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const itemRef = useRef(item);
    const onRevealRef = useRef(onReveal);
    const onOpenChangeRef = useRef(onOpenChange);
    itemRef.current = item;
    onRevealRef.current = onReveal;
    onOpenChangeRef.current = onOpenChange;
    const itemId = item?.id ?? null;

    useEffect(() => {
        const current = itemRef.current;
        if (!open || !itemId || !current || current.id !== itemId) {
            setValue(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setValue(null);

        void onRevealRef
            .current(current)
            .then((revealed) => {
                if (!cancelled) setValue(revealed.value);
            })
            .catch((error) => {
                if (cancelled) return;
                toast.error(
                    error instanceof Error
                        ? error.message
                        : 'Could not reveal value',
                );
                onOpenChangeRef.current(false);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, itemId]);

    const handleCopy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success('Copied');
        }
        catch {
            toast.error('Could not copy');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reveal value</DialogTitle>
                    <DialogDescription>
                        {item
                            ? `Decrypted value for ${item.key}. Close this dialog when finished.`
                            : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-24 rounded-lg bg-muted px-3 py-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loading size="sm" />
                        </div>
                    ) : (
                        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all font-mono text-sm">
                            {value ?? ''}
                        </pre>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        variant="brand"
                        disabled={!value || loading}
                        onClick={() => void handleCopy()}
                    >
                        Copy
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
