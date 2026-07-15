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
    return (<div className="space-y-6">
      <DocumentTitle title="Clients"/>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Clients
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage clients with contact details, links, logos, assets, and docs.
        </p>
      </div>

      <ClientsToolbar viewMode={viewMode} onViewModeChange={setViewMode} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}/>

      {filtered.length === 0 ? (<div className="rounded-xl border-0 bg-card px-6 py-16 text-center shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
          <p className="text-sm text-muted-foreground">
            No clients yet. Create your first client to get started.
          </p>
        </div>) : viewMode === 'table' ? (<ClientsTable clients={filtered} onDelete={(client) => setPendingDelete(client)}/>) : (<ClientsCardGrid clients={filtered} onDelete={(client) => setPendingDelete(client)}/>)}

      <ConfirmModal open={Boolean(pendingDelete)} onOpenChange={(open) => {
            if (!open)
                setPendingDelete(null);
        }} title="Delete client?" description={pendingDelete
            ? `${pendingDelete.name} and all attached files will be removed.`
            : ''} confirmLabel="Delete" variant="destructive" onConfirm={handleConfirmDelete}/>
    </div>);
};
