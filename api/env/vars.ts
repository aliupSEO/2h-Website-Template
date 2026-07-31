import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    handleListEnvVars,
    handleUpsertEnvVar,
} from '../../server/env/handlers.js';

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

    if (req.method === 'GET') {
        const result = await handleListEnvVars(authorization);
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    if (req.method === 'POST') {
        const result = await handleUpsertEnvVar(authorization, readBody(req));
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
