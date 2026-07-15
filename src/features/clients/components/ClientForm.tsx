import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Loading } from '@/components/common'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { CLIENT_STATUSES, clientFormSchema, type ClientFormValues } from '@/features/clients/schemas'
import type { Client } from '@/features/clients/types'
import { toast } from '@/lib/toast'
import { useClientsStore } from '@/stores/clientsStore'

import { ClientFilesField } from './ClientFilesField'
import { ClientLinksField } from './ClientLinksField'
import { PhoneField } from './PhoneField'

type ClientFormProps = {
  mode: 'create' | 'edit'
  client?: Client
}

const EMPTY_VALUES: ClientFormValues = {
  name: '',
  email: '',
  phone: '',
  status: 'draft',
  links: [],
  logos: [],
  assets: [],
  documents: [],
}

export function ClientForm({ mode, client }: ClientFormProps) {
  const navigate = useNavigate()
  const createClient = useClientsStore((state) => state.createClient)
  const updateClient = useClientsStore((state) => state.updateClient)

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: client
      ? {
          name: client.name,
          email: client.email,
          phone: client.phone.replace(/\D/g, ''),
          status: client.status,
          links: client.links,
          logos: client.logos,
          assets: client.assets,
          documents: client.documents,
        }
      : EMPTY_VALUES,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form

  async function onSubmit(values: ClientFormValues) {
    try {
      if (mode === 'create') {
        createClient(values)
        toast.success('Client created')
      } else if (client) {
        updateClient(client.id, values)
        toast.success('Client updated')
      }
      navigate('/clients')
    } catch {
      toast.error(mode === 'create' ? 'Could not create client' : 'Could not update client')
    }
  }

  return (
    <FormProvider {...form}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card className="relative z-20 overflow-visible">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Core contact info and client status.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 overflow-visible sm:grid-cols-2">
            <FormField
              label="Name"
              htmlFor="client-name"
              required
              error={errors.name?.message}
            >
              <Input
                id="client-name"
                placeholder="Acme Corp"
                className="h-10"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
            </FormField>

            <FormField
              label="Email"
              htmlFor="client-email"
              required
              error={errors.email?.message}
            >
              <Input
                id="client-email"
                type="email"
                placeholder="contact@acme.com"
                className="h-10"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </FormField>

            <PhoneField
              id="client-phone"
              required
              value={watch('phone')}
              onChange={(value) =>
                setValue('phone', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={errors.phone?.message}
            />

            <FormField
              label="Status"
              htmlFor="client-status"
              required
              error={errors.status?.message}
            >
              <Select
                value={watch('status')}
                onValueChange={(value) =>
                  setValue('status', value as ClientFormValues['status'], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="client-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="border-0 bg-card shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
                  {CLIENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>
              Multiple titled links for portals, docs, or sites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientLinksField />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>
              Logos, assets, and PDF/document uploads (one or many).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ClientFilesField
              name="logos"
              title="Logos"
              description="Brand marks and logo variants."
              accept="image/*"
              multiple
            />
            <ClientFilesField
              name="assets"
              title="Assets"
              description="Images or other media files."
              accept="image/*,video/*,.zip,.svg"
              multiple
            />
            <ClientFilesField
              name="documents"
              title="Documents"
              description="PDFs and other documents."
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              multiple
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/clients')}
          >
            Cancel
          </Button>
          <Button type="submit" variant="brand" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loading size="sm" />
            ) : mode === 'create' ? (
              'Create client'
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
