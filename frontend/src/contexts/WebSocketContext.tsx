import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../services/websocket';

interface WebSocketContextType {
  socket: Socket | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    // Handle reconnection authentication
    // TODO Probably this should be with the other auth logic
    socket.io.on('reconnect', () => {
      const storedToken = localStorage.getItem('mindmeld_auth_token');
      if (storedToken) {
        socket.emit('authenticate', { token: storedToken }, (response: any) => {
          if (!response.success) {
            console.error('Re-authentication failed after reconnect');
            localStorage.removeItem('mindmeld_auth_token');
            window.location.reload();
          }
        });
      }
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);