import nodemailer from 'nodemailer';
import { getSmtpConfig } from './env.js';
import {
    adminPasswordResetEmailHtml,
    inviteEmailHtml,
    resetPasswordEmailHtml,
} from './templates.js';

const createTransport = () => {
    const config = getSmtpConfig();
    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });
};

const sendMail = async (input: {
    to: string;
    subject: string;
    html: string;
}) => {
    const config = getSmtpConfig();
    const transport = createTransport();

    await transport.sendMail({
        from: config.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
    });
};

export const sendInviteEmail = async (input: {
    to: string;
    name: string;
    inviteLink: string;
}) => {
    await sendMail({
        to: input.to,
        subject: 'You are invited to 2H Central Hub',
        html: inviteEmailHtml({
            name: input.name,
            inviteLink: input.inviteLink,
        }),
    });
};

export const sendResetPasswordEmail = async (input: {
    to: string;
    resetLink: string;
}) => {
    await sendMail({
        to: input.to,
        subject: 'Reset your 2H Central Hub password',
        html: resetPasswordEmailHtml({ resetLink: input.resetLink }),
    });
};

export const sendAdminPasswordResetEmail = async (input: {
    to: string;
    name: string;
    resetLink: string;
}) => {
    await sendMail({
        to: input.to,
        subject: 'Set a new password for 2H Central Hub',
        html: adminPasswordResetEmailHtml(input),
    });
};
