import { Briefcase } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmModal, DocumentTitle } from '@/components/common';
import type { Client, ClientStatus } from '@/features/clients/types';
import { toast } from '@/lib/toast';
import { useClientsStore } from '@/stores/clientsStore';
import { ClientsCardGrid } from './ClientsCardGrid';
import { ClientsTable } from './ClientsTable';
import { ClientsToolbar } from './ClientsToolbar';
export const ClientsList = () => {
    const clients = useClientsStore((state) => state.clients);
    const viewMode = useClientsStore((state) => state.viewMode);
    const hydrate = useClientsStore((state) => state.hydrate);
    const setViewMode = useClientsStore((state) => state.setViewMode);
    const deleteClient = useClientsStore((state) => state.deleteClient);
    const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
    const [pendingDelete, setPendingDelete] = useState<Client | null>(null);
    useEffect(() => {
        hydrate();
    }, [hydrate]);
    const filtered = useMemo(() => {
        if (statusFilter === 'all')
            return clients;
        return clients.filter((client) => client.status === statusFilter);
    }, [clients, statusFilter]);
    const handleConfirmDelete = () => {
        if (!pendingDelete)
            return;
        deleteClient(pendingDelete.id);
        toast.success('Client deleted');
    };
    return (<div className="space-y-4">
      <DocumentTitle title="Clients"/>

      <div className="-m-4 space-y-0 bg-muted sm:-m-6">
        <ClientsToolbar viewMode={viewMode} onViewModeChange={setViewMode} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}/>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-black shadow-[0_0_20px_rgba(198,245,50,0.2)]">
                <Briefcase className="size-8" />
            </div>
            <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                No clients yet
            </h3>
            <p className="mb-8 max-w-sm text-base text-muted-foreground">
                Create your first client to get started.
            </p>
        </div>
      ) : viewMode === 'table' ? (
        <ClientsTable clients={filtered} onDelete={(client) => setPendingDelete(client)}/>
      ) : (
        <div className="relative px-4 py-6 sm:px-6">
          <ClientsCardGrid clients={filtered} onDelete={(client) => setPendingDelete(client)}/>
        </div>
      )}
      </div>

      <ConfirmModal open={Boolean(pendingDelete)} onOpenChange={(open) => {
            if (!open)
                setPendingDelete(null);
        }} title="Delete client?" description={pendingDelete
            ? `${pendingDelete.name} and all attached files will be removed.`
            : ''} confirmLabel="Delete" variant="destructive" onConfirm={handleConfirmDelete}/>
    </div>);
};
