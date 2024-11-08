import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { secondaryButtonClasses } from '../styles/defaultStyles';
import LoadingSpinner from './LoadingSpinner';

const SignInOutButton: React.FC = () => {
  const { loading, user, signIn, signOut } = useAuth();

  return (
    <div className="h-10 flex items-center">
      {loading ? (
        <LoadingSpinner size="small" />
      ) : user ? (
        <button
          onClick={signOut}
          className={secondaryButtonClasses}
        >
          Sign out
        </button>
      ) : (
        <GoogleLogin
          onSuccess={response => signIn(response)}
          onError={() => console.error('Sign in with Google failed')}
          useOneTap
        />
      )}
    </div>
  );
};

export default SignInOutButton;