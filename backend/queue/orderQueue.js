// Order queue abstraction: Redis-backed, with in-memory fallback
const getRedisClient = require('./redisClient');
const { v4: uuidv4 } = require('uuid');

const ORDER_QUEUE_KEY = 'order_queue';
const PENDING_ORDER_HASH = 'pending_orders';

// In-memory fallback queue
const inMemoryQueue = [];
let redisDown = false;

async function pushOrder(order, idempotencyKey) {
  const redis = getRedisClient();
  const orderId = order.orderId || uuidv4();
  const payload = JSON.stringify({ ...order, orderId, idempotencyKey });
  try {
    await redis.rpush(ORDER_QUEUE_KEY, payload);
    await redis.hset(PENDING_ORDER_HASH, orderId, payload);
    redisDown = false;
    return { orderId, queued: true, redis: true };
  } catch (err) {
    // Redis down: fallback to memory
    redisDown = true;
    inMemoryQueue.push(payload);
    return { orderId, queued: true, redis: false };
  }
}

async function popOrder() {
  const redis = getRedisClient();
  if (redisDown) {
    return inMemoryQueue.shift();
  }
  try {
    const payload = await redis.lpop(ORDER_QUEUE_KEY);
    return payload;
  } catch (err) {
    redisDown = true;
    return inMemoryQueue.shift();
  }
}

async function removePending(orderId) {
  const redis = getRedisClient();
  try {
    await redis.hdel(PENDING_ORDER_HASH, orderId);
  } catch (err) {
    // ignore
  }
}

module.exports = {
  pushOrder,
  popOrder,
  removePending,
  inMemoryQueue,
};
