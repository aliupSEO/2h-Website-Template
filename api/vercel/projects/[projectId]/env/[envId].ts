import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    handleDeleteEnvVar,
    handleUpdateEnvVar,
} from '../../../../../server/vercel/handlers.js';

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
    const projectId =
        typeof req.query.projectId === 'string' ? req.query.projectId : '';
    const envId = typeof req.query.envId === 'string' ? req.query.envId : '';

    if (req.method === 'PATCH') {
        const result = await handleUpdateEnvVar(
            projectId,
            envId,
            readBody(req),
        );
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    if (req.method === 'DELETE') {
        const result = await handleDeleteEnvVar(projectId, envId);
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
