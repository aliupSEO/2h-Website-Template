import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import type { FirebaseProject } from '@/features/firebase/types';

type ProjectSelectProps = {
    projects: FirebaseProject[];
    value: string | null;
    onChange: (projectId: string) => void;
    placeholder?: string;
};

export const ProjectSelect = ({
    projects,
    value,
    onChange,
    placeholder = 'Select a Firebase project',
}: ProjectSelectProps) => {
    return (
        <Select
            value={value ?? undefined}
            onValueChange={onChange}
        >
            <SelectTrigger className="h-10 min-w-[240px] sm:max-w-md">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {projects.map((project) => (
                    <SelectItem
                        key={project.projectId}
                        value={project.projectId}
                    >
                        {project.displayName} ({project.projectId})
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
