import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { buttonStyles } from '../styles/defaultStyles';
import { IoIosArrowBack } from 'react-icons/io';

const LoginView: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleGoogleSuccess = (response: CredentialResponse) => {
    // Pass the redirect path to signIn
    signIn(response, from);
    // The page will reload after sign-in due to the implementation in AuthContext
    // After reload, we'll redirect to the original page
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
  };

  const handleReturn = () => {
    // Use the browser's back navigation
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleReturn}
            className="flex items-center text-stone-600 hover:text-stone-800"
            aria-label="Return"
          >
            <IoIosArrowBack className="mr-1" /> Return
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Welcome to Nexus</h1>
          <p className="text-stone-600">Sign in to continue</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              shape="rectangular"
              theme="outline"
              text="signin_with"
              size="large"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-stone-500">
                More options coming soon
              </span>
            </div>
          </div>

          {/* Placeholder for future authentication methods */}
          <div className="opacity-50 pointer-events-none">
            <button
              disabled
              className={`${buttonStyles.secondary} w-full flex justify-center items-center py-3 border border-stone-300 rounded-md`}
            >
              Email & Password
            </button>
          </div>
        </div>

        {/* TODO Add terms of service and privacy policy */}

        {/* <div className="mt-8 text-center text-sm text-stone-500">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-emerald-600 hover:text-emerald-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-emerald-600 hover:text-emerald-700">
              Privacy Policy
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginView;
