export type HubEnvVarDto = {
    id: string;
    key: string;
    updatedAt: string;
    createdAt: string;
};

export type HubEnvApiErrorBody = {
    error: string;
    status: number;
};

export type UpsertEnvVarInput = {
    key: string;
    value: string;
};

export type ImportEnvResult = {
    imported: number;
    updated: number;
    skipped: number;
};
