export type ClientStatus = 'active' | 'inactive' | 'draft'

export type ClientLink = {
  id: string
  title: string
  url: string
}

export type ClientFile = {
  id: string
  name: string
  mimeType: string
  size: number
  dataUrl: string
}

export type Client = {
  id: string
  name: string
  email: string
  phone: string
  status: ClientStatus
  links: ClientLink[]
  logos: ClientFile[]
  assets: ClientFile[]
  documents: ClientFile[]
  createdAt: string
  updatedAt: string
}

export type ClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>

export type ClientsViewMode = 'table' | 'cards'
