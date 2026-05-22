import { createClient, type RedisClientType } from 'redis';
import envConfiguration from './env.js';

let redisClient: RedisClientType | null = null;
let redisAvailable = false;

export const connectRedis = async () => {
  if (!envConfiguration.redisUrl) {
    console.warn('Redis URL not configured. Redis-backed OTP storage is disabled.');
    return null;
  }

  if (redisClient?.isOpen) {
    redisAvailable = true;
    return redisClient;
  }

  redisClient = createClient({
    url: envConfiguration.redisUrl,
  });

  redisClient.on('error', (error) => {
    redisAvailable = false;
    console.error('Redis connection error:', error);
  });

  try {
    await redisClient.connect();
    redisAvailable = true;
    console.log('Redis connected.');
    return redisClient;
  } catch (error) {
    redisAvailable = false;
    console.error('Failed to connect to Redis:', error);
    return null;
  }
};

export const getRedisClient = () => redisClient;

export const isRedisReady = () => Boolean(redisClient?.isOpen && redisAvailable);
