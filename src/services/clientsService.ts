import type { Client, ClientInput } from '@/features/clients/types';
import { createId } from '@/features/clients/utils';
const STORAGE_KEY = '2h-central-hub.clients';
const readAll = (): Client[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw) as Array<Omit<Client, 'status'> & {
            status: Client['status'] | 'prospect';
        }>;
        if (!Array.isArray(parsed))
            return [];
        // Migrate legacy "prospect" → "draft"
        return parsed.map((client) => ({
            ...client,
            status: client.status === 'prospect' ? 'draft' : client.status,
        }));
    }
    catch {
        return [];
    }
};
const writeAll = (clients: Client[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
};
export const clientsService = {
    list(): Client[] {
        return readAll().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
    getById(id: string): Client | undefined {
        return readAll().find((client) => client.id === id);
    },
    create(input: ClientInput): Client {
        const now = new Date().toISOString();
        const client: Client = {
            ...input,
            id: createId('client'),
            createdAt: now,
            updatedAt: now,
        };
        const next = [client, ...readAll()];
        writeAll(next);
        return client;
    },
    update(id: string, input: ClientInput): Client | undefined {
        const clients = readAll();
        const index = clients.findIndex((client) => client.id === id);
        if (index < 0)
            return undefined;
        const updated: Client = {
            ...clients[index]!,
            ...input,
            id,
            updatedAt: new Date().toISOString(),
        };
        clients[index] = updated;
        writeAll(clients);
        return updated;
    },
    remove(id: string): boolean {
        const clients = readAll();
        const next = clients.filter((client) => client.id !== id);
        if (next.length === clients.length)
            return false;
        writeAll(next);
        return true;
    },
};
