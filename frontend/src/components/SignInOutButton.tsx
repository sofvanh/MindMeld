import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { buttonStyles } from '../styles/defaultStyles';

interface SignInOutButtonProps {
  className?: string;
}

const SignInOutButton: React.FC<SignInOutButtonProps> = ({ className = '' }) => {
  const { loading, user, signOut } = useAuth();
  const navigate = useNavigate();

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
    <button
      onClick={() => navigate('/login')}
      className={`${buttonStyles.primary} ${className}`}
    >
      Sign in
    </button>
  );
};

export default SignInOutButton;
