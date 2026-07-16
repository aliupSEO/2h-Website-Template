export type GitHubRepoDto = {
    id: number;
    name: string;
    fullName: string;
    owner: string;
    private: boolean;
    htmlUrl: string;
    cloneUrl: string;
    description: string | null;
    defaultBranch: string;
    updatedAt: string;
};

export type CreateRepoInput = {
    name: string;
    description?: string;
    private?: boolean;
    autoInit?: boolean;
};

export type UpdateRepoInput = {
    name?: string;
    description?: string;
    private?: boolean;
};

export type GitHubApiErrorBody = {
    error: string;
    status: number;
};

export type ListReposQuery = {
    page?: number;
    perPage?: number;
};

export type ListReposResult = {
    repos: GitHubRepoDto[];
    page: number;
    perPage: number;
    hasNextPage: boolean;
};
