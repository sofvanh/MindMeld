import { CredentialResponse, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebSocket } from './WebSocketContext';
import { User } from '../shared/types';

const OAUTH_CLIENT_ID = process.env.REACT_APP_OAUTH_CLIENT_ID || '';
const TOKEN_STORAGE_KEY = 'mindmeld_auth_token';
const REDIRECT_PATH_KEY = 'mindmeld_redirect_path';

interface AuthContextType {
  loading: boolean;
  user: User | null;
  signIn: (response: CredentialResponse, redirectPath?: string) => void;
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

    if (storedToken && socket) {
      setLoading(true);
      socket.emit('authenticate', { token: storedToken }, (response: any) => {
        if (response.success) {
          setUser(response.data.user);

          // Check if we need to redirect after authentication
          const redirectPath = localStorage.getItem(REDIRECT_PATH_KEY);
          if (redirectPath) {
            localStorage.removeItem(REDIRECT_PATH_KEY);
            window.location.href = redirectPath;
          }
        } else {
          console.error('Authentication failed:', response.error);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setUser(null);
        }
        setLoading(false);
      });
    }
  }, [socket]);

  const signIn = (response: CredentialResponse, redirectPath?: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, response.credential!);

    // Store redirect path if provided
    if (redirectPath) {
      localStorage.setItem(REDIRECT_PATH_KEY, redirectPath);
    }

    window.location.reload();
  }

  const signOut = () => {
    socket?.emit('logout', {}, (response: any) => {
      if (response.success) {
        googleLogout();
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.location.reload();
      } else {
        console.error('Logout failed:', response.error);
      }
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
