import crypto from 'crypto';
import SignupToken from '../models/signup-token.model.js';

const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const createSignupToken = async (params: {
  email: string;
  ttlMs: number;
}): Promise<string> => {
  const { email, ttlMs } = params;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlMs);

  await SignupToken.deleteMany({
    email: email.toLowerCase(),
  });

  await SignupToken.create({
    email: email.toLowerCase(),
    token,
    verified: true,
    expiresAt,
  });

  return token;
};

export const validateSignupTokenExists = async (token: string): Promise<boolean> => {
  const signupToken = await SignupToken.findOne({
    token,
    verified: true,
    expiresAt: { $gt: new Date() },
  });

  return !!signupToken;
};

export const getSignupTokenEmail = async (token: string): Promise<string | null> => {
  const signupToken = await SignupToken.findOne({
    token,
    verified: true,
    expiresAt: { $gt: new Date() },
  });

  return signupToken?.email ?? null;
};

export const deleteSignupToken = async (token: string): Promise<void> => {
  await SignupToken.deleteOne({ token });
};

export const deleteSignupTokenByEmail = async (email: string): Promise<void> => {
  await SignupToken.deleteMany({ email: email.toLowerCase() });
};
