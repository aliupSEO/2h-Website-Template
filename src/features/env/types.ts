export type HubEnvVar = {
    id: string;
    key: string;
    createdAt: string;
    updatedAt: string;
};

export type UpsertEnvVarInput = {
    key: string;
    value: string;
};

export type UpdateEnvVarInput = {
    value: string;
};

export type ImportEnvResult = {
    imported: number;
    updated: number;
    skipped: number;
};

export type RevealedEnvVar = {
    key: string;
    value: string;
};
