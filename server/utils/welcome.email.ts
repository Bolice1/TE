import envConfiguration from '../config/env.js';
import { buildWelcomeEmailHtml, TE_BRAND } from './branding.js';
import { deliverEmail } from './email.js';

const buildSignInUrl = () => {
  const base = envConfiguration.frontendUrl?.replace(/\/+$/, '');
  return base ? `${base}/auth/login` : '';
};

export const sendTeacherWelcomeEmail = async (params: {
  email: string;
  teacherName: string;
  coachingName: string;
}) => {
  const { email, teacherName, coachingName } = params;
  const signInUrl = buildSignInUrl();

  return deliverEmail({
    to: email,
    subject: `Welcome to ${TE_BRAND.fullName}`,
    html: buildWelcomeEmailHtml({
      teacherName,
      coachingName,
      ...(signInUrl ? { signInUrl } : {}),
    }),
  });
};
