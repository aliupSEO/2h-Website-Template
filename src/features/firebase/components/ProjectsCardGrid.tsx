import type { FirebaseProject } from '@/features/firebase/types';
import { ProjectCard } from './ProjectCard';

type ProjectsCardGridProps = {
    projects: FirebaseProject[];
    onManage: (project: FirebaseProject) => void;
};

export const ProjectsCardGrid = ({
    projects,
    onManage,
}: ProjectsCardGridProps) => {
    return (
        <div className="relative px-4 py-6 sm:px-6">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.projectId}
                        project={project}
                        onManage={onManage}
                    />
                ))}
            </div>
        </div>
    );
};
