import type { AuthError } from '@supabase/supabase-js';

const CREDENTIAL_MESSAGES = new Set([
    'Invalid login credentials',
    'invalid_credentials',
]);

export const getAuthErrorMessage = (
    error: AuthError | Error | null | undefined,
    fallback: string,
) => {
    if (!error?.message) return fallback;

    const message = error.message.trim();

    if (CREDENTIAL_MESSAGES.has(message) || /invalid login credentials/i.test(message)) {
        return 'Invalid email or password';
    }

    if (/email not confirmed/i.test(message)) {
        return 'Confirm your email before signing in';
    }

    if (/user is banned|user_banned/i.test(message)) {
        return 'This account has been disabled';
    }

    if (/network|fetch/i.test(message)) {
        return 'Could not reach the auth service. Try again.';
    }

    if (/password should be at least|Password should contain/i.test(message)) {
        return message;
    }

    if (/same password|New password should be different/i.test(message)) {
        return 'Choose a password different from your current one';
    }

    if (/Auth session missing|session_not_found|otp_expired|token.*expired/i.test(message)) {
        return 'This reset link is invalid or has expired. Request a new one.';
    }

    return fallback;
};

export class InactiveAccountError extends Error {
    constructor() {
        super('This account has been disabled');
        this.name = 'InactiveAccountError';
    }
}
