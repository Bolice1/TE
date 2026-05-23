import { buildOtpEmailHtml } from './branding.js';
import { deliverEmail } from './email.js';

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailResult = await deliverEmail({
    to: email,
    subject: 'Your TE verification code',
    html: buildOtpEmailHtml(otp),
  });

  if (!mailResult.delivered) {
    console.warn(`OTP email delivery failed for ${email}. ${mailResult.error ?? 'Unknown delivery error.'}`);
    return {
      delivered: false,
      error: mailResult.error,
    };
  }

  return {
    delivered: true,
  };
};
