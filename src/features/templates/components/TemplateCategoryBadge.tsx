import type { TemplateCategory } from '@/features/templates/types';
import { TEMPLATE_CATEGORY_LABELS } from '@/features/templates/schemas';
import { cn } from '@/lib/utils';

type TemplateCategoryBadgeProps = {
    category: TemplateCategory;
    className?: string;
};

export const TemplateCategoryBadge = ({
    category,
    className,
}: TemplateCategoryBadgeProps) => {
    return (
        <span
            className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
                category === 'websites'
                    ? 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20'
                    : 'bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20',
                className,
            )}
        >
            {TEMPLATE_CATEGORY_LABELS[category]}
        </span>
    );
};
