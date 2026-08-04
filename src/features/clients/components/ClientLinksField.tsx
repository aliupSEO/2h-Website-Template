import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button, FormField, Input } from '@/components/ui';
import type { ClientFormValues } from '@/features/clients/schemas';
import { createId } from '@/features/clients/utils';
export const ClientLinksField = () => {
    const { control, register, formState: { errors }, } = useFormContext<ClientFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'links',
    });
    return (<div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Links</p>
          <p className="text-xs text-muted-foreground">
            Add titled URLs for this client.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="h-9 border-white/10 bg-transparent hover:bg-white/5" onClick={() => append({ id: createId('link'), title: '', url: '' })}>
          <Plus data-icon="inline-start"/>
          Add link
        </Button>
      </div>

      {fields.length === 0 ? (<p className="rounded-lg bg-[#2a2a2a] px-3 py-3 text-xs text-muted-foreground">
          No links yet.
        </p>) : (<div className="space-y-3">
          {fields.map((field, index) => (<div key={field.id} className="grid gap-4 rounded-xl border border-white/5 bg-transparent p-4 sm:grid-cols-[1fr_1.4fr_auto]">
              <FormField label="Title" htmlFor={`link-title-${field.id}`} required error={errors.links?.[index]?.title?.message}>
                <Input id={`link-title-${field.id}`} placeholder="Website" className="h-11 rounded-md border-transparent bg-[#2a2a2a]" {...register(`links.${index}.title`)}/>
              </FormField>
              <FormField label="URL" htmlFor={`link-url-${field.id}`} required error={errors.links?.[index]?.url?.message}>
                <Input id={`link-url-${field.id}`} placeholder="https://example.com" className="h-11 rounded-md border-transparent bg-[#2a2a2a]" {...register(`links.${index}.url`)}/>
              </FormField>
              <div className="flex items-end">
                <Button type="button" variant="ghost" className="h-11 w-11 rounded-md text-muted-foreground hover:bg-destructive hover:text-white" onClick={() => remove(index)} aria-label="Remove link">
                  <Trash2 className="size-5" />
                </Button>
              </div>
            </div>))}
        </div>)}
    </div>);
};
