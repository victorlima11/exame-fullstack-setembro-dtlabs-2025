import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ path: ".env.TEMPLATE" });

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});