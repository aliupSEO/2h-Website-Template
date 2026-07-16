import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleRedeploy } from '../../../../server/vercel/handlers.js';

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
    const deploymentId =
        typeof req.query.deploymentId === 'string' ? req.query.deploymentId : '';

    if (req.method === 'POST') {
        const result = await handleRedeploy(deploymentId, readBody(req));
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
