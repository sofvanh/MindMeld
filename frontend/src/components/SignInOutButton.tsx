import React from 'react';
import { CredentialResponse, GoogleLogin, googleLogout } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { defaultTextButtonClasses } from '../styles/defaultStyles';
import { useWebSocket } from '../contexts/WebSocketContext';

const SignInOutButton: React.FC = () => {
  const { user, setUser, setAuthToken } = useAuth();
  const { socket } = useWebSocket();

  const handleSignInSuccess = (response: CredentialResponse) => {
    socket?.emit('authenticate', response.credential, (socketRes: any) => {
      if (socketRes.success) {
        setUser(socketRes.user);
        setAuthToken(response.credential!);
      } else {
        console.error('Failed to authenticate with backend');
      }
    })
  };

  const handleSignOut = () => {
    googleLogout();
    socket?.emit('logout', () => {
      setUser(null);
      setAuthToken(null);
      console.log('Signed out successfully');
    });
  };

  return (
    <div className="h-10 flex items-center">
      {user ? (
        <button
          onClick={handleSignOut}
          className={defaultTextButtonClasses}
        >
          Sign out
        </button>
      ) : (
        <GoogleLogin
          onSuccess={handleSignInSuccess}
          onError={() => console.error('Sign in with Google failed')}
          useOneTap
        />
      )}
    </div>
  );
};

export default SignInOutButton;