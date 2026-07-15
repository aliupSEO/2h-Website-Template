import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { DocumentTitle, LoadingScreen } from '@/components/common';
import { ClientForm } from '@/features/clients';
import { useClientsStore } from '@/stores/clientsStore';
export const EditClientPage = () => {
    const { clientId } = useParams<{
        clientId: string;
    }>();
    const hydrate = useClientsStore((state) => state.hydrate);
    const clients = useClientsStore((state) => state.clients);
    useEffect(() => {
        hydrate();
    }, [hydrate]);
    if (!clientId) {
        return <Navigate to="/clients" replace/>;
    }
    const client = clients.find((item) => item.id === clientId);
    if (!client && clients.length === 0) {
        return <LoadingScreen label="Loading…"/>;
    }
    if (!client) {
        return <Navigate to="/clients" replace/>;
    }
    return (<div className="mx-auto w-full max-w-4xl space-y-6">
      <DocumentTitle title={`Edit Client · ${client.name}`}/>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Edit client
        </h1>
        <p className="text-sm text-muted-foreground">
          Update {client.name}&apos;s details, links, and files.
        </p>
      </div>
      <ClientForm mode="edit" client={client}/>
    </div>);
};
