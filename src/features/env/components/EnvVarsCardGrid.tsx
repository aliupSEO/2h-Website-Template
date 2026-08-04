import type { HubEnvVar } from '@/features/env/types';
import { EnvVarCard } from './EnvVarCard';
import { ScrollReveal } from '@/components/common';

type EnvVarsCardGridProps = {
    vars: HubEnvVar[];
    onReveal: (item: HubEnvVar) => void;
    onEdit: (item: HubEnvVar) => void;
    onDelete: (item: HubEnvVar) => void;
};

export const EnvVarsCardGrid = ({
    vars,
    onReveal,
    onEdit,
    onDelete,
}: EnvVarsCardGridProps) => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {vars.map((item, index) => (
                <ScrollReveal key={item.id} delay={Math.min(index * 50, 500)}>
                <EnvVarCard
                    key={item.id}
                    item={item}
                    onReveal={onReveal}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
                </ScrollReveal>
            ))}
        </div>
    );
};
