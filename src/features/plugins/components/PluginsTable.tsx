import {
    Download,
    Pencil,
    Power,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Loading } from '@/components/common';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui';
import type { Plugin } from '@/features/plugins/types';
import { cn } from '@/lib/utils';

type PluginsTableProps = {
    plugins: Plugin[];
    onEdit: (plugin: Plugin) => void;
    onDelete: (plugin: Plugin) => void;
    onDownload: (plugin: Plugin) => Promise<void>;
    onToggleActive: (plugin: Plugin, isActive: boolean) => Promise<void>;
};

const headClass =
    'h-14 px-4 text-sm font-extrabold tracking-wide text-black uppercase sm:px-6';

export const PluginsTable = ({ 
    plugins, 
    onEdit, 
    onDelete, 
    onDownload, 
    onToggleActive 
}: PluginsTableProps) => {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const handleDownload = async (plugin: Plugin) => {
        setDownloadingId(plugin.id);
        try {
            await onDownload(plugin);
        }
        finally {
            setDownloadingId(null);
        }
    };

    const handleToggle = async (plugin: Plugin, isActive: boolean) => {
        if (isActive === plugin.isActive) return;
        setTogglingId(plugin.id);
        try {
            await onToggleActive(plugin, isActive);
        }
        finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-muted shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-0 bg-primary hover:bg-primary">
                        <TableHead className={headClass}>Plugin</TableHead>
                        <TableHead className={headClass}>File</TableHead>
                        <TableHead className={headClass}>Status</TableHead>
                        <TableHead className={cn(headClass, 'w-[9rem] text-right')}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {plugins.map((plugin) => (
                        <TableRow
                            key={plugin.id}
                            className={cn(
                                "group/row border-white/5 hover:bg-white/[0.035]",
                                !plugin.isActive && "opacity-70"
                            )}
                        >
                            <TableCell className="max-w-[22rem] px-4 py-3.5 whitespace-normal sm:px-6">
                                <div className="min-w-0 space-y-1">
                                    <span className="block truncate font-heading text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover/row:text-primary">
                                        {plugin.name}
                                    </span>
                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                        {plugin.description?.trim() || 'No description'}
                                    </p>
                                </div>
                            </TableCell>
                            
                            <TableCell className="px-4 py-3.5 sm:px-6">
                                <span className="truncate text-sm font-medium text-foreground">
                                    {plugin.fileName ?? 'No file'}
                                </span>
                            </TableCell>
                            
                            <TableCell className="px-4 py-3.5 sm:px-6">
                                <span
                                    className={cn(
                                        'inline-flex h-6 items-center rounded px-2.5 text-[11px] font-bold uppercase tracking-wider',
                                        plugin.isActive
                                            ? 'bg-primary text-black'
                                            : 'bg-destructive/20 text-destructive',
                                    )}
                                >
                                    {plugin.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </TableCell>
                            
                            <TableCell className="px-4 py-3.5 sm:px-6 text-right">
                                <div className="flex items-center justify-end gap-1 text-muted-foreground transition-colors group-hover/row:text-foreground">
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        className={cn(
                                            "text-foreground/80",
                                            plugin.isActive 
                                                ? "hover:bg-destructive hover:text-white" 
                                                : "hover:bg-primary hover:text-primary-foreground"
                                        )}
                                        disabled={togglingId === plugin.id}
                                        onClick={() => void handleToggle(plugin, !plugin.isActive)}
                                    >
                                        {togglingId === plugin.id ? (
                                            <Loading size="sm" />
                                        ) : (
                                            <Power className="size-4" />
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                        disabled={!plugin.storagePath || downloadingId === plugin.id || !plugin.isActive}
                                        onClick={() => void handleDownload(plugin)}
                                    >
                                        {downloadingId === plugin.id ? (
                                            <Loading size="sm" />
                                        ) : (
                                            <Download className="size-4" />
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => onEdit(plugin)}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive hover:text-white"
                                        onClick={() => onDelete(plugin)}
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
