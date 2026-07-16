export type GitRepo = {
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
    private: boolean;
    autoInit: boolean;
};

export type UpdateRepoInput = {
    name?: string;
    description?: string;
    private?: boolean;
};

export type GitRepoListResult = {
    repos: GitRepo[];
    page: number;
    perPage: number;
    hasNextPage: boolean;
};
