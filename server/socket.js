let io = null;

function initSocket(serverInstance) {
  const { Server } = require('socket.io');
  io = new Server(serverInstance, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
  });

  io.on('connection', (socket) => {
    // Client joins table room or order room
    socket.on('join:table', (tableNumber) => {
      socket.join(`table:${tableNumber}`);
    });

    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('join:admin', () => {
      socket.join('admin:room');
    });

    socket.on('disconnect', () => {
      // Clean up if needed
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
};
