import { CredentialResponse, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebSocket } from './WebSocketContext';

const OAUTH_CLIENT_ID = process.env.REACT_APP_OAUTH_CLIENT_ID || '';
const TOKEN_STORAGE_KEY = 'mindmeld_auth_token';

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  loading: boolean;
  user: User | null;
  signIn: (response: CredentialResponse) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  loading: false,
  user: null,
  signIn: () => { },
  signOut: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { socket } = useWebSocket();

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    if (storedToken && socket && !user && !loading) {
      setLoading(true);
      socket.emit('authenticate', storedToken, (response: any) => {
        if (response.success) {
          setUser(response.user);
        } else {
          console.error('Authentication failed');
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
        setLoading(false);
      });
    }
  }, [socket, loading, user]);

  const signIn = (response: CredentialResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, response.credential!);
    window.location.reload();
  }

  const signOut = () => {
    socket?.emit('logout', () => {
      setLoading(true);
      googleLogout();
      setUser(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.location.reload();
    });
  }

  return (
    <GoogleOAuthProvider clientId={OAUTH_CLIENT_ID}>
      <AuthContext.Provider value={{ loading, user, signIn, signOut }}>
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