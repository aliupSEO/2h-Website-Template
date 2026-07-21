import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleGetProject } from '../../../server/firebase/handlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const projectId = String(req.query.projectId ?? '');

    if (req.method === 'GET') {
        const result = await handleGetProject(projectId);
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
