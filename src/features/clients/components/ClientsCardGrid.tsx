import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Client } from '@/features/clients/types';
import { ClientStatusBadge } from './ClientStatusBadge';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '@/components/common';

type ClientsCardGridProps = {
    clients: Client[];
    onDelete: (client: Client) => void;
};

export const ClientsCardGrid = ({ clients, onDelete }: ClientsCardGridProps) => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client, index) => {
                const fileCount =
                    client.logos.length + client.assets.length + client.documents.length;
                return (
                    <ScrollReveal key={client.id} delay={Math.min(index * 50, 500)}>
                        <article
                            className={cn(
                                'group/client relative flex h-full flex-col overflow-hidden rounded-3xl',
                                'bg-card ring-1 ring-white/[0.08]',
                                'transition-[box-shadow,ring-color,background-color] duration-300 ease-out',
                                'hover:bg-[#323232] hover:ring-primary/40',
                                'hover:shadow-[0_0_0_1px_rgba(198,245,50,0.1),0_12px_40px_rgba(0,0,0,0.45)]'
                            )}
                        >
                            <span
                                aria-hidden
                                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover/client:scale-x-100"
                            />

                            <div className="relative flex flex-1 flex-col p-5">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <ClientStatusBadge status={client.status} />
                                </div>

                                <h3 className="mt-1 block truncate font-heading text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 ease-out group-hover/client:text-primary">
                                    {client.name}
                                </h3>

                                <div className="mt-3 space-y-1.5 text-sm leading-relaxed text-foreground/70">
                                    <p className="truncate">{client.email}</p>
                                    <p className="truncate">+{client.phone}</p>
                                </div>

                                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs text-primary">
                                    <span className="tabular-nums">
                                        {client.links.length} link
                                        {client.links.length === 1 ? '' : 's'} · {fileCount} file
                                        {fileCount === 1 ? '' : 's'}
                                    </span>
                                </div>
                            </div>

                            <div className="relative flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-black/35 p-3.5 transition-colors duration-300 ease-out group-hover/client:border-primary/15 group-hover/client:bg-black/50">
                                <Button
                                    asChild
                                    size="sm"
                                    variant="brand"
                                    className="h-10 min-w-0 flex-1 rounded-md transition-[box-shadow,filter] duration-200 ease-out hover:shadow-[0_0_20px_rgba(198,245,50,0.3)] hover:brightness-110 active:scale-[0.99]"
                                >
                                    <Link to={`/clients/${client.id}/edit`}>
                                        Edit client
                                    </Link>
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="size-10 rounded-md border-0 border-transparent ring-1 ring-inset ring-white/12 transition-[background-color,color,box-shadow,ring-color] duration-200 ease-out hover:bg-red-500/90 hover:text-white hover:shadow-[0_0_18px_rgba(239,68,68,0.25)] hover:ring-red-500/90 active:scale-[0.98]"
                                    aria-label={`Delete ${client.name}`}
                                    onClick={() => onDelete(client)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </article>
                    </ScrollReveal>
                );
            })}
        </div>
    );
};
