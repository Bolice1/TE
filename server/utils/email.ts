import dns from 'dns';
import nodemailer from 'nodemailer';
import envConfiguration from '../config/env.js';

if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const SMTP_TIMEOUT_MS = 15_000;
const SMTP_RETRY_DELAY_MS = 750;

const ipv4Lookup = (
  hostname: string,
  options: dns.LookupOptions,
  callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void,
) => {
  dns.lookup(hostname, { ...options, family: 4, all: false }, callback);
};

const baseSmtpOptions = () => ({
  family: 4,
  lookup: ipv4Lookup,
  connectionTimeout: SMTP_TIMEOUT_MS,
  greetingTimeout: SMTP_TIMEOUT_MS,
  socketTimeout: SMTP_TIMEOUT_MS,
});

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

const gmailSmtpHost = () => ({
  host: envConfiguration.emailHost || 'smtp.gmail.com',
  port: envConfiguration.emailPort || 587,
  secure: envConfiguration.emailSecure,
  requireTLS: !envConfiguration.emailSecure,
  ...baseSmtpOptions(),
  auth: {
    user: envConfiguration.emailUser,
    pass: envConfiguration.emailPass,
  },
});

const buildTransportOptions = () => {
  if (!envConfiguration.emailUser || !envConfiguration.emailPass) {
    return null;
  }

  if (envConfiguration.emailHost) {
    return {
      host: envConfiguration.emailHost,
      port: envConfiguration.emailPort,
      secure: envConfiguration.emailSecure,
      requireTLS: !envConfiguration.emailSecure,
      ...baseSmtpOptions(),
      auth: {
        user: envConfiguration.emailUser,
        pass: envConfiguration.emailPass,
      },
    };
  }

  const normalizedService = normalizeService(envConfiguration.emailService);

  if (normalizedService === 'gmail') {
    return gmailSmtpHost();
  }

  if (normalizedService) {
    return {
      service: normalizedService,
      ...baseSmtpOptions(),
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
      requireTLS: !envConfiguration.emailSecure,
      ...baseSmtpOptions(),
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

if (transporter) {
  console.log('Email transporter configured:', {
    mode: transportOptions && 'service' in transportOptions ? 'service' : 'host',
    host: transportOptions && 'host' in transportOptions ? transportOptions.host : 'service-based',
    port: transportOptions && 'port' in transportOptions ? transportOptions.port : 'default',
  });
}

const isRetryableSmtpError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = 'code' in error ? String((error as NodeJS.ErrnoException).code ?? '') : '';
  const message = error.message.toLowerCase();

  return (
    code === 'ENETUNREACH' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === 'ESOCKET' ||
    code === 'ETIMEOUT' ||
    message.includes('timeout') ||
    message.includes('connection')
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeEmailError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return 'Email delivery failed.';
  }

  const code = 'code' in error ? String((error as NodeJS.ErrnoException).code ?? '') : '';
  const message = error.message.toLowerCase();

  if (code === 'EAUTH') {
    return 'Email authentication failed. Check EMAIL_USER and EMAIL_PASS.';
  }

  if (code === 'ENETUNREACH' || code === 'ETIMEDOUT' || code === 'ECONNRESET') {
    return 'Email server is unreachable. Please try again shortly.';
  }

  if (message.includes('timeout') || message.includes('connect')) {
    return 'Email service connection timed out. SMTP server may be unreachable or overloaded.';
  }

  if (code === 'ENOTFOUND') {
    return 'Email server hostname not found. Check EMAIL_SERVICE or EMAIL_HOST configuration.';
  }

  return 'Email delivery failed. Please try again later.';
};

export const isEmailTransportConfigured = () => Boolean(transporter);

export const getEmailTransportDebugInfo = () => ({
  configured: Boolean(transporter),
  hasUser: Boolean(envConfiguration.emailUser),
  hasPass: Boolean(envConfiguration.emailPass),
  emailService: envConfiguration.emailService || null,
  emailHost: envConfiguration.emailHost || null,
  emailPort: envConfiguration.emailPort,
  emailSecure: envConfiguration.emailSecure,
  mode: transportOptions
    ? 'service' in transportOptions && transportOptions.service
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

  const sendOnce = () =>
    transporter.sendMail({
      from: envConfiguration.emailUser,
      ...options,
    });

  try {
    await sendOnce();
    return { delivered: true };
  } catch (firstError) {
    if (!isRetryableSmtpError(firstError)) {
      console.error('Failed to send email:', firstError instanceof Error ? firstError.message : firstError);
      return {
        delivered: false,
        error: sanitizeEmailError(firstError),
      };
    }

    console.warn('SMTP send failed, retrying once:', firstError instanceof Error ? firstError.message : firstError);
    await sleep(SMTP_RETRY_DELAY_MS);

    try {
      await sendOnce();
      return { delivered: true };
    } catch (retryError) {
      console.error('Failed to send email after retry:', retryError instanceof Error ? retryError.message : retryError);
      return {
        delivered: false,
        error: sanitizeEmailError(retryError),
      };
    }
  }
};
