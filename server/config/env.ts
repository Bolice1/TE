import dotenv from 'dotenv';

dotenv.config();

const readEnv = (...keys: string[]): string => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return '';
};

const readNumber = (fallback: number, ...keys: string[]): number => {
  const rawValue = readEnv(...keys);
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const envConfiguration = {
  port: readNumber(4000, 'PORT', 'port'),
  emailUser: readEnv('EMAIL_USER', 'email_user'),
  emailPass: readEnv('EMAIL_PASS', 'email_pass'),
  emailService: readEnv('EMAIL_SERVICE', 'email_service'),
  emailHost: readEnv('EMAIL_HOST', 'email_host', 'SMTP_HOST', 'smtp_host'),
  emailPort: readNumber(587, 'EMAIL_PORT', 'email_port', 'SMTP_PORT', 'smtp_port'),
  emailSecure: readEnv('EMAIL_SECURE', 'email_secure', 'SMTP_SECURE', 'smtp_secure') === 'true',
  redisUrl: readEnv('REDIS_URL', 'redis_url'),
  jwtToken: readEnv('JWT_TOKEN', 'jwt_token', 'jtw_token'),
  refreshToken: readEnv('REFRESH_TOKEN', 'refresh_token'),
  db: readEnv('DB', 'db'),
  tokenExpiresIn: readEnv('TOKEN_EXPIRES_IN', 'tokenExpiresIn', 'token-expires_in') || '1d',
  otpExpiresAtMs: readNumber(300000, 'OTP_EXPIRES_AT', 'expires_at'),
  cacheTtlMs: readNumber(30000, 'CACHE_TTL_MS', 'cache_ttl_ms'),
};

if (!envConfiguration.jwtToken || !envConfiguration.db) {
  console.error('Missing required environment configuration for database or JWT.');
  process.exit(1);
}

export default envConfiguration;
