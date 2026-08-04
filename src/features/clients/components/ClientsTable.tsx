import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui';
import type { Client } from '@/features/clients/types';
import { ClientStatusBadge } from './ClientStatusBadge';
import { cn } from '@/lib/utils';

type ClientsTableProps = {
    clients: Client[];
    onDelete: (client: Client) => void;
};

const headClass =
    'h-14 px-4 text-sm font-extrabold tracking-wide text-black uppercase sm:px-6';

export const ClientsTable = ({ clients, onDelete }: ClientsTableProps) => {
    return (
        <div className="overflow-x-auto overflow-y-clip rounded-none border-0 bg-muted shadow-none">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-0 bg-primary hover:bg-primary">
                        <TableHead className={headClass}>Name</TableHead>
                        <TableHead className={headClass}>Email</TableHead>
                        <TableHead className={headClass}>Phone</TableHead>
                        <TableHead className={headClass}>Status</TableHead>
                        <TableHead className={headClass}>Links</TableHead>
                        <TableHead className={headClass}>Files</TableHead>
                        <TableHead className={cn(headClass, 'text-right')}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => {
                        const fileCount =
                            client.logos.length +
                            client.assets.length +
                            client.documents.length;
                        return (
                            <TableRow
                                key={client.id}
                                className="group/row border-white/5 hover:bg-white/[0.035]"
                            >
                                <TableCell className="max-w-[22rem] px-4 py-3.5 whitespace-normal sm:px-6 font-medium">
                                    {client.name}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    {client.email}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    +{client.phone}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    <ClientStatusBadge status={client.status} />
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    {client.links.length}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6">
                                    {fileCount}
                                </TableCell>
                                <TableCell className="px-4 py-3.5 sm:px-6 text-right">
                                    <div className="flex items-center justify-end gap-1 text-muted-foreground transition-colors group-hover/row:text-foreground">
                                        <Button 
                                            asChild 
                                            size="icon-sm" 
                                            variant="ghost"
                                            className="text-foreground/80 hover:bg-primary hover:text-primary-foreground"
                                            title="Edit"
                                        >
                                            <Link to={`/clients/${client.id}/edit`}>
                                                <Pencil className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            size="icon-sm"
                                            variant="ghost"
                                            className="text-destructive hover:bg-destructive hover:text-white"
                                            onClick={() => onDelete(client)}
                                            title="Delete"
                                        >
                                            <Trash2 className="size-4" />
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
