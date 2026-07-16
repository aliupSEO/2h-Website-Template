import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import {
    isGitHubApiPath,
    parseGitHubRepoPath,
} from '../../src/lib/api-endpoints.js';
import {
    handleCreateRepo,
    handleDeleteRepo,
    handleListRepos,
    handleUpdateRepo,
} from './handlers.js';

const readBody = async (req: IncomingMessage): Promise<unknown> => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw.trim()) return {};
    return JSON.parse(raw) as unknown;
};

const sendJson = (
    res: ServerResponse,
    status: number,
    body: unknown,
) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
};

const applyLocalEnv = (mode: string, envDir: string) => {
    const env = loadEnv(mode, envDir, '');
    Object.assign(process.env, env);
    return env;
};

export const githubApiPlugin = (): Plugin => {
    return {
        name: 'github-api',
        config(_, { mode }) {
            applyLocalEnv(mode, process.cwd());
        },
        configureServer(server) {
            const mode = server.config.mode;
            const envDir = server.config.envDir || process.cwd();

            server.middlewares.use(async (req, res, next) => {
                applyLocalEnv(mode, envDir);

                if (!req.url) {
                    next();
                    return;
                }

                const requestUrl = new URL(req.url, 'http://localhost');
                if (!isGitHubApiPath(requestUrl.pathname)) {
                    next();
                    return;
                }

                try {
                    const repoPath = parseGitHubRepoPath(requestUrl.pathname);

                    if (
                        requestUrl.pathname === '/api/github/repos' ||
                        requestUrl.pathname === '/api/github/repos/'
                    ) {
                        if (req.method === 'GET') {
                            const query = Object.fromEntries(requestUrl.searchParams.entries());
                            const result = await handleListRepos(query);
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        if (req.method === 'POST') {
                            const body = await readBody(req);
                            const result = await handleCreateRepo(body);
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }
                    }

                    if (repoPath) {
                        if (req.method === 'PATCH') {
                            const body = await readBody(req);
                            const result = await handleUpdateRepo(
                                repoPath.owner,
                                repoPath.repo,
                                body,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        if (req.method === 'DELETE') {
                            const result = await handleDeleteRepo(
                                repoPath.owner,
                                repoPath.repo,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }
                    }

                    sendJson(res, 405, { error: 'Method not allowed', status: 405 });
                }
                catch (error) {
                    const message =
                        error instanceof Error ? error.message : 'Server error';
                    sendJson(res, 500, { error: message, status: 500 });
                }
            });
        },
    };
};
