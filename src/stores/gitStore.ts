import { create } from 'zustand';
import { REPOS_PER_PAGE } from '@/features/git/constants';
import type { CreateRepoInput, GitRepo, UpdateRepoInput } from '@/features/git/types';
import { githubService } from '@/services/githubService';

const CACHE_TTL_MS = 60_000;

type PageCache = {
    repos: GitRepo[];
    hasNextPage: boolean;
    fetchedAt: number;
};

type GitState = {
    repos: GitRepo[];
    page: number;
    perPage: number;
    hasNextPage: boolean;
    loading: boolean;
    error: string | null;
    pageCache: Record<number, PageCache>;
    fetchRepos: (options?: { page?: number; force?: boolean }) => Promise<void>;
    createRepo: (input: CreateRepoInput) => Promise<GitRepo>;
    updateRepo: (
        owner: string,
        name: string,
        input: UpdateRepoInput,
    ) => Promise<GitRepo>;
    deleteRepo: (owner: string, name: string) => Promise<void>;
    invalidate: () => void;
};

const isCacheFresh = (fetchedAt: number | null) => {
    if (!fetchedAt) return false;
    return Date.now() - fetchedAt < CACHE_TTL_MS;
};

export const useGitStore = create<GitState>((set, get) => ({
    repos: [],
    page: 1,
    perPage: REPOS_PER_PAGE,
    hasNextPage: false,
    loading: false,
    error: null,
    pageCache: {},

    invalidate: () => set({ pageCache: {} }),

    fetchRepos: async ({ page, force } = {}) => {
        const state = get();
        const nextPage = page ?? state.page;
        const cached = state.pageCache[nextPage];

        if (!force && cached && isCacheFresh(cached.fetchedAt)) {
            set({
                repos: cached.repos,
                page: nextPage,
                hasNextPage: cached.hasNextPage,
                error: null,
            });
            return;
        }

        if (state.loading) return;

        set({ loading: true, error: null });
        try {
            const result = await githubService.listRepos(nextPage, state.perPage);
            const fetchedAt = Date.now();

            set({
                repos: result.repos,
                page: result.page,
                perPage: result.perPage,
                hasNextPage: result.hasNextPage,
                loading: false,
                error: null,
                pageCache: {
                    ...get().pageCache,
                    [result.page]: {
                        repos: result.repos,
                        hasNextPage: result.hasNextPage,
                        fetchedAt,
                    },
                },
            });
        }
        catch (error) {
            set({
                loading: false,
                error: error instanceof Error ? error.message : 'Could not load repositories',
            });
            throw error;
        }
    },

    createRepo: async (input) => {
        const repo = await githubService.createRepo(input);
        set({ pageCache: {} });
        await get().fetchRepos({ page: 1, force: true });
        return repo;
    },

    updateRepo: async (owner, name, input) => {
        const repo = await githubService.updateRepo(owner, name, input);
        const { page } = get();
        set({ pageCache: {} });
        await get().fetchRepos({ page, force: true });
        return repo;
    },

    deleteRepo: async (owner, name) => {
        await githubService.deleteRepo(owner, name);
        const { page, repos } = get();
        const isLastOnPage = repos.length === 1 && page > 1;

        set({ pageCache: {} });
        await get().fetchRepos({
            page: isLastOnPage ? page - 1 : page,
            force: true,
        });
    },
}));
