export type Plugin = {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
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
    isActive?: boolean;
    file?: File | null;
    removeFile?: boolean;
};
