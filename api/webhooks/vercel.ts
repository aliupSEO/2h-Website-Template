import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleVercelWebhook } from '../../server/vercel/webhook-handlers.js';

export const config = {
    api: {
        bodyParser: false,
    },
};

const readRawBody = async (req: VercelRequest) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf8');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed', status: 405 });
    }

    const rawBody = await readRawBody(req);
    const result = handleVercelWebhook(rawBody, req.headers['x-vercel-signature']);

    return res
        .status(result.status)
        .json(result.ok ? result.data : result.body);
}
