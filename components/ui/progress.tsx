import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className = '' }: ProgressProps) {
  return (
    <div className={`w-full bg-gray-300 rounded overflow-hidden ${className}`}>
      <div
        style={{ width: `${value}%` }}
        className="bg-blue-600 h-2"
      />
    </div>
  );
}
