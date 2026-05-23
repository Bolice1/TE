import { buildWelcomeEmailHtml } from './branding.js';
import { deliverEmail } from './email.js';

export const sendTeacherWelcomeEmail = async (params: {
  email: string;
  teacherName: string;
  coachingName: string;
}) => {
  const { email, teacherName, coachingName } = params;

  return deliverEmail({
    to: email,
    subject: `Welcome to ${coachingName}`,
    html: buildWelcomeEmailHtml({ teacherName, coachingName }),
  });
};
