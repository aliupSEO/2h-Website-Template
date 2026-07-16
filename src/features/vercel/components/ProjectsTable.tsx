import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { VercelProject } from '@/features/vercel/types';
import { cn } from '@/lib/utils';

type ProjectsTableProps = {
    projects: VercelProject[];
    selectedProjectId: string | null;
    onSelect: (project: VercelProject) => void;
};

const formatDate = (value: number) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
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
                        <TableHead>Name</TableHead>
                        <TableHead>Framework</TableHead>
                        <TableHead>Production URL</TableHead>
                        <TableHead>Updated</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow
                            key={project.id}
                            className={cn(
                                'cursor-pointer border-white/5',
                                selectedProjectId === project.id && 'bg-white/5',
                            )}
                            onClick={() => onSelect(project)}
                        >
                            <TableCell className="font-medium">
                                {project.name}
                            </TableCell>
                            <TableCell>{project.framework ?? '—'}</TableCell>
                            <TableCell>
                                {project.productionUrl ? (
                                    <a
                                        href={project.productionUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-foreground underline-offset-4 hover:underline"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        {project.productionUrl.replace(/^https?:\/\//, '')}
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </TableCell>
                            <TableCell>{formatDate(project.updatedAt)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
