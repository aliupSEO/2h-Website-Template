export type VercelEnv = {
    token: string;
    teamId: string | null;
};

export const getVercelEnv = (): VercelEnv => {
    const token = process.env.VERCEL_TOKEN?.trim();
    if (!token) {
        throw new Error('VERCEL_TOKEN is not set');
    }

    const teamId = process.env.VERCEL_TEAM_ID?.trim() || null;
    return { token, teamId };
};

export const withTeamQuery = (path: string, teamId: string | null) => {
    if (!teamId) return path;
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}teamId=${encodeURIComponent(teamId)}`;
};
