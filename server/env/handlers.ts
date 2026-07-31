import { requireAdmin } from '../admin/auth.js';
import { getSupabaseAdminClient } from '../supabase/admin-client.js';
import { decryptSecret, encryptSecret, hasEnvSecretsKey } from './crypto.js';
import type {
    HubEnvApiErrorBody,
    HubEnvVarDto,
    ImportEnvResult,
    UpsertEnvVarInput,
} from './types.js';

export type HandlerResult<T> =
    | { ok: true; data: T; status: number }
    | { ok: false; body: HubEnvApiErrorBody; status: number };

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const toError = (error: unknown, fallback = 'Unexpected server error'): HubEnvApiErrorBody => {
    if (error instanceof Error) {
        return { error: error.message, status: 500 };
    }
    return { error: fallback, status: 500 };
};

const ensureCrypto = (): HandlerResult<never> | null => {
    if (!hasEnvSecretsKey()) {
        return {
            ok: false,
            body: {
                error: 'ENV_SECRETS_KEY is not configured on the server',
                status: 503,
            },
            status: 503,
        };
    }
    return null;
};

const mapRow = (row: {
    id: string;
    key: string;
    created_at: string;
    updated_at: string;
}): HubEnvVarDto => ({
    id: row.id,
    key: row.key,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

const validateUpsert = (body: unknown): UpsertEnvVarInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';
    const input = body as Record<string, unknown>;
    const key = typeof input.key === 'string' ? input.key.trim() : '';
    const value = typeof input.value === 'string' ? input.value : '';

    if (!key) return 'Key is required';
    if (!KEY_PATTERN.test(key)) {
        return 'Key must start with a letter or underscore and use only letters, numbers, and underscores';
    }
    if (!value) return 'Value is required';
    if (value.length > 100_000) return 'Value is too large';

    return { key, value };
};

export const parseEnvFileContent = (content: string) => {
    const pairs: Array<{ key: string; value: string }> = [];
    let skipped = 0;

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
        if (!match) {
            skipped += 1;
            continue;
        }

        let value = match[2] ?? '';
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        pairs.push({ key: match[1]!, value });
    }

    return { pairs, skipped };
};

export const handleListEnvVars = async (
    authorization: string | undefined,
): Promise<HandlerResult<{ vars: HubEnvVarDto[] }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        const cryptoError = ensureCrypto();
        if (cryptoError) return cryptoError;

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
            .from('hub_env_vars')
            .select('id, key, created_at, updated_at')
            .order('key', { ascending: true });

        if (error) throw error;

        return {
            ok: true,
            status: 200,
            data: { vars: (data ?? []).map(mapRow) },
        };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleUpsertEnvVar = async (
    authorization: string | undefined,
    body: unknown,
): Promise<HandlerResult<{ var: HubEnvVarDto }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        const cryptoError = ensureCrypto();
        if (cryptoError) return cryptoError;

        const parsed = validateUpsert(body);
        if (typeof parsed === 'string') {
            return { ok: false, body: { error: parsed, status: 400 }, status: 400 };
        }

        const encrypted = encryptSecret(parsed.value);
        const admin = getSupabaseAdminClient();

        const { data: existing, error: existingError } = await admin
            .from('hub_env_vars')
            .select('id')
            .eq('key', parsed.key)
            .maybeSingle();

        if (existingError) throw existingError;

        const payload = {
            key: parsed.key,
            value_ciphertext: encrypted.ciphertext,
            value_iv: encrypted.iv,
            value_tag: encrypted.tag,
            updated_by: auth.admin.userId,
        };

        const { data, error } = existing
            ? await admin
                .from('hub_env_vars')
                .update(payload)
                .eq('id', existing.id)
                .select('id, key, created_at, updated_at')
                .single()
            : await admin
                .from('hub_env_vars')
                .insert({ ...payload, created_by: auth.admin.userId })
                .select('id, key, created_at, updated_at')
                .single();

        if (error) throw error;

        return { ok: true, status: 200, data: { var: mapRow(data) } };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleUpdateEnvVar = async (
    authorization: string | undefined,
    id: string,
    body: unknown,
): Promise<HandlerResult<{ var: HubEnvVarDto }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        const cryptoError = ensureCrypto();
        if (cryptoError) return cryptoError;

        if (!id.trim()) {
            return { ok: false, body: { error: 'Variable id is required', status: 400 }, status: 400 };
        }

        if (!body || typeof body !== 'object') {
            return { ok: false, body: { error: 'Invalid request body', status: 400 }, status: 400 };
        }

        const input = body as Record<string, unknown>;
        const value = typeof input.value === 'string' ? input.value : '';
        if (!value) {
            return { ok: false, body: { error: 'Value is required', status: 400 }, status: 400 };
        }
        if (value.length > 100_000) {
            return { ok: false, body: { error: 'Value is too large', status: 400 }, status: 400 };
        }

        const encrypted = encryptSecret(value);
        const admin = getSupabaseAdminClient();

        const { data, error } = await admin
            .from('hub_env_vars')
            .update({
                value_ciphertext: encrypted.ciphertext,
                value_iv: encrypted.iv,
                value_tag: encrypted.tag,
                updated_by: auth.admin.userId,
            })
            .eq('id', id)
            .select('id, key, created_at, updated_at')
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return { ok: false, body: { error: 'Variable not found', status: 404 }, status: 404 };
        }

        return { ok: true, status: 200, data: { var: mapRow(data) } };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleDeleteEnvVar = async (
    authorization: string | undefined,
    id: string,
): Promise<HandlerResult<{ deleted: true }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        if (!id.trim()) {
            return { ok: false, body: { error: 'Variable id is required', status: 400 }, status: 400 };
        }

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
            .from('hub_env_vars')
            .delete()
            .eq('id', id)
            .select('id')
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return { ok: false, body: { error: 'Variable not found', status: 404 }, status: 404 };
        }

        return { ok: true, status: 200, data: { deleted: true } };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleRevealEnvVar = async (
    authorization: string | undefined,
    id: string,
): Promise<HandlerResult<{ key: string; value: string }>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        const cryptoError = ensureCrypto();
        if (cryptoError) return cryptoError;

        if (!id.trim()) {
            return { ok: false, body: { error: 'Variable id is required', status: 400 }, status: 400 };
        }

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
            .from('hub_env_vars')
            .select('key, value_ciphertext, value_iv, value_tag')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            return { ok: false, body: { error: 'Variable not found', status: 404 }, status: 404 };
        }

        const value = decryptSecret({
            ciphertext: data.value_ciphertext,
            iv: data.value_iv,
            tag: data.value_tag,
        });

        return {
            ok: true,
            status: 200,
            data: { key: data.key, value },
        };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleImportEnvFile = async (
    authorization: string | undefined,
    body: unknown,
): Promise<HandlerResult<ImportEnvResult>> => {
    try {
        const auth = await requireAdmin(authorization);
        if (!auth.ok) {
            return { ok: false, body: { error: auth.error, status: auth.status }, status: auth.status };
        }

        const cryptoError = ensureCrypto();
        if (cryptoError) return cryptoError;

        if (!body || typeof body !== 'object') {
            return { ok: false, body: { error: 'Invalid request body', status: 400 }, status: 400 };
        }

        const content =
            typeof (body as Record<string, unknown>).content === 'string'
                ? ((body as Record<string, unknown>).content as string)
                : '';

        if (!content.trim()) {
            return {
                ok: false,
                body: { error: 'Env file content is required', status: 400 },
                status: 400,
            };
        }

        const { pairs, skipped } = parseEnvFileContent(content);
        if (pairs.length === 0) {
            return {
                ok: false,
                body: { error: 'No valid KEY=value lines found', status: 400 },
                status: 400,
            };
        }

        const admin = getSupabaseAdminClient();
        let imported = 0;
        let updated = 0;

        for (const pair of pairs) {
            const { data: existing } = await admin
                .from('hub_env_vars')
                .select('id')
                .eq('key', pair.key)
                .maybeSingle();

            const encrypted = encryptSecret(pair.value);
            const payload = {
                key: pair.key,
                value_ciphertext: encrypted.ciphertext,
                value_iv: encrypted.iv,
                value_tag: encrypted.tag,
                updated_by: auth.admin.userId,
            };

            const { error } = existing
                ? await admin
                    .from('hub_env_vars')
                    .update(payload)
                    .eq('id', existing.id)
                : await admin
                    .from('hub_env_vars')
                    .insert({ ...payload, created_by: auth.admin.userId });

            if (error) throw error;
            if (existing) updated += 1;
            else imported += 1;
        }

        return {
            ok: true,
            status: 200,
            data: { imported, updated, skipped },
        };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};
