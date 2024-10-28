import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebSocket } from './WebSocketContext';

const OAUTH_CLIENT_ID = process.env.REACT_APP_OAUTH_CLIENT_ID || '';
const TOKEN_STORAGE_KEY = 'mindmeld_auth_token';

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => { },
  setAuthToken: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { socket } = useWebSocket();

  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken && socket) {
      socket.emit('authenticate', storedToken, (response: any) => {
        if (response.success) {
          setUser(response.user);
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      });
    }
  }, [socket]);

  return (
    <GoogleOAuthProvider clientId={OAUTH_CLIENT_ID}>
      <AuthContext.Provider value={{ user, setUser, setAuthToken }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};