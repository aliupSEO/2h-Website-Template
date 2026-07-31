import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleListBranches } from '../../../../../server/github/handlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const owner = typeof req.query.owner === 'string' ? req.query.owner : '';
    const repo = typeof req.query.repo === 'string' ? req.query.repo : '';

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed', status: 405 });
    }

    const result = await handleListBranches(owner, repo);
    return res.status(result.status).json(result.ok ? result.data : result.body);
}
