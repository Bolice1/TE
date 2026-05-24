import { buildOtpEmailHtml } from './branding.js';
import { deliverEmail } from './email.js';

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailResult = await deliverEmail({
    to: email,
    subject: 'Your TE verification code',
    html: buildOtpEmailHtml(otp),
  });

  if (!mailResult.delivered) {
    const errorMsg = `OTP email delivery failed for ${email}`;
    const details = mailResult.error ?? 'Unknown delivery error';
    console.error(errorMsg, details);
    return {
      delivered: false,
      error: mailResult.error,
    };
  }

  console.log(`OTP email successfully sent to ${email}`);
  return {
    delivered: true,
  };
};
