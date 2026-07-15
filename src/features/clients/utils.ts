import type { ClientFile } from '@/features/clients/types';
export const createId = (prefix = 'id') => {
    return `${prefix}_${crypto.randomUUID()}`;
};
export const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};
export const filesToClientFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const result: ClientFile[] = [];
    for (const file of list) {
        const dataUrl = await readFileAsDataUrl(file);
        result.push({
            id: createId('file'),
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            dataUrl,
        });
    }
    return result;
};
export const formatFileSize = (bytes: number) => {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
