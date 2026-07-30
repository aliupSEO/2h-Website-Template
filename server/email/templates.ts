const brand = {
    bg: '#000000',
    surface: '#2a2a2a',
    text: '#ffffff',
    muted: '#a3a3a3',
    accent: '#c6f532',
};

const layout = (content: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>2H Central Hub</title>
</head>
<body style="margin:0;padding:0;background:${brand.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.bg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:${brand.surface};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 28px 8px;color:${brand.text};">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${brand.accent};">2H Central Hub</p>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;color:${brand.muted};font-size:12px;line-height:1.5;">
              If you did not expect this email, you can ignore it safely.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const button = (href: string, label: string) => `
<p style="margin:24px 0 8px;">
  <a href="${href}" style="display:inline-block;background:${brand.accent};color:#000000;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px;">
    ${label}
  </a>
</p>
<p style="margin:0;color:${brand.muted};font-size:12px;word-break:break-all;">${href}</p>`;

export const inviteEmailHtml = (input: {
    name: string;
    inviteLink: string;
}) =>
    layout(`
<h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:${brand.text};">You're invited</h1>
<p style="margin:0 0 8px;color:${brand.muted};font-size:15px;line-height:1.6;">
  Hi ${input.name}, an admin invited you to <strong style="color:${brand.text};">2H Central Hub</strong>.
  Accept the invitation and choose your password to get started.
</p>
${button(input.inviteLink, 'Accept invitation')}
<p style="margin:16px 0 0;color:${brand.muted};font-size:13px;line-height:1.5;">This link expires in 24 hours.</p>`);

export const resetPasswordEmailHtml = (input: {
    resetLink: string;
}) =>
    layout(`
<h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:${brand.text};">Reset your password</h1>
<p style="margin:0 0 8px;color:${brand.muted};font-size:15px;line-height:1.6;">
  We received a request to reset your 2H Central Hub password. Choose a new password using the button below.
</p>
${button(input.resetLink, 'Reset password')}
<p style="margin:16px 0 0;color:${brand.muted};font-size:13px;line-height:1.5;">This link expires in 1 hour. If you did not request a reset, no action is needed.</p>`);

export const adminPasswordResetEmailHtml = (input: {
    name: string;
    resetLink: string;
}) =>
    layout(`
<h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:${brand.text};">Password updated by admin</h1>
<p style="margin:0 0 8px;color:${brand.muted};font-size:15px;line-height:1.6;">
  Hi ${input.name}, an administrator reset your 2H Central Hub password. Use the link below to set a new one.
</p>
${button(input.resetLink, 'Set new password')}
<p style="margin:16px 0 0;color:${brand.muted};font-size:13px;line-height:1.5;">This link expires in 1 hour.</p>`);
