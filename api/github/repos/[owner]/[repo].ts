import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    handleDeleteRepo,
    handleUpdateRepo,
} from '../../../../server/github/handlers.js';

const readBody = (req: VercelRequest): unknown => {
    if (!req.body) return {};
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body) as unknown;
        }
        catch {
            return {};
        }
    }
    return req.body;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const owner = typeof req.query.owner === 'string' ? req.query.owner : '';
    const repo = typeof req.query.repo === 'string' ? req.query.repo : '';

    if (req.method === 'PATCH') {
        const result = await handleUpdateRepo(owner, repo, readBody(req));
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    if (req.method === 'DELETE') {
        const result = await handleDeleteRepo(owner, repo);
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
