import { create } from 'zustand';
import {
    GIT_CACHE_TTL_MS,
    GIT_SESSION_CACHE_KEY,
    REPOS_PER_PAGE,
} from '@/features/git/constants';
import type { CreateRepoInput, GitRepo, UpdateRepoInput } from '@/features/git/types';
import { githubService } from '@/services/githubService';

type PageCache = {
    repos: GitRepo[];
    hasNextPage: boolean;
    fetchedAt: number;
};

type SessionCache = {
    page: number;
    perPage: number;
    pageCache: Record<number, PageCache>;
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
    return Date.now() - fetchedAt < GIT_CACHE_TTL_MS;
};

const writeSessionCache = (cache: SessionCache) => {
    if (typeof sessionStorage === 'undefined') return;
    try {
        sessionStorage.setItem(GIT_SESSION_CACHE_KEY, JSON.stringify(cache));
    }
    catch {
        // quota / private mode — ignore
    }
};

const clearSessionCache = () => {
    if (typeof sessionStorage === 'undefined') return;
    try {
        sessionStorage.removeItem(GIT_SESSION_CACHE_KEY);
    }
    catch {
        // ignore
    }
};

export const useGitStore = create<GitState>((set, get) => ({
    repos: [],
    page: 1,
    perPage: REPOS_PER_PAGE,
    hasNextPage: false,
    loading: false,
    error: null,
    pageCache: {},

    invalidate: () => {
        clearSessionCache();
        set({ pageCache: {} });
    },

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

        // Full-page robot when there is nothing on screen yet.
        const showPageLoader = state.repos.length === 0;
        set({
            loading: showPageLoader,
            error: null,
            ...(cached && !showPageLoader
                ? {
                      repos: cached.repos,
                      page: nextPage,
                      hasNextPage: cached.hasNextPage,
                  }
                : {}),
        });

        try {
            const result = await githubService.listRepos(nextPage, state.perPage);
            const fetchedAt = Date.now();
            const pageCache = {
                ...get().pageCache,
                [result.page]: {
                    repos: result.repos,
                    hasNextPage: result.hasNextPage,
                    fetchedAt,
                },
            };

            writeSessionCache({
                page: result.page,
                perPage: result.perPage,
                pageCache,
            });

            set({
                repos: result.repos,
                page: result.page,
                perPage: result.perPage,
                hasNextPage: result.hasNextPage,
                loading: false,
                error: null,
                pageCache,
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
        clearSessionCache();
        set({ pageCache: {} });
        await get().fetchRepos({ page: 1, force: true });
        return repo;
    },

    updateRepo: async (owner, name, input) => {
        const repo = await githubService.updateRepo(owner, name, input);
        const { page } = get();
        clearSessionCache();
        set({ pageCache: {} });
        await get().fetchRepos({ page, force: true });
        return repo;
    },

    deleteRepo: async (owner, name) => {
        await githubService.deleteRepo(owner, name);
        const { page, repos } = get();
        const isLastOnPage = repos.length === 1 && page > 1;

        clearSessionCache();
        set({ pageCache: {} });
        await get().fetchRepos({
            page: isLastOnPage ? page - 1 : page,
            force: true,
        });
    },
}));
