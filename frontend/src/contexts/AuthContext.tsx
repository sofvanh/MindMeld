import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { createContext, useContext, useState, ReactNode } from 'react';


const OAUTH_CLIENT_ID = process.env.REACT_APP_OAUTH_CLIENT_ID || '';

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <GoogleOAuthProvider clientId={OAUTH_CLIENT_ID}>
      <AuthContext.Provider value={{ user, setUser }}>
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