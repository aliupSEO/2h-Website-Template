import {
    createRepo,
    deleteRepo,
    listRepos,
    updateRepo,
} from './client.js';
import type {
    CreateRepoInput,
    GitHubApiErrorBody,
    GitHubRepoDto,
    ListReposQuery,
    ListReposResult,
    UpdateRepoInput,
} from './types.js';

const parseListReposQuery = (query: Record<string, unknown>): ListReposQuery => {
    const pageRaw = query.page;
    const perPageRaw = query.per_page ?? query.perPage;

    const page =
        typeof pageRaw === 'string' && pageRaw.trim()
            ? Number.parseInt(pageRaw, 10)
            : 1;
    const perPage =
        typeof perPageRaw === 'string' && perPageRaw.trim()
            ? Number.parseInt(perPageRaw, 10)
            : undefined;

    return {
        page: Number.isFinite(page) && page > 0 ? page : 1,
        perPage: Number.isFinite(perPage) && perPage! > 0 ? perPage : undefined,
    };
};

export type HandlerResult<T> =
    | { ok: true; data: T; status: number }
    | { ok: false; body: GitHubApiErrorBody; status: number };

const repoNamePattern = /^[a-zA-Z0-9._-]+$/;

const validateCreateInput = (body: unknown): CreateRepoInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';

    const input = body as Record<string, unknown>;
    const name = typeof input.name === 'string' ? input.name.trim() : '';

    if (!name) return 'Repository name is required';
    if (!repoNamePattern.test(name)) {
        return 'Repository name can only contain letters, numbers, dots, hyphens, and underscores';
    }

    return {
        name,
        description:
            typeof input.description === 'string' ? input.description : undefined,
        private: typeof input.private === 'boolean' ? input.private : undefined,
        autoInit: typeof input.autoInit === 'boolean' ? input.autoInit : undefined,
    };
};

const validateUpdateInput = (body: unknown): UpdateRepoInput | string => {
    if (!body || typeof body !== 'object') return 'Invalid request body';

    const input = body as Record<string, unknown>;
    const result: UpdateRepoInput = {};

    if (input.name !== undefined) {
        if (typeof input.name !== 'string' || !input.name.trim()) {
            return 'Repository name cannot be empty';
        }
        if (!repoNamePattern.test(input.name.trim())) {
            return 'Repository name can only contain letters, numbers, dots, hyphens, and underscores';
        }
        result.name = input.name.trim();
    }

    if (input.description !== undefined) {
        if (typeof input.description !== 'string') {
            return 'Description must be a string';
        }
        result.description = input.description;
    }

    if (input.private !== undefined) {
        if (typeof input.private !== 'boolean') {
            return 'Private must be a boolean';
        }
        result.private = input.private;
    }

    if (
        result.name === undefined &&
        result.description === undefined &&
        result.private === undefined
    ) {
        return 'No fields to update';
    }

    return result;
};

const toError = (error: unknown): GitHubApiErrorBody => {
    if (error instanceof Error) {
        const status =
            'status' in error && typeof error.status === 'number'
                ? error.status
                : 500;
        return { error: error.message, status };
    }
    return { error: 'Unexpected server error', status: 500 };
};

export const handleListRepos = async (
    query: Record<string, unknown> = {},
): Promise<HandlerResult<ListReposResult>> => {
    try {
        const result = await listRepos(parseListReposQuery(query));
        return { ok: true, data: result, status: 200 };
    }
    catch (error) {
        const body = toError(error);
        return { ok: false, body, status: body.status };
    }
};

export const handleCreateRepo = async (
    body: unknown,
): Promise<HandlerResult<{ repo: GitHubRepoDto }>> => {
    const validated = validateCreateInput(body);
    if (typeof validated === 'string') {
        return {
            ok: false,
            body: { error: validated, status: 400 },
            status: 400,
        };
    }

    try {
        const repo = await createRepo(validated);
        return { ok: true, data: { repo }, status: 201 };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, body: errBody, status: errBody.status };
    }
};

export const handleUpdateRepo = async (
    owner: string,
    repoName: string,
    body: unknown,
): Promise<HandlerResult<{ repo: GitHubRepoDto }>> => {
    if (!owner || !repoName) {
        return {
            ok: false,
            body: { error: 'Owner and repository name are required', status: 400 },
            status: 400,
        };
    }

    const validated = validateUpdateInput(body);
    if (typeof validated === 'string') {
        return {
            ok: false,
            body: { error: validated, status: 400 },
            status: 400,
        };
    }

    try {
        const repo = await updateRepo(owner, repoName, validated);
        return { ok: true, data: { repo }, status: 200 };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, body: errBody, status: errBody.status };
    }
};

export const handleDeleteRepo = async (
    owner: string,
    repoName: string,
): Promise<HandlerResult<{ deleted: true }>> => {
    if (!owner || !repoName) {
        return {
            ok: false,
            body: { error: 'Owner and repository name are required', status: 400 },
            status: 400,
        };
    }

    try {
        await deleteRepo(owner, repoName);
        return { ok: true, data: { deleted: true }, status: 200 };
    }
    catch (error) {
        const errBody = toError(error);
        return { ok: false, body: errBody, status: errBody.status };
    }
};
