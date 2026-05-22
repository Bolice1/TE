import mongoose from 'mongoose';

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const toTrimmedString = (value: unknown): string | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  return value.trim();
};

export const ensureNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

export const ensureObjectId = (value: unknown): string | null => {
  if (!isNonEmptyString(value) || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }

  return value;
};

export const ensureDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (!isNonEmptyString(value)) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const isValidEmail = (value: string): boolean => emailPattern.test(value);

export const hasMinimumPasswordLength = (value: string, minimumLength = 8): boolean =>
  value.trim().length >= minimumLength;

export const ensureStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => toTrimmedString(item))
    .filter((item): item is string => item !== null);
};

export const ensurePositiveInteger = (value: unknown, fallback: number) => {
  const parsed = ensureNumber(value);
  if (parsed === null || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};
