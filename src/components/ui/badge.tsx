import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded ${className}`}
    >
      {children}
    </span>
  );
}
