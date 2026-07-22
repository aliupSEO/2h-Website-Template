import type { Plugin } from 'vite';
import {
    isFirebaseApiPath,
    isGitHubApiPath,
    isVercelApiPath,
    isVercelWebhookPath,
    parseFirebaseAppConfigPath,
    parseFirebaseAppPath,
    parseFirebaseAppsPath,
    parseFirebaseAuthConfigPath,
    parseFirebaseAuthProviderPath,
    parseFirebaseAuthProvidersPath,
    parseFirebaseFirestoreEnablePath,
    parseFirebaseProjectPath,
    parseFirebaseStorageEnablePath,
    parseFirebaseWebAppsPath,
    parseGitHubRepoPath,
    parseVercelEnvPath,
    parseVercelProjectDeploymentsPath,
    parseVercelRedeployPath,
} from '../../src/lib/api-endpoints.js';
import { applyLocalEnv, readBody, sendJson } from '../bff/http.js';
import {
    handleAddFirebase,
    handleCreateProvider,
    handleCreateWebApp,
    handleEnableFirestore,
    handleEnableStorage,
    handleFirebaseStatus,
    handleGetAuthConfig,
    handleGetProject,
    handleGetWebAppConfig,
    handleListApps,
    handleListAvailableProjects,
    handleListProjects as handleListFirebaseProjects,
    handleListProviders,
    handleRemoveWebApp,
    handleUpdateAuthConfig,
    handleUpdateProvider,
} from '../firebase/handlers.js';
import {
    handleCreateRepo,
    handleDeleteRepo,
    handleListRepos,
    handleUpdateRepo,
} from '../github/handlers.js';
import {
    handleCreateEnvVar,
    handleCreateProject,
    handleDeleteEnvVar,
    handleListDeployments,
    handleListEnvVars,
    handleListProjects,
    handleRedeploy,
    handleUpdateEnvVar,
} from '../vercel/handlers.js';
import {
    handleClearWebhookDirty,
    handleGetWebhookState,
    handleVercelWebhook,
} from '../vercel/webhook-handlers.js';

const readRawBody = async (req: import('node:http').IncomingMessage) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf8');
};

export const hubApiPlugin = (): Plugin => {
    return {
        name: 'hub-api',
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
                const pathname = requestUrl.pathname;

                if (
                    !isGitHubApiPath(pathname) &&
                    !isVercelApiPath(pathname) &&
                    !isVercelWebhookPath(pathname) &&
                    !isFirebaseApiPath(pathname)
                ) {
                    next();
                    return;
                }

                try {
                    if (isVercelWebhookPath(pathname)) {
                        if (req.method !== 'POST') {
                            sendJson(res, 405, {
                                error: 'Method not allowed',
                                status: 405,
                            });
                            return;
                        }

                        const rawBody = await readRawBody(req);
                        const result = handleVercelWebhook(
                            rawBody,
                            req.headers['x-vercel-signature'],
                        );
                        sendJson(
                            res,
                            result.status,
                            result.ok ? result.data : result.body,
                        );
                        return;
                    }

                    if (isGitHubApiPath(pathname)) {
                        const repoPath = parseGitHubRepoPath(pathname);

                        if (
                            pathname === '/api/github/repos' ||
                            pathname === '/api/github/repos/'
                        ) {
                            if (req.method === 'GET') {
                                const query = Object.fromEntries(
                                    requestUrl.searchParams.entries(),
                                );
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
                    }

                    if (isVercelApiPath(pathname)) {
                        if (
                            pathname === '/api/vercel/webhook-state' ||
                            pathname === '/api/vercel/webhook-state/'
                        ) {
                            if (req.method === 'GET') {
                                const result = handleGetWebhookState();
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }

                            if (req.method === 'POST') {
                                const body = await readBody(req);
                                const result = handleClearWebhookDirty(body);
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }
                        }

                        if (
                            pathname === '/api/vercel/projects' ||
                            pathname === '/api/vercel/projects/'
                        ) {
                            if (req.method === 'GET') {
                                const result = await handleListProjects();
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }

                            if (req.method === 'POST') {
                                const body = await readBody(req);
                                const result = await handleCreateProject(body);
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }
                        }

                        const deploymentsPath =
                            parseVercelProjectDeploymentsPath(pathname);
                        if (deploymentsPath && req.method === 'GET') {
                            const rawLimit = Number(
                                requestUrl.searchParams.get('limit'),
                            );
                            const limit = Number.isFinite(rawLimit)
                                ? rawLimit
                                : undefined;
                            const result = await handleListDeployments(
                                deploymentsPath.projectId,
                                limit,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        const redeployPath = parseVercelRedeployPath(pathname);
                        if (redeployPath && req.method === 'POST') {
                            const body = await readBody(req);
                            const result = await handleRedeploy(
                                redeployPath.deploymentId,
                                body,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        const envPath = parseVercelEnvPath(pathname);
                        if (envPath && !envPath.envId) {
                            if (req.method === 'GET') {
                                const result = await handleListEnvVars(
                                    envPath.projectId,
                                );
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }

                            if (req.method === 'POST') {
                                const body = await readBody(req);
                                const result = await handleCreateEnvVar(
                                    envPath.projectId,
                                    body,
                                );
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }
                        }

                        if (envPath?.envId) {
                            if (req.method === 'PATCH') {
                                const body = await readBody(req);
                                const result = await handleUpdateEnvVar(
                                    envPath.projectId,
                                    envPath.envId,
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
                                const result = await handleDeleteEnvVar(
                                    envPath.projectId,
                                    envPath.envId,
                                );
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }
                        }
                    }

                    if (isFirebaseApiPath(pathname)) {
                        if (
                            pathname === '/api/firebase/status' ||
                            pathname === '/api/firebase/status/'
                        ) {
                            if (req.method === 'GET') {
                                const result = handleFirebaseStatus();
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }
                        }

                        if (
                            pathname === '/api/firebase/available-projects' ||
                            pathname === '/api/firebase/available-projects/'
                        ) {
                            if (req.method === 'GET') {
                                const result =
                                    await handleListAvailableProjects();
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }
                        }

                        if (
                            pathname === '/api/firebase/projects' ||
                            pathname === '/api/firebase/projects/'
                        ) {
                            if (req.method === 'GET') {
                                const result = await handleListFirebaseProjects();
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }

                            if (req.method === 'POST') {
                                const body = await readBody(req);
                                const result = await handleAddFirebase(body);
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }
                        }

                        const firestoreEnable =
                            parseFirebaseFirestoreEnablePath(pathname);
                        if (firestoreEnable && req.method === 'POST') {
                            const body = await readBody(req);
                            const result = await handleEnableFirestore(
                                firestoreEnable.projectId,
                                body,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        const storageEnable =
                            parseFirebaseStorageEnablePath(pathname);
                        if (storageEnable && req.method === 'POST') {
                            const body = await readBody(req);
                            const result = await handleEnableStorage(
                                storageEnable.projectId,
                                body,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        const authConfigPath =
                            parseFirebaseAuthConfigPath(pathname);
                        if (authConfigPath) {
                            if (req.method === 'GET') {
                                const result = await handleGetAuthConfig(
                                    authConfigPath.projectId,
                                );
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }

                            if (req.method === 'PATCH') {
                                const body = await readBody(req);
                                const result = await handleUpdateAuthConfig(
                                    authConfigPath.projectId,
                                    body,
                                );
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }
                        }

                        const authProvidersPath =
                            parseFirebaseAuthProvidersPath(pathname);
                        if (authProvidersPath) {
                            if (req.method === 'GET') {
                                const result = await handleListProviders(
                                    authProvidersPath.projectId,
                                );
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }

                            if (req.method === 'POST') {
                                const body = await readBody(req);
                                const result = await handleCreateProvider(
                                    authProvidersPath.projectId,
                                    body,
                                );
                                sendJson(
                                    res,
                                    result.status,
                                    result.ok ? result.data : result.body,
                                );
                                return;
                            }
                        }

                        const authProviderPath =
                            parseFirebaseAuthProviderPath(pathname);
                        if (authProviderPath && req.method === 'PATCH') {
                            const body = await readBody(req);
                            const result = await handleUpdateProvider(
                                authProviderPath.projectId,
                                authProviderPath.idpId,
                                body,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        const webAppsPath = parseFirebaseWebAppsPath(pathname);
                        if (webAppsPath && req.method === 'POST') {
                            const body = await readBody(req);
                            const result = await handleCreateWebApp(
                                webAppsPath.projectId,
                                body,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        const appConfigPath =
                            parseFirebaseAppConfigPath(pathname);
                        if (appConfigPath && req.method === 'GET') {
                            const result = await handleGetWebAppConfig(
                                appConfigPath.projectId,
                                appConfigPath.appId,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        const appPath = parseFirebaseAppPath(pathname);
                        if (appPath && req.method === 'DELETE') {
                            const result = await handleRemoveWebApp(
                                appPath.projectId,
                                appPath.appId,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        const appsPath = parseFirebaseAppsPath(pathname);
                        if (appsPath && req.method === 'GET') {
                            const result = await handleListApps(
                                appsPath.projectId,
                            );
                            sendJson(
                                res,
                                result.status,
                                result.ok ? result.data : result.body,
                            );
                            return;
                        }

                        const projectPath = parseFirebaseProjectPath(pathname);
                        if (projectPath && req.method === 'GET') {
                            const result = await handleGetProject(
                                projectPath.projectId,
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
