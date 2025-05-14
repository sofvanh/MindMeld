import React from 'react';
import { PiWarningDuotone } from 'react-icons/pi';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  error?: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  error,
  className = '',
}) => (
  <div className={`flex flex-col flex-grow text-center items-center justify-center px-4 ${className}`}>
    <PiWarningDuotone className="text-red-500 text-4xl mb-4" />
    <h3 className="mb-0">{title}</h3>
    {message && <p><small>{message}</small></p>}
    {error && <p><small>{error}</small></p>}
  </div>
);

export default ErrorMessage;
