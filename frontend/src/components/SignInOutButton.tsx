import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { buttonStyles } from '../styles/defaultStyles';

interface SignInOutButtonProps {
  className?: string;
}

const SignInOutButton: React.FC<SignInOutButtonProps> = ({ className = '' }) => {
  const { loading, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner size="small" />;
  }

  if (user) {
    return (
      <button
        onClick={signOut}
        className={`${buttonStyles.secondary} ${className} whitespace-nowrap`}
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/login', { state: { from: location } })}
      className={`${buttonStyles.primary} ${className} whitespace-nowrap`}
    >
      Sign in
    </button>
  );
};

export default SignInOutButton;
