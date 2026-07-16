export type GitHubEnv = {
    token: string;
    org: string | null;
};

export const getGitHubEnv = (): GitHubEnv => {
    const token = process.env.GITHUB_TOKEN?.trim();
    if (!token) {
        throw new Error('GITHUB_TOKEN is not set');
    }

    const org = process.env.GITHUB_ORG?.trim() || null;
    return { token, org };
};
