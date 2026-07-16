import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import type { VercelEnvVar } from '@/features/vercel/types';

type EnvVarsTableProps = {
    envVars: VercelEnvVar[];
    onCreate: () => void;
    onEdit: (envVar: VercelEnvVar) => void;
    onDelete: (envVar: VercelEnvVar) => void;
};

const formatTargets = (targets: VercelEnvVar['targets']) => {
    if (targets.length === 0) return '—';
    return targets.join(', ');
};

export const EnvVarsTable = ({
    envVars,
    onCreate,
    onEdit,
    onDelete,
}: EnvVarsTableProps) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-foreground">
                    Environment variables
                </h3>
                <Button type="button" size="sm" variant="outline" onClick={onCreate}>
                    <Plus data-icon="inline-start" />
                    Add variable
                </Button>
            </div>

            {envVars.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No environment variables configured.
                </p>
            ) : (
                <div className="rounded-xl border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead>Key</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Environments</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {envVars.map((envVar) => (
                                <TableRow key={envVar.id} className="border-white/5">
                                    <TableCell className="font-medium">
                                        {envVar.key}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {envVar.value ?? '••••••••'}
                                    </TableCell>
                                    <TableCell>{formatTargets(envVar.targets)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                type="button"
                                                size="icon-sm"
                                                variant="ghost"
                                                aria-label={`Edit ${envVar.key}`}
                                                onClick={() => onEdit(envVar)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon-sm"
                                                variant="ghost"
                                                aria-label={`Delete ${envVar.key}`}
                                                onClick={() => onDelete(envVar)}
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
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
