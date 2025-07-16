import React, { Suspense } from 'react';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyLoader({ children, fallback = 'Loading...' }: LazyLoaderProps) {
  return <Suspense fallback={<div>{fallback}</div>}>{children}</Suspense>;
}
