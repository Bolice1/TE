import nodemailer from 'nodemailer';
import envConfiguration from '../config/env.js';

const transporter =
  envConfiguration.emailUser && envConfiguration.emailPass
    ? nodemailer.createTransport({
        service: envConfiguration.emailService || 'gmail',
        auth: {
          user: envConfiguration.emailUser,
          pass: envConfiguration.emailPass,
        },
      })
    : null;

export const sendOtpEmail = async (email: string, otp: string) => {
  if (!transporter) {
    console.warn(`Email transporter not configured. OTP for ${email}: ${otp}`);
    return {
      delivered: false,
      preview: otp,
    };
  }

  await transporter.sendMail({
    from: envConfiguration.emailUser,
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

  return {
    delivered: true,
  };
};
