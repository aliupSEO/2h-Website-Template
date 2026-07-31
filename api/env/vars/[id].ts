import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    handleDeleteEnvVar,
    handleUpdateEnvVar,
} from '../../../server/env/handlers.js';

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
    const authorization = req.headers.authorization;
    const id = typeof req.query.id === 'string' ? req.query.id : '';

    if (req.method === 'PATCH') {
        const result = await handleUpdateEnvVar(authorization, id, readBody(req));
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    if (req.method === 'DELETE') {
        const result = await handleDeleteEnvVar(authorization, id);
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
