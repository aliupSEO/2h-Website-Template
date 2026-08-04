import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui';
import type { HubEnvVar } from '@/features/env/types';
import { cn } from '@/lib/utils';

type EnvVarCardProps = {
    item: HubEnvVar;
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

export const EnvVarCard = ({
    item,
    onReveal,
    onEdit,
    onDelete,
}: EnvVarCardProps) => {
    return (
        <article
            className={cn(
                'group/env relative flex h-full flex-col overflow-hidden rounded-3xl',
                'bg-card ring-1 ring-white/[0.08]',
                'transition-[box-shadow,ring-color,background-color] duration-300 ease-out',
                'hover:bg-[#323232] hover:ring-primary/40',
                'hover:shadow-[0_0_0_1px_rgba(198,245,50,0.1),0_12px_40px_rgba(0,0,0,0.45)]',
            )}
        >
            <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover/env:scale-x-100"
            />

            <div className="relative flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="inline-flex h-6 items-center rounded px-2.5 text-[11px] font-bold tracking-wide uppercase bg-primary text-primary-foreground">
                        Secret
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Actions for ${item.key}`}
                                className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
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
                                onClick={() => onEdit(item)}
                            >
                                <Pencil className="size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                                variant="destructive"
                                className="cursor-pointer gap-2"
                                onClick={() => onDelete(item)}
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 ease-out group-hover/env:text-primary break-all">
                    {item.key}
                </h3>

                <div className="mt-3 space-y-1">
                    <p className="text-[11px] font-medium tracking-wide text-primary uppercase">
                        Value
                    </p>
                    <p className="font-mono text-sm text-foreground/70">
                        ••••••••
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                    <p className="text-[11px] font-medium tracking-wide text-primary uppercase">
                        Updated
                    </p>
                    <p className="text-xs text-primary">
                        {formatDate(item.updatedAt)}
                    </p>
                </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-black/35 p-3.5 transition-colors duration-300 ease-out group-hover/env:border-primary/15 group-hover/env:bg-black/50">
                <Button
                    type="button"
                    variant="brand"
                    className="h-10 w-full rounded-md"
                    onClick={() => onReveal(item)}
                >
                    <Eye data-icon="inline-start" />
                    Reveal value
                </Button>
            </div>
        </article>
    );
};
