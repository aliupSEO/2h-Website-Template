import type {
    VercelProject,
    VercelProjectSummary,
} from '@/features/vercel/types';
import { ProjectCard } from './ProjectCard';

type ProjectsCardGridProps = {
    projects: VercelProject[];
    summaries: Record<string, VercelProjectSummary>;
    onOpenDeployments: (project: VercelProject) => void;
    onOpenEnv: (project: VercelProject) => void;
};

export const ProjectsCardGrid = ({
    projects,
    summaries,
    onOpenDeployments,
    onOpenEnv,
}: ProjectsCardGridProps) => {
    return (
        <div className="relative px-4 py-6 sm:px-6">
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
                                loadingDeployment: true,
                                loadingEnv: true,
                                summaryOnly: true,
                            }
                        }
                        onOpenDeployments={onOpenDeployments}
                        onOpenEnv={onOpenEnv}
                    />
                ))}
            </div>
        </div>
    );
};
