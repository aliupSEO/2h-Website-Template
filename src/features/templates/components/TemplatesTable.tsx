import {
    Check,
    Copy,
    ExternalLink,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui';
import type { Template } from '@/features/templates/types';
import { TemplateCategoryBadge } from './TemplateCategoryBadge';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

type TemplatesTableProps = {
    templates: Template[];
    onEdit: (template: Template) => void;
    onDelete: (template: Template) => void;
};

const headClass =
    'h-14 px-4 text-sm font-extrabold tracking-wide text-black uppercase sm:px-6';

export const TemplatesTable = ({ 
    templates, 
    onEdit, 
    onDelete, 
}: TemplatesTableProps) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyUrl = async (template: Template) => {
        try {
            await navigator.clipboard.writeText(template.url);
            setCopiedId(template.id);
            toast.success('URL copied');
            window.setTimeout(() => setCopiedId(null), 1600);
        }
        catch {
            toast.error('Could not copy URL');
        }
    };

    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-muted shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-0 bg-primary hover:bg-primary">
                        <TableHead className={headClass}>Template</TableHead>
                        <TableHead className={headClass}>Category</TableHead>
                        <TableHead className={headClass}>Repository</TableHead>
                        <TableHead className={cn(headClass, 'w-[10.5rem] text-right')}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {templates.map((template) => (
                        <TableRow
                            key={template.id}
                            className="group/row border-white/5 hover:bg-white/[0.035]"
                        >
                            <TableCell className="max-w-[22rem] px-4 py-3.5 whitespace-normal sm:px-6">
                                <div className="min-w-0 space-y-1">
                                    <span className="block truncate font-heading text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover/row:text-primary">
                                        {template.name}
                                    </span>
                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                        {template.url}
                                    </p>
                                </div>
                            </TableCell>
                            
                            <TableCell className="px-4 py-3.5 sm:px-6">
                                <TemplateCategoryBadge category={template.category} />
                            </TableCell>
                            
                            <TableCell className="px-4 py-3.5 sm:px-6">
                                <span className="truncate text-sm font-medium text-foreground">
                                    {template.gitRepository}
                                </span>
                            </TableCell>
                            
                            <TableCell className="px-4 py-3.5 sm:px-6 text-right">
                                <div className="flex items-center justify-end gap-1 text-muted-foreground transition-colors group-hover/row:text-foreground">
                                    <Button
                                        asChild
                                        size="icon-sm"
                                        variant="ghost"
                                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                    >
                                        <a href={template.url} target="_blank" rel="noreferrer" title="Open URL">
                                            <ExternalLink className="size-4" />
                                        </a>
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => void copyUrl(template)}
                                        title="Copy URL"
                                    >
                                        {copiedId === template.id ? (
                                            <Check className="size-4" />
                                        ) : (
                                            <Copy className="size-4" />
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => onEdit(template)}
                                        title="Edit"
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon-sm"
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive hover:text-white"
                                        onClick={() => onDelete(template)}
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
