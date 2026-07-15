import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { Button, FormField, Input } from '@/components/ui'
import type { ClientFormValues } from '@/features/clients/schemas'
import { createId } from '@/features/clients/utils'

export function ClientLinksField() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ClientFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'links',
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Links</p>
          <p className="text-xs text-muted-foreground">
            Add titled URLs for this client.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ id: createId('link'), title: '', url: '' })
          }
        >
          <Plus data-icon="inline-start" />
          Add link
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg bg-muted/60 px-3 py-3 text-xs text-muted-foreground">
          No links yet.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-xl bg-muted/40 p-3 sm:grid-cols-[1fr_1.4fr_auto]"
            >
              <FormField
                label="Title"
                htmlFor={`link-title-${field.id}`}
                required
                error={errors.links?.[index]?.title?.message}
              >
                <Input
                  id={`link-title-${field.id}`}
                  placeholder="Website"
                  {...register(`links.${index}.title`)}
                />
              </FormField>
              <FormField
                label="URL"
                htmlFor={`link-url-${field.id}`}
                required
                error={errors.links?.[index]?.url?.message}
              >
                <Input
                  id={`link-url-${field.id}`}
                  placeholder="https://example.com"
                  {...register(`links.${index}.url`)}
                />
              </FormField>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label="Remove link"
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
