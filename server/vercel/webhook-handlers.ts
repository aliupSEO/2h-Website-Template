import type {
    VercelApiErrorBody,
    VercelWebhookEvent,
} from './types.js';
import {
    clearVercelWebhookDirty,
    getVercelWebhookSecret,
    getVercelWebhookState,
    recordVercelWebhookEvent,
    verifyVercelWebhookSignature,
} from './webhook.js';

export type HandlerResult<T> =
    | { ok: true; data: T; status: number }
    | { ok: false; body: VercelApiErrorBody; status: number };

export const handleVercelWebhook = (
    rawBody: string,
    signatureHeader: string | string[] | undefined,
): HandlerResult<{ received: true; type: string }> => {
    try {
        const secret = getVercelWebhookSecret();
        if (!verifyVercelWebhookSignature(rawBody, signatureHeader, secret)) {
            return {
                ok: false,
                body: { error: 'Invalid webhook signature', status: 403 },
                status: 403,
            };
        }

        const body = JSON.parse(rawBody) as Record<string, unknown>;
        const event = recordVercelWebhookEvent(body);

        return {
            ok: true,
            data: { received: true, type: event.type },
            status: 200,
        };
    }
    catch (error) {
        const message =
            error instanceof Error ? error.message : 'Webhook processing failed';
        const status = message.includes('VERCEL_WEBHOOK_SECRET') ? 500 : 400;
        return {
            ok: false,
            body: { error: message, status },
            status,
        };
    }
};

export const handleGetWebhookState = (): HandlerResult<{
    events: VercelWebhookEvent[];
    dirtyProjectIds: string[];
    projectsListDirty: boolean;
}> => {
    const state = getVercelWebhookState();
    return {
        ok: true,
        data: {
            events: state.events,
            dirtyProjectIds: state.dirtyProjectIds,
            projectsListDirty: state.projectsListDirty,
        },
        status: 200,
    };
};

export const handleClearWebhookDirty = (
    body: unknown,
): HandlerResult<{ cleared: true }> => {
    const input =
        body && typeof body === 'object'
            ? (body as {
                projectIds?: unknown;
                projectsList?: unknown;
            })
            : {};

    const projectIds = Array.isArray(input.projectIds)
        ? input.projectIds.filter((id): id is string => typeof id === 'string')
        : [];

    clearVercelWebhookDirty({
        projectIds,
        projectsList: Boolean(input.projectsList),
    });

    return { ok: true, data: { cleared: true }, status: 200 };
};
