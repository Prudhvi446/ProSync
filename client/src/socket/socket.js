import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket = null;

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

export const connectSocket = (workspaceId) => {
  const token = useAuthStore.getState().accessToken;

  if (!token) return null;

  if (socket?.connected) {
    socket.emit('join:workspace', workspaceId);
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    query: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (workspaceId) {
      socket.emit('join:workspace', workspaceId);
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const joinWorkspaceRoom = (workspaceId) => {
  if (socket?.connected) {
    socket.emit('join:workspace', workspaceId);
  }
};

export const leaveWorkspaceRoom = (workspaceId) => {
  if (socket?.connected) {
    socket.emit('leave:workspace', workspaceId);
  }
};
