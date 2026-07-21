import { Copy, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { FirebaseApp } from '@/features/firebase/types';

type AppsTableProps = {
    apps: FirebaseApp[];
    onCreate: () => void;
    onViewConfig: (app: FirebaseApp) => void;
    onDelete: (app: FirebaseApp) => void;
};

export const AppsTable = ({
    apps,
    onCreate,
    onViewConfig,
    onDelete,
}: AppsTableProps) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button type="button" variant="brand" onClick={onCreate}>
                    <Plus data-icon="inline-start" />
                    Create web app
                </Button>
            </div>

            {apps.length === 0 ? (
                <div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <p className="text-sm text-muted-foreground">
                        No apps in this project yet. Create a web app to get
                        client config.
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead>Name</TableHead>
                                <TableHead>Platform</TableHead>
                                <TableHead>App ID</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apps.map((app) => (
                                <TableRow
                                    key={app.appId}
                                    className="border-white/5"
                                >
                                    <TableCell className="font-medium">
                                        {app.displayName}
                                    </TableCell>
                                    <TableCell className="uppercase">
                                        {app.platform}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {app.appId}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {app.platform === 'web' ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        onViewConfig(app)
                                                    }
                                                >
                                                    <Copy data-icon="inline-start" />
                                                    Config
                                                </Button>
                                            ) : null}
                                            {app.platform === 'web' ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDelete(app)}
                                                >
                                                    <Trash2 data-icon="inline-start" />
                                                    Remove
                                                </Button>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};
