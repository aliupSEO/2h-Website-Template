import { create } from 'zustand'

import { clientsService } from '@/services/clientsService'
import type {
  Client,
  ClientInput,
  ClientsViewMode,
} from '@/features/clients/types'

type ClientsState = {
  clients: Client[]
  viewMode: ClientsViewMode
  hydrate: () => void
  setViewMode: (mode: ClientsViewMode) => void
  createClient: (input: ClientInput) => Client
  updateClient: (id: string, input: ClientInput) => Client | undefined
  deleteClient: (id: string) => boolean
}

export const useClientsStore = create<ClientsState>((set) => ({
  clients: [],
  viewMode: 'table',
  hydrate: () => set({ clients: clientsService.list() }),
  setViewMode: (viewMode) => set({ viewMode }),
  createClient: (input) => {
    const client = clientsService.create(input)
    set({ clients: clientsService.list() })
    return client
  },
  updateClient: (id, input) => {
    const client = clientsService.update(id, input)
    set({ clients: clientsService.list() })
    return client
  },
  deleteClient: (id) => {
    const ok = clientsService.remove(id)
    if (ok) set({ clients: clientsService.list() })
    return ok
  },
}))
