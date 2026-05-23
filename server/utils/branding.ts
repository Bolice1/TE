export const TE_BRAND = {
  name: 'TE',
  fullName: 'Teacher Emmy',
  colors: {
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
    border: '#E2E8F0',
  },
} as const;

const { colors } = TE_BRAND;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const buildEmailButton = (href: string, label: string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 4px;">
    <tr>
      <td style="border-radius:12px;background:${colors.primary};">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>
`;

export const wrapEmailHtml = (params: {
  title: string;
  body: string;
  previewText?: string;
}) => {
  const preview = params.previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${params.previewText}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${params.title}</title>
</head>
<body style="margin:0;padding:0;background:${colors.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${colors.text};">
  ${preview}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${colors.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${colors.surface};border:1px solid ${colors.border};border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover});padding:20px 24px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);margin-bottom:6px;">${TE_BRAND.name}</div>
              <div style="font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">${TE_BRAND.fullName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;font-size:15px;line-height:1.65;color:${colors.text};">
              ${params.body}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 22px;border-top:1px solid ${colors.border};font-size:12px;line-height:1.5;color:${colors.muted};">
              ${TE_BRAND.name} — ${TE_BRAND.fullName}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const buildOtpEmailHtml = (otp: string) =>
  wrapEmailHtml({
    title: 'Verification code',
    previewText: `Your TE verification code is ${otp}`,
    body: `
      <p style="margin:0 0 12px;">Use this verification code to complete your teacher account registration.</p>
      <div style="margin:20px 0;padding:18px 16px;border:1px solid ${colors.border};border-radius:14px;background:${colors.background};text-align:center;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${colors.muted};margin-bottom:8px;">Verification code</div>
        <div style="font-size:30px;font-weight:800;letter-spacing:0.28em;color:${colors.primary};">${otp}</div>
      </div>
      <p style="margin:0;color:${colors.muted};font-size:14px;">This code expires in 5 minutes.</p>
    `,
  });

export const buildParentReportEmailHtml = (params: {
  parentName: string;
  studentName: string;
  reportTitle: string;
}) =>
  wrapEmailHtml({
    title: params.reportTitle,
    previewText: `${params.reportTitle} for ${params.studentName}`,
    body: `
      <p style="margin:0 0 12px;">Hello ${params.parentName},</p>
      <p style="margin:0 0 12px;">The academic report card for <strong>${params.studentName}</strong> is attached.</p>
      <p style="margin:0;color:${colors.muted};font-size:14px;">${params.reportTitle}</p>
    `,
  });

export const buildWelcomeEmailHtml = (params: {
  teacherName: string;
  coachingName: string;
  signInUrl?: string;
}) => {
  const teacherName = escapeHtml(params.teacherName);
  const coachingName = escapeHtml(params.coachingName);
  const signInBlock = params.signInUrl
    ? buildEmailButton(params.signInUrl, 'Open your workspace')
    : '';

  return wrapEmailHtml({
    title: `Welcome to ${TE_BRAND.fullName}`,
    previewText: `Your ${TE_BRAND.fullName} workspace for ${params.coachingName} is ready`,
    body: `
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${colors.muted};">
        Welcome
      </p>
      <p style="margin:0 0 14px;font-size:18px;font-weight:700;color:${colors.text};">
        Hello ${teacherName},
      </p>
      <p style="margin:0 0 16px;">
        Your <strong>${coachingName}</strong> workspace on ${TE_BRAND.fullName} is ready.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;border:1px solid ${colors.border};border-radius:14px;background:${colors.background};">
        <tr>
          <td style="padding:16px 18px;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:${colors.text};">You can now:</p>
            <ul style="margin:0;padding-left:18px;color:${colors.text};font-size:14px;line-height:1.7;">
              <li>Register students and manage class rosters</li>
              <li>Record assignments and marks</li>
              <li>Generate and send report cards to parents</li>
            </ul>
          </td>
        </tr>
      </table>
      ${signInBlock}
      <p style="margin:16px 0 0;text-align:center;color:${colors.muted};font-size:13px;">
        ${signInBlock ? 'Sign in to continue where you left off.' : 'Sign in to your TE workspace to get started.'}
      </p>
    `,
  });
};

export const reportDocumentStyles = `
  :root {
    --primary: ${colors.primary};
    --primary-hover: ${colors.primaryHover};
    --background: ${colors.background};
    --surface: ${colors.surface};
    --text: ${colors.text};
    --muted: ${colors.muted};
    --success: ${colors.success};
    --warning: ${colors.warning};
    --danger: ${colors.danger};
    --border: ${colors.border};
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: var(--background); color: var(--text); margin: 0; padding: 24px; }
  .sheet { max-width: 1100px; margin: 0 auto; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08); }
  .brand { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.9; margin-bottom: 6px; }
  .hero { background: linear-gradient(135deg, var(--primary), var(--primary-hover)); color: white; padding: 24px 28px; }
  .hero h1 { margin: 0 0 6px; font-size: 24px; }
  .hero p { margin: 0; opacity: 0.92; }
  .content { padding: 24px 28px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
  .card { border: 1px solid var(--border); border-radius: 16px; padding: 12px; background: #fff; }
  .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
  .value { font-size: 16px; font-weight: 700; margin-top: 6px; color: var(--text); }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border-top: 1px solid var(--border); padding: 12px; text-align: left; font-size: 13px; }
  th { background: #EFF6FF; color: var(--text); font-weight: 700; }
  .notes p { margin: 0 0 10px; line-height: 1.55; }
`;
