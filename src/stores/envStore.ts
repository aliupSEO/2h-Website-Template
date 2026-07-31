import { create } from 'zustand';
import type {
    HubEnvVar,
    ImportEnvResult,
    RevealedEnvVar,
    UpdateEnvVarInput,
    UpsertEnvVarInput,
} from '@/features/env/types';
import { envService } from '@/services/envService';

type EnvStore = {
    vars: HubEnvVar[];
    loading: boolean;
    error: string | null;
    fetchVars: () => Promise<void>;
    upsertVar: (input: UpsertEnvVarInput) => Promise<HubEnvVar>;
    updateVar: (id: string, input: UpdateEnvVarInput) => Promise<HubEnvVar>;
    deleteVar: (id: string) => Promise<void>;
    revealVar: (id: string) => Promise<RevealedEnvVar>;
    importFile: (content: string) => Promise<ImportEnvResult>;
};

const sortByKey = (vars: HubEnvVar[]) =>
    [...vars].sort((a, b) => a.key.localeCompare(b.key));

export const useEnvStore = create<EnvStore>((set, get) => ({
    vars: [],
    loading: false,
    error: null,

    fetchVars: async () => {
        set({ loading: true, error: null });
        try {
            const vars = await envService.listVars();
            set({ vars: sortByKey(vars), loading: false });
        }
        catch (error) {
            set({
                loading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Could not load env variables',
            });
            throw error;
        }
    },

    upsertVar: async (input) => {
        const item = await envService.upsertVar(input);
        const without = get().vars.filter((row) => row.id !== item.id && row.key !== item.key);
        set({ vars: sortByKey([...without, item]), error: null });
        return item;
    },

    updateVar: async (id, input) => {
        const item = await envService.updateVar(id, input);
        set({
            vars: sortByKey(
                get().vars.map((row) => (row.id === id ? item : row)),
            ),
            error: null,
        });
        return item;
    },

    deleteVar: async (id) => {
        await envService.deleteVar(id);
        set({
            vars: get().vars.filter((row) => row.id !== id),
            error: null,
        });
    },

    revealVar: async (id) => {
        return envService.revealVar(id);
    },

    importFile: async (content) => {
        const result = await envService.importFile(content);
        await get().fetchVars();
        return result;
    },
}));
