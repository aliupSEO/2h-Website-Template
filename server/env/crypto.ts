import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

const getKey = (): Buffer => {
    const raw = process.env.ENV_SECRETS_KEY?.trim();
    if (!raw) {
        throw new Error(
            'ENV_SECRETS_KEY is not set. Add a long secret to encrypt Hub env values.',
        );
    }

    if (/^[0-9a-fA-F]{64}$/.test(raw)) {
        return Buffer.from(raw, 'hex');
    }

    return createHash('sha256').update(raw).digest();
};

export type EncryptedPayload = {
    ciphertext: string;
    iv: string;
    tag: string;
};

export const encryptSecret = (plaintext: string): EncryptedPayload => {
    const key = getKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return {
        ciphertext: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
    };
};

export const decryptSecret = (payload: EncryptedPayload): string => {
    const key = getKey();
    const decipher = createDecipheriv(
        ALGORITHM,
        key,
        Buffer.from(payload.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(payload.ciphertext, 'base64')),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
};

export const hasEnvSecretsKey = (): boolean => {
    return Boolean(process.env.ENV_SECRETS_KEY?.trim());
};
