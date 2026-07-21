import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCreateWebApp } from '../../../../../server/firebase/handlers.js';

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
    const projectId = String(req.query.projectId ?? '');

    if (req.method === 'POST') {
        const result = await handleCreateWebApp(projectId, readBody(req));
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
