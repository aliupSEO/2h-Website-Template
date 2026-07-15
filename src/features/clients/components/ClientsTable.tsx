import { Link } from 'react-router-dom'

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import type { Client } from '@/features/clients/types'

import { ClientStatusBadge } from './ClientStatusBadge'

type ClientsTableProps = {
  clients: Client[]
  onDelete: (client: Client) => void
}

export function ClientsTable({ clients, onDelete }: ClientsTableProps) {
  return (
    <div className="rounded-xl border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Links</TableHead>
            <TableHead>Files</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const fileCount =
              client.logos.length +
              client.assets.length +
              client.documents.length

            return (
              <TableRow key={client.id} className="border-white/5">
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>+{client.phone}</TableCell>
                <TableCell>
                  <ClientStatusBadge status={client.status} />
                </TableCell>
                <TableCell>{client.links.length}</TableCell>
                <TableCell>{fileCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/clients/${client.id}/edit`}>Edit</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(client)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
