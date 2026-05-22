import { deliverEmail } from './email.js';

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailResult = await deliverEmail({
    to: email,
    subject: 'Your TE verification code',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Teacher account verification</h2>
        <p>Use the OTP below to complete your account registration.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This code expires in 5 minutes.</p>
      </div>
    `,
  });

  if (!mailResult.delivered) {
    console.warn(`Email transporter not configured. OTP for ${email}: ${otp}`);
    return {
      delivered: false,
      preview: otp,
    };
  }

  return {
    delivered: true,
  };
};
