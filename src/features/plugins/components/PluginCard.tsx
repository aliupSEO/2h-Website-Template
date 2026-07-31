import {
    Download,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Loading } from '@/components/common';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui';
import type { Plugin } from '@/features/plugins/types';
import { cn } from '@/lib/utils';
import { PluginStatusToggle } from './PluginStatusToggle';

type PluginCardProps = {
    plugin: Plugin;
    onEdit: (plugin: Plugin) => void;
    onDelete: (plugin: Plugin) => void;
    onDownload: (plugin: Plugin) => Promise<void>;
    onToggleActive: (plugin: Plugin, isActive: boolean) => Promise<void>;
};

export const PluginCard = ({
    plugin,
    onEdit,
    onDelete,
    onDownload,
    onToggleActive,
}: PluginCardProps) => {
    const [downloading, setDownloading] = useState(false);
    const [toggling, setToggling] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await onDownload(plugin);
        }
        finally {
            setDownloading(false);
        }
    };

    const handleToggle = async (isActive: boolean) => {
        if (isActive === plugin.isActive) return;
        setToggling(true);
        try {
            await onToggleActive(plugin, isActive);
        }
        finally {
            setToggling(false);
        }
    };

    return (
        <article
            className={cn(
                'group/plugin relative flex h-full flex-col overflow-hidden rounded-3xl',
                'bg-card ring-1 ring-white/[0.08]',
                'transition-[box-shadow,ring-color,background-color] duration-300 ease-out',
                'hover:bg-[#323232] hover:ring-primary/40',
                'hover:shadow-[0_0_0_1px_rgba(198,245,50,0.1),0_12px_40px_rgba(0,0,0,0.45)]',
                !plugin.isActive && 'opacity-70',
            )}
        >
            <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover/plugin:scale-x-100"
            />

            <div className="relative flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <span
                        className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                            plugin.isActive
                                ? 'bg-primary/10 text-primary'
                                : 'bg-destructive/10 text-destructive',
                        )}
                    >
                        {plugin.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Actions for ${plugin.name}`}
                                className="text-foreground/80 hover:bg-primary/15 hover:text-primary"
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.55)]"
                        >
                            <DropdownMenuItem
                                className="cursor-pointer gap-2"
                                onClick={() => onEdit(plugin)}
                            >
                                <Pencil className="size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                                variant="destructive"
                                className="cursor-pointer gap-2"
                                onClick={() => onDelete(plugin)}
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 ease-out group-hover/plugin:text-primary">
                    {plugin.name}
                </h3>

                <div className="mt-4">
                    <PluginStatusToggle
                        isActive={plugin.isActive}
                        disabled={toggling}
                        onChange={(isActive) => void handleToggle(isActive)}
                    />
                </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-black/35 p-3.5 transition-colors duration-300 ease-out group-hover/plugin:border-primary/15 group-hover/plugin:bg-black/50">
                <Button
                    type="button"
                    size="sm"
                    variant="brand"
                    className="h-10 min-w-0 flex-1 rounded-md"
                    disabled={!plugin.storagePath || downloading || !plugin.isActive}
                    onClick={() => void handleDownload()}
                >
                    {downloading ? (
                        <Loading size="sm" />
                    ) : (
                        <>
                            <Download data-icon="inline-start" />
                            Download
                        </>
                    )}
                </Button>
            </div>
        </article>
    );
};
