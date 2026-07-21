import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleRemoveWebApp } from '../../../../../server/firebase/handlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const projectId = String(req.query.projectId ?? '');
    const appId = String(req.query.appId ?? '');

    if (req.method === 'DELETE') {
        const result = await handleRemoveWebApp(projectId, appId);
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
