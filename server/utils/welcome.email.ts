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
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 8px;">Welcome to ${coachingName}</h2>
        <p>Hello ${teacherName},</p>
        <p>Your teacher account has been created successfully. You can now sign in, register students, create courses, prepare quizzes and assignments, and record student marks.</p>
        <p style="margin-bottom: 0;">We are glad to have you on board.</p>
      </div>
    `,
  });
};
