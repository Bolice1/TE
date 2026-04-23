interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max 100 requests per window

export function rateLimit(ip: string): {
  success: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const key = ip;

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    return {
      success: true,
      remaining: MAX_REQUESTS - 1,
      resetTime: store[key].resetTime,
    };
  }

  store[key].count++;

  if (store[key].count > MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    };
  }

  return {
    success: true,
    remaining: MAX_REQUESTS - store[key].count,
    resetTime: store[key].resetTime,
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000); // Cleanup every minute
