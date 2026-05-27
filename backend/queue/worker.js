// Standalone worker: consumes Redis queue, writes to MongoDB, emits events
require('dotenv').config();
const mongoose = require('mongoose');
const getRedisClient = require('./redisClient');
const { popOrder, removePending } = require('./orderQueue');
const { Server } = require('socket.io');
const Order = require('../models/Order');
const backoff = require('backoff');

const MONGO_URI = process.env.MONGO_URI;
const SOCKET_IO_PORT = process.env.SOCKET_IO_PORT || 4001;
const SOCKET_IO_ORIGIN = process.env.SOCKET_IO_ORIGIN || '*';

// Setup Socket.io for admin dashboard
const io = new Server(SOCKET_IO_PORT, {
  cors: { origin: SOCKET_IO_ORIGIN, methods: ['GET', 'POST'] },
});

io.on('connection', socket => {
  console.log('[Worker] Admin dashboard connected');
});

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('[Worker] MongoDB connected'))
  .catch(err => console.error('[Worker] MongoDB error:', err.message));

// Retry-safe order processor
async function processOrder(orderData) {
  return new Promise((resolve, reject) => {
    const order = JSON.parse(orderData);
    const idempotencyKey = order.idempotencyKey;
    const orderId = order.orderId;
    let attempts = 0;
    const call = backoff.call(async (cb) => {
      try {
        // Idempotency: check if order already exists
        const exists = await Order.findOne({ orderId });
        if (exists) return cb(null, 'duplicate');
        await Order.create(order);
        cb(null, 'success');
      } catch (err) {
        cb(err);
      }
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    call.setStrategy(new backoff.ExponentialStrategy({ initialDelay: 1000, maxDelay: 30000 }));
    call.failAfter(10); // 10 attempts max
    call.start();
  });
}

// Main worker loop
async function workerLoop() {
  while (true) {
    const orderData = await popOrder();
    if (!orderData) {
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }
    try {
      const result = await processOrder(orderData);
      const order = JSON.parse(orderData);
      await removePending(order.orderId);
      if (result === 'success') {
        io.emit('new_order', order);
        // Optionally emit order_status_update, payment_update here
        console.log('[Worker] Order saved:', order.orderId);
      } else if (result === 'duplicate') {
        await removePending(order.orderId);
        console.log('[Worker] Duplicate order:', order.orderId);
      }
    } catch (err) {
      console.error('[Worker] Failed to process order:', err.message);
      // Order remains in queue for retry
    }
  }
}

workerLoop();
