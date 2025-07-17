import React from 'react';

interface AlertBannerProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  message: string;
  className?: string;
  role?: string;
}

const typeStyles = {
  error: 'bg-red-50 border-l-4 border-red-400 text-red-700',
  warning: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700',
  info: 'bg-blue-50 border-l-4 border-blue-400 text-blue-700',
  success: 'bg-green-50 border-l-4 border-green-400 text-green-700',
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  message,
  className = '',
  role,
}) => (
  <div
    className={`p-4 my-2 flex items-center gap-2 ${typeStyles[type]} ${className}`}
    role={role || (type === 'error' ? 'alert' : undefined)}
    aria-live={type === 'error' ? 'assertive' : 'polite'}
  >
    <span aria-hidden="true">
      {type === 'error' && '❌'}
      {type === 'warning' && '⚠️'}
      {type === 'info' && 'ℹ️'}
      {type === 'success' && '✅'}
    </span>
    <span>{message}</span>
  </div>
);

export default AlertBanner;
