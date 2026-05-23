import { getRedisClient, isRedisReady } from '../config/redis.js';

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

class MemoryCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string) {
    this.store.delete(key);
  }

  deleteByPrefix(prefix: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}

export const appCache = new MemoryCache();

export const buildTeacherCachePrefix = (teacherId: string, domain: string) =>
  `teacher:${teacherId}:${domain}`;

export const getCachedJson = async <T>(key: string): Promise<T | null> => {
  const memoryValue = appCache.get<T>(key);
  if (memoryValue !== null) {
    return memoryValue;
  }

  if (!isRedisReady()) {
    return null;
  }

  const client = getRedisClient();
  if (!client) {
    return null;
  }

  const rawValue = await client.get(key);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as T;
    return parsed;
  } catch {
    return null;
  }
};

export const setCachedJson = async <T>(key: string, value: T, ttlMs: number) => {
  appCache.set(key, value, ttlMs);

  if (!isRedisReady()) {
    return;
  }

  const client = getRedisClient();
  if (!client) {
    return;
  }

  await client.set(key, JSON.stringify(value), {
    PX: ttlMs,
  });
};

export const deleteCachedByPrefix = async (prefix: string) => {
  appCache.deleteByPrefix(prefix);

  if (!isRedisReady()) {
    return;
  }

  const client = getRedisClient();
  if (!client) {
    return;
  }

  const keysToDelete: string[] = [];
  for await (const key of client.scanIterator({
    MATCH: `${prefix}*`,
    COUNT: 100,
  })) {
    keysToDelete.push(String(key));
  }

  if (keysToDelete.length > 0) {
    await client.del(keysToDelete);
  }
};

export const invalidateTeacherDomains = async (teacherId: string, domains: string[]) => {
  await Promise.all(domains.map((domain) => deleteCachedByPrefix(buildTeacherCachePrefix(teacherId, domain))));
};

export const getOrSetCachedValue = async <T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
) => {
  const cachedValue = await getCachedJson<T>(key);
  if (cachedValue !== null) {
    return cachedValue;
  }

  const loadedValue = await loader();
  await setCachedJson(key, loadedValue, ttlMs);
  return loadedValue;
};

/** Read-through list cache (memory + Redis when available). */
export const readListCache = getCachedJson;

/** Write list cache (memory + Redis when available). */
export const writeListCache = setCachedJson;
