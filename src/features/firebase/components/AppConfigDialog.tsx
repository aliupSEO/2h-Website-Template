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
import type { FirebaseWebAppConfig } from '@/features/firebase/types';

type AppConfigDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appName: string;
    config: FirebaseWebAppConfig | null;
    loading: boolean;
    error: string | null;
    onCopy: () => void;
};

export const AppConfigDialog = ({
    open,
    onOpenChange,
    appName,
    config,
    loading,
    error,
    onCopy,
}: AppConfigDialogProps) => {
    const json = config ? JSON.stringify(config, null, 2) : '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Web app config</DialogTitle>
                    <DialogDescription>
                        Client SDK config for {appName}. Safe to embed in
                        frontend apps (not a service account).
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loading size="md" label="Loading config…" />
                    </div>
                ) : error ? (
                    <p className="text-sm text-destructive">{error}</p>
                ) : (
                    <pre className="max-h-80 overflow-auto rounded-lg bg-muted/40 p-4 font-mono text-xs whitespace-pre-wrap">
                        {json}
                    </pre>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        variant="brand"
                        disabled={!config || loading}
                        onClick={onCopy}
                    >
                        Copy JSON
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
