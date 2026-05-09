const Redis = require('ioredis');

let redisClient = null;
let connected = false;

const connectRedis = () => {
  try {
    let redisUrl = process.env.REDIS_URL || '';

    if (redisUrl.startsWith('https://')) {
      redisUrl = redisUrl.replace('https://', 'rediss://');
    }

    const needsTls = redisUrl.startsWith('rediss://');

    redisClient = new Redis(redisUrl, {
      password: process.env.REDIS_TOKEN,
      tls: needsTls ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('Redis: Max retries reached. Operating without cache.');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: false,
    });

    redisClient.on('connect', () => {
      connected = true;
      console.log('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      connected = false;
      console.warn(`Redis connection warning: ${err.message}`);
    });

    redisClient.on('close', () => {
      connected = false;
    });
  } catch (error) {
    connected = false;
    console.warn(`Redis initialization warning: ${error.message}`);
  }
};

const isRedisConnected = () => connected && redisClient !== null;

const getRedisClient = () => redisClient;

module.exports = { connectRedis, isRedisConnected, getRedisClient };
