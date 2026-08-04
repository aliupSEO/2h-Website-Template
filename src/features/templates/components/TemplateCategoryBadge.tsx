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
                'inline-flex h-6 items-center rounded px-2.5 text-[11px] font-bold tracking-wide uppercase',
                'bg-primary text-black',
                className,
            )}
        >
            {TEMPLATE_CATEGORY_LABELS[category]}
        </span>
    );
};
