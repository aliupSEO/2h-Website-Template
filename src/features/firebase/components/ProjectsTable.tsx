import { ExternalLink } from 'lucide-react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui';
import type { FirebaseProject } from '@/features/firebase/types';
import { cn } from '@/lib/utils';
import { ProjectStateBadge } from './ProjectStateBadge';

type ProjectsTableProps = {
    projects: FirebaseProject[];
    onManage: (project: FirebaseProject) => void;
};

const headClass =
    'h-14 px-4 text-sm font-extrabold tracking-wide text-black uppercase sm:px-6';

export const ProjectsTable = ({ projects, onManage }: ProjectsTableProps) => {
    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-muted shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-0 bg-primary hover:bg-primary">
                        <TableHead className={headClass}>Project</TableHead>
                        <TableHead className={headClass}>Project ID</TableHead>
                        <TableHead className={headClass}>State</TableHead>
                        <TableHead
                            className={cn(headClass, 'w-[12rem] text-right')}
                        >
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => {
                        const consoleUrl = `https://console.firebase.google.com/project/${encodeURIComponent(project.projectId)}`;

                        return (
                            <TableRow
                                key={project.projectId}
                                className="group/row border-white/5 hover:bg-white/[0.035]"
                            >
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <p className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
                                        {project.displayName}
                                    </p>
                                    {project.projectNumber ? (
                                        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                                            #{project.projectNumber}
                                        </p>
                                    ) : null}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 font-mono text-xs text-foreground/70 sm:px-6">
                                    {project.projectId}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <ProjectStateBadge state={project.state} />
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="brand"
                                            className="h-8 rounded-md"
                                            onClick={() => onManage(project)}
                                        >
                                            Manage
                                        </Button>
                                        <Button
                                            asChild
                                            size="icon"
                                            variant="outline"
                                            className="size-8 rounded-md border-0 ring-1 ring-inset ring-white/12"
                                        >
                                            <a
                                                href={consoleUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={`Open ${project.displayName} in Console`}
                                            >
                                                <ExternalLink className="size-3.5" />
                                            </a>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};
