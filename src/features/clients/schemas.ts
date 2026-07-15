import { z } from 'zod'

import type { ClientStatus } from './types'

export const CLIENT_STATUSES: {
  value: ClientStatus
  label: string
}[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
]

const clientLinkSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Link title is required'),
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Enter a valid URL'),
})

const clientFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  dataUrl: z.string(),
})

export const clientFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email'),
  phone: z.string().min(5, 'Phone is required'),
  status: z.enum(['active', 'inactive', 'draft']),
  links: z.array(clientLinkSchema),
  logos: z.array(clientFileSchema),
  assets: z.array(clientFileSchema),
  documents: z.array(clientFileSchema),
})

export type ClientFormValues = z.infer<typeof clientFormSchema>
