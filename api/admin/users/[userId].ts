import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpdateUser } from '../../../server/admin/handlers.js';

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
    const userId = req.query.userId;
    if (typeof userId !== 'string' || !userId.trim()) {
        return res.status(400).json({ error: 'User id is required', status: 400 });
    }

    if (req.method === 'PATCH') {
        const result = await handleUpdateUser(
            req.headers.authorization,
            userId,
            readBody(req),
        );
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
