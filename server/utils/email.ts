import nodemailer from 'nodemailer';
import envConfiguration from '../config/env.js';

const normalizeService = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  if (normalized === 'gmail' || normalized === 'googlemail') {
    return 'gmail';
  }

  return normalized.includes('.') ? '' : normalized;
};

const looksLikeHostname = (value: string) =>
  /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value.trim());

const buildTransportOptions = () => {
  if (!envConfiguration.emailUser || !envConfiguration.emailPass) {
    return null;
  }

  if (envConfiguration.emailHost) {
    return {
      host: envConfiguration.emailHost,
      port: envConfiguration.emailPort,
      secure: envConfiguration.emailSecure,

      // FIX: Force IPv4 to avoid ENETUNREACH on Render
      family: 4,

      // Optional safer SMTP timeouts
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,

      auth: {
        user: envConfiguration.emailUser,
        pass: envConfiguration.emailPass,
      },
    };
  }

  const normalizedService = normalizeService(
    envConfiguration.emailService
  );

  if (normalizedService) {
    return {
      service: normalizedService,

      // FIX: Force IPv4
      family: 4,

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,

      auth: {
        user: envConfiguration.emailUser,
        pass: envConfiguration.emailPass,
      },
    };
  }

  if (looksLikeHostname(envConfiguration.emailService)) {
    return {
      host: envConfiguration.emailService.trim(),
      port: envConfiguration.emailPort,
      secure: envConfiguration.emailSecure,

      // FIX: Force IPv4
      family: 4,

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,

      auth: {
        user: envConfiguration.emailUser,
        pass: envConfiguration.emailPass,
      },
    };
  }

  return null;
};

const transportOptions = buildTransportOptions();

const transporter = transportOptions
  ? nodemailer.createTransport(transportOptions)
  : null;

export const isEmailTransportConfigured = () =>
  Boolean(transporter);

export const getEmailTransportDebugInfo = () => ({
  configured: Boolean(transporter),
  hasUser: Boolean(envConfiguration.emailUser),
  hasPass: Boolean(envConfiguration.emailPass),
  emailService: envConfiguration.emailService || null,
  emailHost: envConfiguration.emailHost || null,
  emailPort: envConfiguration.emailPort,
  emailSecure: envConfiguration.emailSecure,
  mode: transportOptions
    ? 'service' in transportOptions
      ? 'service'
      : 'host'
    : 'disabled',
});

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
      error:
        'Email transporter is not configured. Set EMAIL_USER and EMAIL_PASS, plus either EMAIL_SERVICE or EMAIL_HOST.',
    };
  }

  try {
    await transporter.sendMail({
      from: envConfiguration.emailUser,
      ...options,
    });

    return {
      delivered: true,
    };
  } catch (error) {
    console.error('Failed to send email:', error);

    return {
      delivered: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown email delivery error.',
    };
  }
};