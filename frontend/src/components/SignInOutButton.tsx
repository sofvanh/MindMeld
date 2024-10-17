import React from 'react';
import { CredentialResponse, GoogleLogin, googleLogout } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { defaultButtonClasses } from '../styles/defaultStyles';

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
  return (
    <div className="h-10 flex items-center">
      {user ? (
        <button
          onClick={handleSignOut}
          className={defaultButtonClasses}
        >
          Sign out
        </button>
      ) : (
        <GoogleLogin
          onSuccess={handleSignInSuccess}
          onError={handleSignInError}
          useOneTap
        />
      )}
    </div>
  );
};

export default SignInOutButton;
