import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleListDeployments } from '../../../../server/vercel/handlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const projectId =
        typeof req.query.projectId === 'string' ? req.query.projectId : '';

    if (req.method === 'GET') {
        const rawLimit =
            typeof req.query.limit === 'string' ? Number(req.query.limit) : NaN;
        const limit = Number.isFinite(rawLimit) ? rawLimit : undefined;
        const result = await handleListDeployments(projectId, limit);
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
