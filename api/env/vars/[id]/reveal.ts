import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleRevealEnvVar } from '../../../../server/env/handlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const authorization = req.headers.authorization;
    const id = typeof req.query.id === 'string' ? req.query.id : '';

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed', status: 405 });
    }

    const result = await handleRevealEnvVar(authorization, id);
    return res.status(result.status).json(result.ok ? result.data : result.body);
}
