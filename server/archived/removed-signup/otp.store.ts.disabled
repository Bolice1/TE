import OTP from '../models/otp.model.schema.js';
import { getRedisClient, isRedisReady } from '../config/redis.js';

const buildOtpKey = (email: string, purpose: string) => `otp:${purpose}:${email.toLowerCase()}`;

export const storeOtp = async (params: {
  email: string;
  otp: string;
  purpose: 'teacher-signup';
  ttlMs: number;
  expiresAt: Date;
}) => {
  const { email, otp, purpose, ttlMs, expiresAt } = params;

  if (isRedisReady()) {
    const client = getRedisClient();
    if (client) {
      await client.set(buildOtpKey(email, purpose), otp, {
        PX: ttlMs,
      });
      return { backend: 'redis' as const };
    }
  }

  await OTP.deleteMany({ email, purpose });
  await OTP.create({
    email,
    otp,
    purpose,
    expiresAt,
  });

  return { backend: 'mongodb' as const };
};

export const readOtp = async (params: { email: string; purpose: 'teacher-signup' }) => {
  const { email, purpose } = params;

  if (isRedisReady()) {
    const client = getRedisClient();
    if (client) {
      const otp = await client.get(buildOtpKey(email, purpose));
      return otp;
    }
  }

  const record = await OTP.findOne({
    email: email.toLowerCase(),
    purpose,
    expiresAt: { $gt: new Date() },
  });

  return record?.otp ?? null;
};

export const deleteOtp = async (params: { email: string; purpose: 'teacher-signup' }) => {
  const { email, purpose } = params;

  if (isRedisReady()) {
    const client = getRedisClient();
    if (client) {
      await client.del(buildOtpKey(email, purpose));
      return;
    }
  }

  await OTP.deleteMany({ email: email.toLowerCase(), purpose });
};
