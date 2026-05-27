// Socket.io server for admin dashboard real-time updates
const { Server } = require('socket.io');

let io;
function initSocket(server) {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_IO_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });
  io.on('connection', socket => {
    console.log('[Socket.io] Admin connected');
  });
  return io;
}

function emitNewOrder(order) {
  if (io) io.emit('new_order', order);
}
function emitOrderStatusUpdate(order) {
  if (io) io.emit('order_status_update', order);
}
function emitPaymentUpdate(order) {
  if (io) io.emit('payment_update', order);
}

module.exports = {
  initSocket,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitPaymentUpdate,
};
