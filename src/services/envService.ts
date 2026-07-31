import type {
    HubEnvVar,
    ImportEnvResult,
    RevealedEnvVar,
    UpdateEnvVarInput,
    UpsertEnvVarInput,
} from '@/features/env/types';
import { apiEndpoints } from '@/lib/api-endpoints';
import { getSupabaseClient } from '@/lib/supabase';

const parseError = async (response: Response) => {
    try {
        const body = (await response.json()) as { error?: string };
        if (body.error) return body.error;
    }
    catch {
        // ignore
    }
    return `Request failed (${response.status})`;
};

const getAccessToken = async () => {
    const { data, error } = await getSupabaseClient().auth.getSession();
    if (error) throw error;
    const token = data.session?.access_token;
    if (!token) throw new Error('Your session expired. Sign in again.');
    return token;
};

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const token = await getAccessToken();
    const response = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...init?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(await parseError(response));
    }

    return (await response.json()) as T;
};

export const envService = {
    listVars: async (): Promise<HubEnvVar[]> => {
        const data = await request<{ vars: HubEnvVar[] }>(apiEndpoints.env.vars);
        return data.vars;
    },

    upsertVar: async (input: UpsertEnvVarInput): Promise<HubEnvVar> => {
        const data = await request<{ var: HubEnvVar }>(apiEndpoints.env.vars, {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return data.var;
    },

    updateVar: async (
        id: string,
        input: UpdateEnvVarInput,
    ): Promise<HubEnvVar> => {
        const data = await request<{ var: HubEnvVar }>(apiEndpoints.env.var(id), {
            method: 'PATCH',
            body: JSON.stringify(input),
        });
        return data.var;
    },

    deleteVar: async (id: string): Promise<void> => {
        await request<{ deleted: true }>(apiEndpoints.env.var(id), {
            method: 'DELETE',
        });
    },

    revealVar: async (id: string): Promise<RevealedEnvVar> => {
        return request<RevealedEnvVar>(apiEndpoints.env.reveal(id), {
            method: 'POST',
        });
    },

    importFile: async (content: string): Promise<ImportEnvResult> => {
        return request<ImportEnvResult>(apiEndpoints.env.import, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    },
};
