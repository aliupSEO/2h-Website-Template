import type { ChangeEvent } from 'react';
import { FileUp, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui';
import type { ClientFormValues } from '@/features/clients/schemas';
import type { ClientFile } from '@/features/clients/types';
import { filesToClientFiles, formatFileSize } from '@/features/clients/utils';
type FileFieldKey = 'logos' | 'assets' | 'documents';
type ClientFilesFieldProps = {
    name: FileFieldKey;
    title: string;
    description: string;
    accept: string;
    multiple?: boolean;
};
export const ClientFilesField = ({ name, title, description, accept, multiple = true, }: ClientFilesFieldProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { watch, setValue } = useFormContext<ClientFormValues>();
    const files = watch(name);
    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files;
        if (!selected?.length)
            return;
        const nextFiles = await filesToClientFiles(selected);
        setValue(name, multiple ? [...files, ...nextFiles] : nextFiles, {
            shouldDirty: true,
            shouldValidate: true,
        });
        event.target.value = '';
    };
    const removeFile = (id: string) => {
        setValue(name, files.filter((file) => file.id !== id), { shouldDirty: true, shouldValidate: true });
    };
    return (<div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {files.length > 0 && (
          <Button type="button" variant="outline" size="sm" className="h-9 border-white/10 bg-transparent hover:bg-white/5" onClick={() => inputRef.current?.click()}>
            <FileUp data-icon="inline-start"/>
            Upload
          </Button>
        )}
        <input ref={inputRef} type="file" className="hidden" accept={accept} multiple={multiple} onChange={(event) => void handleChange(event)}/>
      </div>

      {files.length === 0 ? (
        <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-transparent py-8 transition-colors hover:bg-white/[0.02]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-black">
            <FileUp className="size-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">No files uploaded</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Click here to add files.</p>
          </div>
        </button>
      ) : (<ul className="space-y-2">
          {files.map((file: ClientFile) => (<li key={file.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-transparent p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button type="button" variant="ghost" className="size-9 shrink-0 rounded-md text-muted-foreground hover:bg-destructive hover:text-white" onClick={() => removeFile(file.id)} aria-label={`Remove ${file.name}`}>
                <Trash2 className="size-4" />
              </Button>
            </li>))}
        </ul>)}
    </div>);
};
