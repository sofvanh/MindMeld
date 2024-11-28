import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { buttonStyles } from '../styles/defaultStyles';

interface SignInOutButtonProps {
  className?: string;
}

const SignInOutButton: React.FC<SignInOutButtonProps> = ({ className = '' }) => {
  const { loading, user, signIn, signOut } = useAuth();

  if (loading) {
    return <LoadingSpinner size="small" />;
  }

  if (user) {
    return (
      <button
        onClick={signOut}
        className={`${buttonStyles.secondary} ${className}`}
      >
        Sign out
      </button>
    );
  }

  return (
    <GoogleLogin
      onSuccess={response => signIn(response)}
      onError={() => console.error('Sign in with Google failed')}
    />
  );
};

export default SignInOutButton;