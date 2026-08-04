import type { FirebaseProject } from '@/features/firebase/types';
import { ProjectCard } from './ProjectCard';
import { ScrollReveal } from '@/components/common';

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
                {projects.map((project, index) => (
                    <ScrollReveal key={project.projectId} delay={Math.min(index * 50, 500)}>
                    <ProjectCard
                        key={project.projectId}
                        project={project}
                        onManage={onManage}
                    />
                    </ScrollReveal>
                ))}
            </div>
        </div>
    );
};
