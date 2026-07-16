import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui';
import type { VercelProject } from '@/features/vercel/types';

type ProjectSelectProps = {
    projects: VercelProject[];
    value: string | null;
    onChange: (projectId: string) => void;
    placeholder?: string;
};

export const ProjectSelect = ({
    projects,
    value,
    onChange,
    placeholder = 'Select a project',
}: ProjectSelectProps) => {
    return (
        <Select
            value={value ?? undefined}
            onValueChange={onChange}
        >
            <SelectTrigger className="w-full min-w-[220px] sm:w-[280px]">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                        {project.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
