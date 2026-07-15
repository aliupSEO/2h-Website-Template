import { Link } from 'react-router-dom'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import type { Client } from '@/features/clients/types'

import { ClientStatusBadge } from './ClientStatusBadge'

type ClientsCardGridProps = {
  clients: Client[]
  onDelete: (client: Client) => void
}

export function ClientsCardGrid({ clients, onDelete }: ClientsCardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {clients.map((client) => {
        const fileCount =
          client.logos.length + client.assets.length + client.documents.length

        return (
          <Card key={client.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="truncate">{client.name}</CardTitle>
                  <CardDescription className="truncate">
                    {client.email}
                  </CardDescription>
                </div>
                <ClientStatusBadge status={client.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>+{client.phone}</p>
              <p>
                {client.links.length} link
                {client.links.length === 1 ? '' : 's'} · {fileCount} file
                {fileCount === 1 ? '' : 's'}
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link to={`/clients/${client.id}/edit`}>Edit</Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="flex-1"
                onClick={() => onDelete(client)}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
