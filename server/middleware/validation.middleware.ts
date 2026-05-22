import mongoose from 'mongoose';

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

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
