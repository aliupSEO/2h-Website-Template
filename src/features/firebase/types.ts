export type FirebaseAppPlatform = 'web' | 'ios' | 'android';

export type FirebaseProject = {
    projectId: string;
    displayName: string;
    state: string;
    projectNumber?: string;
};

export type FirebaseAvailableProject = {
    projectId: string;
    displayName: string;
};

export type FirebaseApp = {
    appId: string;
    platform: FirebaseAppPlatform;
    displayName: string;
    namespace?: string | null;
    bundleId?: string | null;
    packageName?: string | null;
};

export type FirebaseWebAppConfig = {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
    [key: string]: string | undefined;
};

export type FirebaseAuthConfig = {
    authorizedDomains: string[];
};

export type FirebaseIdpProvider = {
    name: string;
    idpId: string;
    enabled: boolean;
    clientId?: string | null;
};

export type FirebaseStatus = {
    configured: boolean;
    defaultProjectId: string | null;
};

export type AddFirebaseInput = {
    projectId: string;
};

export type CreateWebAppInput = {
    displayName: string;
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
