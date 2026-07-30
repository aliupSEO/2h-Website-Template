import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleForgotPassword } from '../../server/admin/handlers.js';

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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed', status: 405 });
    }

    const result = await handleForgotPassword(readBody(req));
    return res
        .status(result.status)
        .json(result.ok ? result.data : result.body);
}
