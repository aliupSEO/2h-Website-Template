export type Plugin = {
    id: string;
    name: string;
    description: string | null;
    fileName: string | null;
    mimeType: string | null;
    sizeBytes: number | null;
    storagePath: string | null;
    createdAt: string;
    updatedAt: string;
};

export type PluginInput = {
    name: string;
    description?: string | null;
    file?: File | null;
    removeFile?: boolean;
};
