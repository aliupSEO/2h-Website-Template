export type SmtpConfig = {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure: boolean;
};

export const getAppUrl = (): string => {
    const fromEnv =
        process.env.APP_URL?.trim() ||
        process.env.VITE_APP_URL?.trim() ||
        process.env.VERCEL_URL?.trim();

    if (!fromEnv) return 'http://localhost:5173';
    if (fromEnv.startsWith('http')) return fromEnv.replace(/\/$/, '');
    return `https://${fromEnv.replace(/\/$/, '')}`;
};

export const getSmtpConfig = (): SmtpConfig => {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    const from =
        process.env.SMTP_FROM?.trim() || '2H Central Hub <noreply@example.com>';
    const port = Number(process.env.SMTP_PORT ?? '587');
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (!host || !user || !pass) {
        throw new Error(
            'SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.',
        );
    }

    return { host, port, user, pass, from, secure };
};

export const hasSmtpConfig = (): boolean => {
    return Boolean(
        process.env.SMTP_HOST?.trim() &&
            process.env.SMTP_USER?.trim() &&
            process.env.SMTP_PASS?.trim(),
    );
};
