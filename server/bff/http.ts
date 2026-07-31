import { existsSync, readFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { parse as parseEnv } from 'dotenv';

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

const envFilesForMode = (mode: string, envDir: string) => [
    path.join(envDir, '.env'),
    path.join(envDir, '.env.local'),
    path.join(envDir, `.env.${mode}`),
    path.join(envDir, `.env.${mode}.local`),
];

/**
 * Load local env files into process.env.
 * File values always win — unlike Vite's loadEnv('', …), which prefers a
 * stale process.env and can keep an old GOOGLE_APPLICATION_CREDENTIALS path
 * after .env.local edits / soft server restarts.
 */
export const applyLocalEnv = (mode: string, envDir: string) => {
    const merged: Record<string, string> = {};

    for (const filePath of envFilesForMode(mode, envDir)) {
        if (!existsSync(filePath)) continue;
        Object.assign(merged, parseEnv(readFileSync(filePath, 'utf8')));
    }

    Object.assign(process.env, merged);
    return merged;
};
