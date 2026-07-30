import type { Template } from '@/features/templates/types';
import { TemplateCard } from './TemplateCard';

type TemplatesCardGridProps = {
    templates: Template[];
    onEdit: (template: Template) => void;
    onDelete: (template: Template) => void;
};

export const TemplatesCardGrid = ({
    templates,
    onEdit,
    onDelete,
}: TemplatesCardGridProps) => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
