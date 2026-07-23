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

const TARGET_LABEL: Record<string, string> = {
    production: 'Prod',
    preview: 'Preview',
    development: 'Dev',
};

const headClass =
    'h-12 px-3 text-sm font-extrabold tracking-wide text-black uppercase sm:px-4';

export const EnvVarsTable = ({
    envVars,
    onCreate,
    onEdit,
    onDelete,
}: EnvVarsTableProps) => {
    return (
        <div className="space-y-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3 sm:px-5">
                <h3 className="text-sm font-semibold text-foreground">
                    Environment variables
                </h3>
                <Button
                    type="button"
                    variant="brand"
                    className="h-9 shrink-0 rounded-md px-3 text-sm"
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
                <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-muted shadow-none">
                    <Table className="min-w-[40rem] table-fixed">
                        <TableHeader>
                            <TableRow className="border-b-0 bg-primary hover:bg-primary">
                                <TableHead
                                    className={`${headClass} w-[28%]`}
                                >
                                    Key
                                </TableHead>
                                <TableHead
                                    className={`${headClass} w-[32%]`}
                                >
                                    Value
                                </TableHead>
                                <TableHead
                                    className={`${headClass} w-[24%]`}
                                >
                                    Env
                                </TableHead>
                                <TableHead
                                    className={`${headClass} w-[16%] text-right`}
                                >
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {envVars.map((envVar) => (
                                <TableRow
                                    key={envVar.id}
                                    className="group/row border-white/5 hover:bg-white/[0.035]"
                                >
                                    <TableCell
                                        className="max-w-0 truncate px-3 py-3.5 font-medium sm:px-4"
                                        title={envVar.key}
                                    >
                                        {envVar.key}
                                    </TableCell>
                                    <TableCell
                                        className="max-w-0 truncate px-3 py-3.5 font-mono text-xs text-foreground/80 sm:px-4"
                                        title={envVar.value ?? undefined}
                                    >
                                        {envVar.value ?? '••••••••'}
                                    </TableCell>
                                    <TableCell className="whitespace-normal px-3 py-3.5 sm:px-4">
                                        <div className="flex flex-wrap gap-1">
                                            {envVar.targets.length === 0 ? (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            ) : (
                                                envVar.targets.map((target) => (
                                                    <span
                                                        key={target}
                                                        title={target}
                                                        className="inline-flex h-5 shrink-0 items-center rounded bg-primary px-2 text-[11px] font-bold text-black"
                                                    >
                                                        {TARGET_LABEL[target] ??
                                                            target}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 py-3.5 text-right sm:px-4">
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
