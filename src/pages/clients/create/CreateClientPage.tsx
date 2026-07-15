import { ClientForm } from '@/features/clients'

export function CreateClientPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Create client
        </h1>
        <p className="text-sm text-muted-foreground">
          Add contact details, links, logos, assets, and documents.
        </p>
      </div>
      <ClientForm mode="create" />
    </div>
  )
}
