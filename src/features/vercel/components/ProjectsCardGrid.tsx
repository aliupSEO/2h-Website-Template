import type {
    VercelProject,
    VercelProjectSummary,
} from '@/features/vercel/types';
import { ProjectCard } from './ProjectCard';

type ProjectsCardGridProps = {
    projects: VercelProject[];
    summaries: Record<string, VercelProjectSummary>;
    selectedProjectId: string | null;
    onOpenDeployments: (project: VercelProject) => void;
    onOpenEnv: (project: VercelProject) => void;
};

export const ProjectsCardGrid = ({
    projects,
    summaries,
    selectedProjectId,
    onOpenDeployments,
    onOpenEnv,
}: ProjectsCardGridProps) => {
    return (
        <div className="relative border-t border-white/5 px-4 py-6 sm:px-6">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(198,245,50,0.06),transparent_55%)]"
            />
            <div className="relative grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        summary={
                            summaries[project.id] ?? {
                                latestDeployment: null,
                                deploymentCount: 0,
                                envVarCount: 0,
                                loading: true,
                                summaryOnly: true,
                            }
                        }
                        selected={selectedProjectId === project.id}
                        onOpenDeployments={onOpenDeployments}
                        onOpenEnv={onOpenEnv}
                    />
                ))}
            </div>
        </div>
    );
};
