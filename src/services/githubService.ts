import type {
    CreateRepoInput,
    GitRepo,
    GitRepoListResult,
    UpdateRepoInput,
} from '@/features/git/types';
import { REPOS_PER_PAGE } from '@/features/git/constants';
import { apiEndpoints } from '@/lib/api-endpoints';

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

const request = async <T>(
    url: string,
    init?: RequestInit,
): Promise<T> => {
    const response = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(await parseError(response));
    }

    return (await response.json()) as T;
};

export const githubService = {
    listRepos: async (
        page = 1,
        perPage = REPOS_PER_PAGE,
    ): Promise<GitRepoListResult> => {
        return request<GitRepoListResult>(
            apiEndpoints.github.repos({ page, perPage }),
        );
    },

    createRepo: async (input: CreateRepoInput): Promise<GitRepo> => {
        const data = await request<{ repo: GitRepo }>(apiEndpoints.github.repos(), {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return data.repo;
    },

    updateRepo: async (
        owner: string,
        name: string,
        input: UpdateRepoInput,
    ): Promise<GitRepo> => {
        const data = await request<{ repo: GitRepo }>(apiEndpoints.github.repo(owner, name), {
            method: 'PATCH',
            body: JSON.stringify(input),
        });
        return data.repo;
    },

    deleteRepo: async (owner: string, name: string): Promise<void> => {
        await request<{ deleted: true }>(apiEndpoints.github.repo(owner, name), {
            method: 'DELETE',
        });
    },
};
