const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
      if (tableNumber) socket.join(`table:${tableNumber}`);
    });

    socket.on('join:order', (orderId) => {
      if (orderId) socket.join(`order:${orderId}`);
    });

    // SECURE ADMIN ROOM: Verified by JWT
    socket.on('join:admin', (token) => {
      const JWT_SECRET = process.env.JWT_SECRET || 'fb_secret_key_pro_2026_noir_minimalist';
      if (!token) {
        socket.emit('admin:auth_failed', { message: 'Token admin wajib disertakan untuk masuk room admin' });
        return;
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && (decoded.role === 'admin' || decoded.role === 'superadmin')) {
          socket.join('admin:room');
          socket.emit('admin:auth_success', { user: decoded });
        } else {
          socket.emit('admin:auth_failed', { message: 'Akses ditolak: role tidak memiliki izin' });
        }
      } catch (err) {
        socket.emit('admin:auth_failed', { message: 'Token admin tidak valid atau telah kadaluarsa' });
      }
    });

    // Customer calls waiter
    socket.on('call:waiter', (data) => {
      try {
        const db = require('./db');
        if (!data || !data.tableNumber) return;

        const id = `call_${crypto.randomUUID().slice(0, 8)}`;
        const callData = {
          id,
          table_number: data.tableNumber,
          call_type: data.callType || 'BANTUAN',
          note: data.note || '',
          status: 'PENDING',
          created_at: new Date().toISOString(),
        };

        db.prepare(`
          INSERT INTO waiter_calls (id, table_number, call_type, note, status)
          VALUES (?, ?, ?, ?, 'PENDING')
        `).run(id, callData.table_number, callData.call_type, callData.note);

        io.to('admin:room').emit('waiter:called', callData);
        socket.emit('call:waiter_success', callData);
      } catch (err) {
        console.error('[Socket] Error handling waiter call:', err);
      }
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
