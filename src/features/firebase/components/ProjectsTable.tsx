import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { FirebaseProject } from '@/features/firebase/types';
import { cn } from '@/lib/utils';

type ProjectsTableProps = {
    projects: FirebaseProject[];
    selectedProjectId: string | null;
    onSelect: (project: FirebaseProject) => void;
};

export const ProjectsTable = ({
    projects,
    selectedProjectId,
    onSelect,
}: ProjectsTableProps) => {
    return (
        <div className="rounded-xl border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead>Display name</TableHead>
                        <TableHead>Project ID</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Console</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow
                            key={project.projectId}
                            className={cn(
                                'cursor-pointer border-white/5',
                                selectedProjectId === project.projectId &&
                                    'bg-white/5',
                            )}
                            onClick={() => onSelect(project)}
                        >
                            <TableCell className="font-medium">
                                {project.displayName}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                                {project.projectId}
                            </TableCell>
                            <TableCell>{project.state}</TableCell>
                            <TableCell>
                                <a
                                    href={`https://console.firebase.google.com/project/${encodeURIComponent(project.projectId)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-foreground underline-offset-4 hover:underline"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    Open
                                </a>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
