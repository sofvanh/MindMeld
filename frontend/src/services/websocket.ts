import { io, Socket } from 'socket.io-client';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
let socket: Socket | null = null;

// TODO At some point I'd like a heartbeat to keep the connection alive

export const getSocket = (): Socket => {
  if (!socket) {
    console.log('Connecting to backend at:', backendUrl);
    socket = io(backendUrl);

    socket.on('connect', () => {
      console.log('Connection established');
    });

    socket.on('disconnect', (reason) => {
      console.log('Connection lost:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.io.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });
  }
  return socket;
};