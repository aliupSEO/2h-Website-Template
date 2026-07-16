import { createHmac, timingSafeEqual } from 'node:crypto';

export const VERCEL_WEBHOOK_EVENTS = [
    'deployment.created',
    'deployment.error',
    'deployment.blocked',
    'deployment.canceled',
    'deployment.succeeded',
    'deployment.promoted',
    'deployment.rollback',
    'project.created',
    'project.removed',
    'project.renamed',
    'project.env-variable.created',
    'project.env-variable.updated',
    'project.env-variable.deleted',
] as const;

export type VercelWebhookEventType = (typeof VERCEL_WEBHOOK_EVENTS)[number];

export type VercelWebhookEvent = {
    id: string;
    type: string;
    createdAt: number;
    projectId: string | null;
    payload: unknown;
};

type StoreState = {
    events: VercelWebhookEvent[];
    dirtyProjectIds: Set<string>;
    projectsListDirty: boolean;
};

const MAX_EVENTS = 100;

const globalStore = globalThis as typeof globalThis & {
    __hubVercelWebhookStore?: StoreState;
};

const getStore = (): StoreState => {
    if (!globalStore.__hubVercelWebhookStore) {
        globalStore.__hubVercelWebhookStore = {
            events: [],
            dirtyProjectIds: new Set(),
            projectsListDirty: false,
        };
    }
    return globalStore.__hubVercelWebhookStore;
};

export const verifyVercelWebhookSignature = (
    rawBody: string,
    signatureHeader: string | string[] | undefined,
    secret: string,
) => {
    const signature = Array.isArray(signatureHeader)
        ? signatureHeader[0]
        : signatureHeader;

    if (!signature) return false;

    const expected = createHmac('sha1', secret).update(rawBody).digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (signatureBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(signatureBuffer, expectedBuffer);
};

const extractProjectId = (payload: Record<string, unknown>) => {
    const direct = payload.projectId;
    if (typeof direct === 'string' && direct) return direct;

    const project = payload.project;
    if (project && typeof project === 'object') {
        const id = (project as { id?: unknown }).id;
        if (typeof id === 'string' && id) return id;
    }

    const payloadNested = payload.payload;
    if (payloadNested && typeof payloadNested === 'object') {
        const nestedProjectId = (payloadNested as { projectId?: unknown }).projectId;
        if (typeof nestedProjectId === 'string' && nestedProjectId) {
            return nestedProjectId;
        }
    }

    return null;
};

export const recordVercelWebhookEvent = (
    body: Record<string, unknown>,
): VercelWebhookEvent => {
    const store = getStore();
    const type = typeof body.type === 'string' ? body.type : 'unknown';
    const id =
        typeof body.id === 'string'
            ? body.id
            : `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const projectId = extractProjectId(body);
    const createdAt =
        typeof body.createdAt === 'number' ? body.createdAt : Date.now();

    const event: VercelWebhookEvent = {
        id,
        type,
        createdAt,
        projectId,
        payload: body,
    };

    store.events.unshift(event);
    if (store.events.length > MAX_EVENTS) {
        store.events.length = MAX_EVENTS;
    }

    if (
        type.startsWith('project.') &&
        !type.startsWith('project.env-variable.')
    ) {
        store.projectsListDirty = true;
    }

    if (projectId) {
        store.dirtyProjectIds.add(projectId);
    }

    return event;
};

export const getVercelWebhookState = () => {
    const store = getStore();
    return {
        events: store.events.slice(0, 50),
        dirtyProjectIds: Array.from(store.dirtyProjectIds),
        projectsListDirty: store.projectsListDirty,
    };
};

export const clearVercelWebhookDirty = (input: {
    projectIds?: string[];
    projectsList?: boolean;
}) => {
    const store = getStore();

    if (input.projectsList) {
        store.projectsListDirty = false;
    }

    if (input.projectIds) {
        for (const projectId of input.projectIds) {
            store.dirtyProjectIds.delete(projectId);
        }
    }
};

export const getVercelWebhookSecret = () => {
    const secret = process.env.VERCEL_WEBHOOK_SECRET?.trim();
    if (!secret) {
        throw new Error('VERCEL_WEBHOOK_SECRET is not set');
    }
    return secret;
};
