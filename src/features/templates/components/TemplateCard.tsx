import {
    Check,
    Copy,
    ExternalLink,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui';
import type { Template } from '@/features/templates/types';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { TemplateCategoryBadge } from './TemplateCategoryBadge';

type TemplateCardProps = {
    template: Template;
    onEdit: (template: Template) => void;
    onDelete: (template: Template) => void;
};

export const TemplateCard = ({
    template,
    onEdit,
    onDelete,
}: TemplateCardProps) => {
    const [copied, setCopied] = useState(false);

    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(template.url);
            setCopied(true);
            toast.success('URL copied');
            window.setTimeout(() => setCopied(false), 1600);
        }
        catch {
            toast.error('Could not copy URL');
        }
    };

    return (
        <article
            className={cn(
                'group/template relative flex h-full flex-col overflow-hidden rounded-3xl',
                'bg-card ring-1 ring-white/[0.08]',
                'transition-[box-shadow,ring-color,background-color] duration-300 ease-out',
                'hover:bg-[#323232] hover:ring-primary/40',
                'hover:shadow-[0_0_0_1px_rgba(198,245,50,0.1),0_12px_40px_rgba(0,0,0,0.45)]',
            )}
        >
            <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover/template:scale-x-100"
            />

            <div className="relative flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <TemplateCategoryBadge category={template.category} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Actions for ${template.name}`}
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
                                onClick={() => onEdit(template)}
                            >
                                <Pencil className="size-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem
                                variant="destructive"
                                className="cursor-pointer gap-2"
                                onClick={() => onDelete(template)}
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 ease-out group-hover/template:text-primary">
                    {template.name}
                </h3>

                <div className="mt-3 space-y-1">
                    <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                        Repo
                    </p>
                    <p className="truncate text-sm text-foreground/70">
                        {template.gitRepository}
                    </p>
                </div>

                <p className="mt-2 line-clamp-2 min-h-10 break-all text-xs text-muted-foreground">
                    {template.url}
                </p>
            </div>

            <div className="relative flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-black/35 p-3.5 transition-colors duration-300 ease-out group-hover/template:border-primary/15 group-hover/template:bg-black/50">
                <Button
                    asChild
                    size="sm"
                    variant="brand"
                    className="h-10 min-w-0 flex-1 rounded-md"
                >
                    <a href={template.url} target="_blank" rel="noreferrer">
                        <ExternalLink data-icon="inline-start" />
                        Open URL
                    </a>
                </Button>
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-10 rounded-md border-0 ring-1 ring-inset ring-white/12 hover:bg-primary hover:text-black hover:ring-primary"
                    aria-label={`Copy URL for ${template.name}`}
                    onClick={() => void copyUrl()}
                >
                    {copied ? (
                        <Check className="size-4" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </Button>
            </div>
        </article>
    );
};
