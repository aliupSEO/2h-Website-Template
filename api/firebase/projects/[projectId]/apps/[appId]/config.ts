import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleGetWebAppConfig } from '../../../../../../server/firebase/handlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const projectId = String(req.query.projectId ?? '');
    const appId = String(req.query.appId ?? '');

    if (req.method === 'GET') {
        const result = await handleGetWebAppConfig(projectId, appId);
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
