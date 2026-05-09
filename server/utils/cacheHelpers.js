const { isRedisConnected, getRedisClient } = require('../config/redis');

const cacheGet = async (key) => {
  if (!isRedisConnected()) {
    return null;
  }
  try {
    const data = await getRedisClient().get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`Redis cacheGet warning for key "${key}": ${error.message}`);
    return null;
  }
};

const cacheSet = async (key, value, ttlSeconds = 60) => {
  if (!isRedisConnected()) {
    return false;
  }
  try {
    await getRedisClient().setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Redis cacheSet warning for key "${key}": ${error.message}`);
    return false;
  }
};

const cacheDelete = async (key) => {
  if (!isRedisConnected()) {
    return false;
  }
  try {
    await getRedisClient().del(key);
    return true;
  } catch (error) {
    console.warn(`Redis cacheDelete warning for key "${key}": ${error.message}`);
    return false;
  }
};

const cacheDeletePattern = async (pattern) => {
  if (!isRedisConnected()) {
    return false;
  }
  try {
    const keys = await getRedisClient().keys(pattern);
    if (keys.length > 0) {
      await getRedisClient().del(...keys);
    }
    return true;
  } catch (error) {
    console.warn(`Redis cacheDeletePattern warning for pattern "${pattern}": ${error.message}`);
    return false;
  }
};

module.exports = { cacheGet, cacheSet, cacheDelete, cacheDeletePattern };
