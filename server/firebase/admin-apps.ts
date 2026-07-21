import {
    cert,
    getApps,
    initializeApp,
    type App,
    type ServiceAccount,
} from 'firebase-admin/app';
import { loadServiceAccount } from './credentials.js';
import { resolveCredentialSource } from './registry.js';

const apps = new Map<string, App>();

export const getFirebaseAdminApp = (projectId: string): App => {
    const existing = apps.get(projectId);
    if (existing) return existing;

    const entry = resolveCredentialSource(projectId);
    if (entry.source === 'secret_ref') {
        throw new Error(
            `Per-project secret_ref credentials are not wired yet for ${projectId}`,
        );
    }

    const already = getApps().find((app) => app.name === projectId);
    if (already) {
        apps.set(projectId, already);
        return already;
    }

    const serviceAccount = loadServiceAccount();
    const app = initializeApp(
        {
            credential: cert(serviceAccount as ServiceAccount),
            projectId,
        },
        projectId,
    );

    apps.set(projectId, app);
    return app;
};
