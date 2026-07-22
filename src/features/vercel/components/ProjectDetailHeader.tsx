import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

type ProjectDetailHeaderProps = {
    projectName: string;
    title: string;
    onBack: () => void;
};

export const ProjectDetailHeader = ({
    projectName,
    title,
    onBack,
}: ProjectDetailHeaderProps) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-3 sm:px-6">
            <div className="min-w-0">
                <p className="truncate text-xs font-semibold tracking-wide text-primary uppercase">
                    {projectName}
                </p>
                <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                    {title}
                </h2>
            </div>
            <Button
                type="button"
                variant="outline"
                className="h-9 gap-2 rounded-md px-3 text-sm ring-1 ring-white/12 hover:bg-primary/15 hover:text-primary hover:ring-primary/30"
                onClick={onBack}
            >
                <ArrowLeft className="size-3.5" />
                Back to projects
            </Button>
        </div>
    );
};
