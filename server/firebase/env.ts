export type FirebaseEnv = {
    defaultProjectId: string | null;
    credentialsPath: string | null;
    serviceAccountJson: string | null;
};

export const getFirebaseEnv = (): FirebaseEnv => {
    const defaultProjectId =
        process.env.FIREBASE_PROJECT_ID?.trim() || null;
    const credentialsPath =
        process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() || null;
    const serviceAccountJson =
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() || null;

    return {
        defaultProjectId,
        credentialsPath,
        serviceAccountJson,
    };
};

export const isFirebaseConfigured = (): boolean => {
    const env = getFirebaseEnv();
    return Boolean(env.credentialsPath || env.serviceAccountJson);
};
