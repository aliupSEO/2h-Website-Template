import type { Plugin } from '@/features/plugins/types';
import { PluginCard } from './PluginCard';
import { ScrollReveal } from '@/components/common';

type PluginsCardGridProps = {
    plugins: Plugin[];
    onEdit: (plugin: Plugin) => void;
    onDelete: (plugin: Plugin) => void;
    onDownload: (plugin: Plugin) => Promise<void>;
    onToggleActive: (plugin: Plugin, isActive: boolean) => Promise<void>;
};

export const PluginsCardGrid = ({
    plugins,
    onEdit,
    onDelete,
    onDownload,
    onToggleActive,
}: PluginsCardGridProps) => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {plugins.map((plugin, index) => (
                <ScrollReveal key={plugin.id} delay={Math.min(index * 50, 500)}>
                <PluginCard
                    key={plugin.id}
                    plugin={plugin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDownload={onDownload}
                    onToggleActive={onToggleActive}
                />
                </ScrollReveal>
            ))}
        </div>
    );
};
