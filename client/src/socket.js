import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || window.location.origin;

export const socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export function joinTableRoom(tableNumber) {
  if (tableNumber) {
    socket.emit('join:table', tableNumber);
  }
}

export function joinOrderRoom(orderId) {
  if (orderId) {
    socket.emit('join:order', orderId);
  }
}

export function joinDeviceRoom(deviceId) {
  if (deviceId) {
    socket.emit('join:device', deviceId);
  }
}

export function joinAdminRoom(token) {
  const adminToken = token || localStorage.getItem('noir_admin_token');
  if (adminToken) {
    socket.emit('join:admin', adminToken);
  }
}

export function emitCallWaiter(tableNumber, callType = 'BANTUAN', note = '') {
  if (tableNumber) {
    socket.emit('call:waiter', { tableNumber, callType, note });
  }
}
