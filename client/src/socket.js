import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

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

export function joinAdminRoom() {
  socket.emit('join:admin');
}
