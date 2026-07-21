import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleFirebaseStatus } from '../../server/firebase/handlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        const result = handleFirebaseStatus();
        return res
            .status(result.status)
            .json(result.ok ? result.data : result.body);
    }

    return res.status(405).json({ error: 'Method not allowed', status: 405 });
}
