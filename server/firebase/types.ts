export type FirebaseApiErrorBody = {
    error: string;
    status: number;
};

export type FirebaseProjectDto = {
    projectId: string;
    displayName: string;
    state: string;
    projectNumber?: string;
};

export type FirebaseAvailableProjectDto = {
    projectId: string;
    displayName: string;
};

export type FirebaseAppPlatform = 'web' | 'ios' | 'android';

export type FirebaseAppDto = {
    appId: string;
    platform: FirebaseAppPlatform;
    displayName: string;
    namespace?: string | null;
    bundleId?: string | null;
    packageName?: string | null;
};

export type FirebaseWebAppConfigDto = {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
    [key: string]: string | undefined;
};

export type FirebaseAuthConfigDto = {
    authorizedDomains: string[];
};

export type FirebaseIdpProviderDto = {
    name: string;
    idpId: string;
    enabled: boolean;
    clientId?: string | null;
};

export type AddFirebaseInput = {
    projectId: string;
};

export type CreateWebAppInput = {
    displayName: string;
};

export type UpdateAuthConfigInput = {
    authorizedDomains: string[];
};

export type UpsertIdpProviderInput = {
    idpId: string;
    enabled: boolean;
    clientId: string;
    clientSecret?: string;
};

export type EnableFirestoreInput = {
    locationId?: string;
};

export type EnableStorageInput = {
    location?: string;
    bucketName?: string;
};
