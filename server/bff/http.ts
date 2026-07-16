import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv } from 'vite';

export const readBody = async (req: IncomingMessage): Promise<unknown> => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw.trim()) return {};
    return JSON.parse(raw) as unknown;
};

export const sendJson = (
    res: ServerResponse,
    status: number,
    body: unknown,
) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
};

export const applyLocalEnv = (mode: string, envDir: string) => {
    const env = loadEnv(mode, envDir, '');
    Object.assign(process.env, env);
    return env;
};
