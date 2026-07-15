import type { ChangeEvent } from 'react'
import { FileUp, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui'
import type { ClientFormValues } from '@/features/clients/schemas'
import type { ClientFile } from '@/features/clients/types'
import { filesToClientFiles, formatFileSize } from '@/features/clients/utils'

type FileFieldKey = 'logos' | 'assets' | 'documents'

type ClientFilesFieldProps = {
  name: FileFieldKey
  title: string
  description: string
  accept: string
  multiple?: boolean
}

export function ClientFilesField({
  name,
  title,
  description,
  accept,
  multiple = true,
}: ClientFilesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { watch, setValue } = useFormContext<ClientFormValues>()
  const files = watch(name)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files
    if (!selected?.length) return

    const nextFiles = await filesToClientFiles(selected)
    setValue(name, multiple ? [...files, ...nextFiles] : nextFiles, {
      shouldDirty: true,
      shouldValidate: true,
    })
    event.target.value = ''
  }

  function removeFile(id: string) {
    setValue(
      name,
      files.filter((file) => file.id !== id),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <FileUp data-icon="inline-start" />
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(event) => void handleChange(event)}
        />
      </div>

      {files.length === 0 ? (
        <p className="rounded-lg bg-muted/60 px-3 py-3 text-xs text-muted-foreground">
          No files uploaded.
        </p>
      ) : (
        <ul className="space-y-2">
          {files.map((file: ClientFile) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(file.id)}
                aria-label={`Remove ${file.name}`}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
