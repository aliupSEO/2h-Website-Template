import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { VercelEnvVar } from '@/features/vercel/types';
import { VercelEmptyState } from './VercelEmptyState';

type EnvVarsTableProps = {
    envVars: VercelEnvVar[];
    onCreate: () => void;
    onEdit: (envVar: VercelEnvVar) => void;
    onDelete: (envVar: VercelEnvVar) => void;
};

const headClass =
    'h-12 px-4 text-xs font-bold tracking-[0.1em] text-primary uppercase sm:px-6';

export const EnvVarsTable = ({
    envVars,
    onCreate,
    onEdit,
    onDelete,
}: EnvVarsTableProps) => {
    return (
        <div className="space-y-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3 sm:px-6">
                <h3 className="text-sm font-semibold text-foreground">
                    Environment variables
                </h3>
                <Button
                    type="button"
                    variant="brand"
                    className="h-9 rounded-md px-3 text-sm"
                    onClick={onCreate}
                >
                    <Plus data-icon="inline-start" />
                    Add variable
                </Button>
            </div>

            {envVars.length === 0 ? (
                <VercelEmptyState
                    title="No environment variables"
                    description="Add variables for production, preview, or development."
                    actionLabel="Add variable"
                    onAction={onCreate}
                />
            ) : (
                <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-card shadow-none">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-primary/40 bg-primary/15 hover:bg-primary/15">
                                <TableHead className={headClass}>Key</TableHead>
                                <TableHead className={headClass}>
                                    Value
                                </TableHead>
                                <TableHead className={headClass}>
                                    Environments
                                </TableHead>
                                <TableHead
                                    className={`${headClass} w-[7rem] text-right`}
                                >
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {envVars.map((envVar, index) => (
                                <TableRow
                                    key={envVar.id}
                                    style={{
                                        animationDelay: `${Math.min(index, 16) * 35}ms`,
                                    }}
                                    className="group/row animate-in fade-in fill-mode-both border-white/5 duration-300 hover:bg-white/[0.035]"
                                >
                                    <TableCell className="px-4 py-3.5 font-medium sm:px-6">
                                        {envVar.key}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 font-mono text-xs text-foreground/80 sm:px-6">
                                        {envVar.value ?? '••••••••'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 sm:px-6">
                                        <div className="flex flex-wrap gap-1.5">
                                            {envVar.targets.length === 0 ? (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            ) : (
                                                envVar.targets.map((target) => (
                                                    <span
                                                        key={target}
                                                        className="inline-flex rounded-md bg-primary/15 px-2 py-0.5 text-[11px] font-semibold capitalize text-primary ring-1 ring-primary/25"
                                                    >
                                                        {target}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-right sm:px-6">
                                        <div className="flex justify-end gap-0.5">
                                            <Button
                                                type="button"
                                                size="icon-sm"
                                                variant="ghost"
                                                className="text-foreground/80 hover:bg-primary/15 hover:text-primary"
                                                aria-label={`Edit ${envVar.key}`}
                                                onClick={() => onEdit(envVar)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon-sm"
                                                variant="ghost"
                                                className="text-foreground/80 hover:bg-destructive/15 hover:text-destructive"
                                                aria-label={`Delete ${envVar.key}`}
                                                onClick={() => onDelete(envVar)}
                                            >
                                                <Trash2 className="size-4" />
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
