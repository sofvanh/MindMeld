import React from 'react';
import { CredentialResponse, GoogleLogin, googleLogout } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const SignInOutButton: React.FC = () => {
  const { user, setUser } = useAuth();

  const handleSignInSuccess = (response: CredentialResponse) => {
    console.log('Sign in success:', response);
    // TODO Send response to backend to verify and get user info, or create new user
    setUser({ id: 'usr_1', name: 'User 1' });
  };

  const handleSignInError = () => {
    console.log('Sign in failed');
  };

  const handleSignOut = () => {
    googleLogout();
    setUser(null);
    console.log('Signed out successfully');
  };

  // TODO Visual update
  return user ? (
    <button onClick={handleSignOut}>Sign out</button>
  ) : (
    <GoogleLogin
      onSuccess={handleSignInSuccess}
      onError={handleSignInError}
      useOneTap
    />
  );
};

export default SignInOutButton;
