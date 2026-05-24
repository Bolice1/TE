import { deliverEmail } from './email.js';
import envConfiguration from '../config/env.js';

export const buildCoachOnboardingHtml = (email: string, tempPassword: string) => {
  // Prefer explicit frontend URL, then CORS_ORIGIN, then localhost fallback
  const base = envConfiguration.frontendUrl || envConfiguration.corsOrigin || 'http://localhost:3000';
  const trimmed = base.replace(/\/+$/, '');
  const loginUrl = `${trimmed}/auth/login`;
  return `
  <div style="font-family: Arial, sans-serif; color: #111;">
    <h2>Welcome to Teacher Emmy</h2>
    <p>Hello,</p>
    <p>An administrator created an account for you on Teacher Emmy. Use the credentials below to sign in.</p>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Temporary password:</strong> ${tempPassword}</li>
    </ul>
    <p>Please visit <a href="${loginUrl}">${loginUrl}</a> to sign in. You will be asked to change your password; changing it is recommended for security.</p>
    <p>Regards,<br/>Teacher Emmy Team</p>
  </div>
  `;
};

export const sendCoachOnboardingEmail = async (to: string, tempPassword: string) => {
  const html = buildCoachOnboardingHtml(to, tempPassword);
  try {
    const result = await deliverEmail({ to, subject: 'Welcome to Teacher Emmy — Your account', html });
    return result;
  } catch (err) {
    return { delivered: false, error: 'Failed to enqueue onboarding email.' };
  }
};
