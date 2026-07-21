import { readFileSync } from 'node:fs';
import { GoogleAuth, type JWTInput } from 'google-auth-library';
import { getFirebaseEnv } from './env.js';

const SCOPES = [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/firebase',
    'https://www.googleapis.com/auth/identitytoolkit',
];

export type ServiceAccountCredentials = JWTInput & {
    project_id?: string;
    client_email?: string;
    private_key?: string;
};

let cachedCredentials: ServiceAccountCredentials | null = null;
let cachedAuth: GoogleAuth | null = null;

export const loadServiceAccount = (): ServiceAccountCredentials => {
    if (cachedCredentials) return cachedCredentials;

    const env = getFirebaseEnv();

    if (env.serviceAccountJson) {
        try {
            cachedCredentials = JSON.parse(
                env.serviceAccountJson,
            ) as ServiceAccountCredentials;
            return cachedCredentials;
        }
        catch {
            throw new Error(
                'FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON',
            );
        }
    }

    if (env.credentialsPath) {
        try {
            const raw = readFileSync(env.credentialsPath, 'utf8');
            cachedCredentials = JSON.parse(raw) as ServiceAccountCredentials;
            return cachedCredentials;
        }
        catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            throw new Error(
                `Could not read GOOGLE_APPLICATION_CREDENTIALS: ${message}`,
            );
        }
    }

    throw new Error(
        'Firebase is not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.',
    );
};

export const getGoogleAuth = (): GoogleAuth => {
    if (cachedAuth) return cachedAuth;

    const credentials = loadServiceAccount();
    cachedAuth = new GoogleAuth({
        credentials,
        scopes: SCOPES,
    });
    return cachedAuth;
};

export const getAccessToken = async (): Promise<string> => {
    const auth = getGoogleAuth();
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token =
        typeof tokenResponse === 'string'
            ? tokenResponse
            : tokenResponse?.token;

    if (!token) {
        throw new Error('Could not mint Google access token for Firebase');
    }

    return token;
};

export const probeFirebaseCredentials = (): {
    configured: boolean;
    defaultProjectId: string | null;
} => {
    const env = getFirebaseEnv();
    if (!env.credentialsPath && !env.serviceAccountJson) {
        return { configured: false, defaultProjectId: env.defaultProjectId };
    }

    try {
        loadServiceAccount();
        return { configured: true, defaultProjectId: env.defaultProjectId };
    }
    catch {
        return { configured: false, defaultProjectId: env.defaultProjectId };
    }
};
