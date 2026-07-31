import { Eye, Pencil, Trash2 } from 'lucide-react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { HubEnvVar } from '@/features/env/types';

type EnvVarsTableProps = {
    vars: HubEnvVar[];
    onReveal: (item: HubEnvVar) => void;
    onEdit: (item: HubEnvVar) => void;
    onDelete: (item: HubEnvVar) => void;
};

const formatDate = (value: string) => {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
};

export const EnvVarsTable = ({
    vars,
    onReveal,
    onEdit,
    onDelete,
}: EnvVarsTableProps) => {
    return (
        <div className="rounded-xl border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vars.map((item) => (
                        <TableRow key={item.id} className="border-white/5">
                            <TableCell className="font-mono text-sm font-medium">
                                {item.key}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                                ••••••••
                            </TableCell>
                            <TableCell>{formatDate(item.updatedAt)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() => onReveal(item)}
                                    >
                                        <Eye className="size-3.5" />
                                        Reveal
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() => onEdit(item)}
                                    >
                                        <Pencil className="size-3.5" />
                                        Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1.5 text-destructive hover:text-destructive"
                                        onClick={() => onDelete(item)}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
