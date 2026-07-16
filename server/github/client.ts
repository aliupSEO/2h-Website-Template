import { getGitHubEnv } from './env.js';
import type {
    CreateRepoInput,
    GitHubRepoDto,
    ListReposQuery,
    ListReposResult,
    UpdateRepoInput,
} from './types.js';

export const DEFAULT_REPOS_PER_PAGE = 50;

const GITHUB_API = 'https://api.github.com';
const API_VERSION = '2022-11-28';

type GitHubRepoRaw = {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    clone_url: string;
    description: string | null;
    default_branch: string;
    updated_at: string;
    owner: { login: string };
};

const mapRepo = (repo: GitHubRepoRaw): GitHubRepoDto => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    private: repo.private,
    htmlUrl: repo.html_url,
    cloneUrl: repo.clone_url,
    description: repo.description,
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at,
});

const githubFetch = async <T>(
    path: string,
    init?: RequestInit,
): Promise<T> => {
    const { token } = getGitHubEnv();
    const response = await fetch(`${GITHUB_API}${path}`, {
        ...init,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': API_VERSION,
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });

    if (!response.ok) {
        let message = `GitHub API error (${response.status})`;
        try {
            const body = (await response.json()) as { message?: string };
            if (body.message) message = body.message;
        }
        catch {
            // ignore parse errors
        }
        const error = new Error(message) as Error & { status?: number };
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
};

export const listRepos = async (
    query: ListReposQuery = {},
): Promise<ListReposResult> => {
    const { org } = getGitHubEnv();
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.min(100, Math.max(1, query.perPage ?? DEFAULT_REPOS_PER_PAGE));
    const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
        sort: 'updated',
    });

    const path = org
        ? `/orgs/${encodeURIComponent(org)}/repos?${params}`
        : `/user/repos?${params}&affiliation=owner,collaborator,organization_member`;

    const repos = await githubFetch<GitHubRepoRaw[]>(path);
    return {
        repos: repos.map(mapRepo),
        page,
        perPage,
        hasNextPage: repos.length === perPage,
    };
};

export const createRepo = async (
    input: CreateRepoInput,
): Promise<GitHubRepoDto> => {
    const { org } = getGitHubEnv();
    const path = org
        ? `/orgs/${encodeURIComponent(org)}/repos`
        : '/user/repos';

    const repo = await githubFetch<GitHubRepoRaw>(path, {
        method: 'POST',
        body: JSON.stringify({
            name: input.name.trim(),
            description: input.description?.trim() || undefined,
            private: input.private ?? false,
            auto_init: input.autoInit ?? false,
        }),
    });

    return mapRepo(repo);
};

export const updateRepo = async (
    owner: string,
    repoName: string,
    input: UpdateRepoInput,
): Promise<GitHubRepoDto> => {
    const repo = await githubFetch<GitHubRepoRaw>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                ...(input.name !== undefined ? { name: input.name.trim() } : {}),
                ...(input.description !== undefined
                    ? { description: input.description.trim() || null }
                    : {}),
                ...(input.private !== undefined ? { private: input.private } : {}),
            }),
        },
    );

    return mapRepo(repo);
};

export const deleteRepo = async (
    owner: string,
    repoName: string,
): Promise<void> => {
    await githubFetch<void>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}`,
        { method: 'DELETE' },
    );
};
