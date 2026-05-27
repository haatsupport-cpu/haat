// Redis connection utility
const Redis = require('ioredis');
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redis;
function getRedisClient() {
  if (!redis) {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy(times) {
        return Math.min(times * 100, 2000);
      },
    });
    redis.on('error', err => {
      console.error('[Redis] Error:', err.message);
    });
  }
  return redis;
}

module.exports = getRedisClient;
