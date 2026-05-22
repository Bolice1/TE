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

export const isEmailTransportConfigured = () => Boolean(transporter);

export const deliverEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}) => {
  if (!transporter) {
    return {
      delivered: false,
    };
  }

  await transporter.sendMail({
    from: envConfiguration.emailUser,
    ...options,
  });

  return {
    delivered: true,
  };
};
