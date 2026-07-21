export type CredentialSource = 'env_default' | 'secret_ref';

export type ProjectCredentialEntry = {
    projectId: string;
    source: CredentialSource;
    /** Future: encrypted secret id / Supabase row id */
    secretRef?: string;
};

/**
 * Multi-project registry. Phase 0–3: every project uses the default env SA.
 * Phase 5 can resolve `secret_ref` entries without changing call sites.
 */
const entries = new Map<string, ProjectCredentialEntry>();

export const registerProjectCredential = (
    entry: ProjectCredentialEntry,
): void => {
    entries.set(entry.projectId, entry);
};

export const resolveCredentialSource = (
    projectId: string,
): ProjectCredentialEntry => {
    return (
        entries.get(projectId) ?? {
            projectId,
            source: 'env_default',
        }
    );
};

export const listRegisteredProjects = (): ProjectCredentialEntry[] => {
    return [...entries.values()];
};
