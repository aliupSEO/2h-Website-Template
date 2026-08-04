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
import { cn } from '@/lib/utils';

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

const headClass =
    'h-14 px-4 text-sm font-extrabold tracking-wide text-black uppercase sm:px-6';

export const EnvVarsTable = ({
    vars,
    onReveal,
    onEdit,
    onDelete,
}: EnvVarsTableProps) => {
    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-muted shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-0 bg-primary hover:bg-primary">
                        <TableHead className={headClass}>Key</TableHead>
                        <TableHead className={headClass}>Value</TableHead>
                        <TableHead className={headClass}>Updated</TableHead>
                        <TableHead className={cn(headClass, "text-right")}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vars.map((item) => (
                        <TableRow key={item.id} className="group/row border-white/5 hover:bg-white/[0.035]">
                            <TableCell className="px-4 py-3.5 font-mono text-sm font-medium sm:px-6">
                                {item.key}
                            </TableCell>
                            <TableCell className="px-4 py-3.5 font-mono text-sm text-muted-foreground sm:px-6">
                                ••••••••
                            </TableCell>
                            <TableCell className="px-4 py-3.5 sm:px-6">{formatDate(item.updatedAt)}</TableCell>
                            <TableCell className="px-4 py-3.5 sm:px-6 text-right">
                                <div className="flex items-center justify-end gap-1 text-muted-foreground transition-colors group-hover/row:text-foreground">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => onReveal(item)}
                                        title="Reveal"
                                    >
                                        <Eye className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => onEdit(item)}
                                        title="Edit"
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-destructive hover:bg-destructive hover:text-white"
                                        onClick={() => onDelete(item)}
                                        title="Delete"
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
    );
};
