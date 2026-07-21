import { useState } from 'react';
import { Loading } from '@/components/common';
import { Button } from '@/components/ui';

type ServicesPanelProps = {
    onEnableFirestore: () => Promise<void>;
    onEnableStorage: () => Promise<void>;
};

export const ServicesPanel = ({
    onEnableFirestore,
    onEnableStorage,
}: ServicesPanelProps) => {
    const [enablingFirestore, setEnablingFirestore] = useState(false);
    const [enablingStorage, setEnablingStorage] = useState(false);

    const runFirestore = async () => {
        setEnablingFirestore(true);
        try {
            await onEnableFirestore();
        }
        finally {
            setEnablingFirestore(false);
        }
    };

    const runStorage = async () => {
        setEnablingStorage(true);
        try {
            await onEnableStorage();
        }
        finally {
            setEnablingStorage(false);
        }
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-xl bg-card p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                <h3 className="font-heading text-lg font-semibold">Firestore</h3>
                <p className="text-sm text-muted-foreground">
                    Create the default native Firestore database (location{' '}
                    <span className="font-mono">nam5</span> unless overridden).
                    Idempotent if already enabled.
                </p>
                <Button
                    type="button"
                    variant="brand"
                    disabled={enablingFirestore}
                    onClick={() => void runFirestore()}
                >
                    {enablingFirestore ? (
                        <Loading size="sm" />
                    ) : (
                        'Enable Firestore'
                    )}
                </Button>
            </div>

            <div className="space-y-3 rounded-xl bg-card p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                <h3 className="font-heading text-lg font-semibold">Storage</h3>
                <p className="text-sm text-muted-foreground">
                    Enable Cloud Storage and ensure the default bucket{' '}
                    <span className="font-mono">{'{projectId}.appspot.com'}</span>{' '}
                    exists.
                </p>
                <Button
                    type="button"
                    variant="brand"
                    disabled={enablingStorage}
                    onClick={() => void runStorage()}
                >
                    {enablingStorage ? (
                        <Loading size="sm" />
                    ) : (
                        'Enable Storage'
                    )}
                </Button>
            </div>
        </div>
    );
};
