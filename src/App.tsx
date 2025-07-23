/**
 * @file App.tsx
 * @description Main application component with routing, error boundaries, and global providers
 */
import React, {
  Suspense,
  lazy,
  useCallback,
  useMemo,
  useEffect,
  useState,
  useRef,
  type ComponentType,
  type ReactNode,
  type FC,
  type ErrorInfo
} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
  QueryCache,
  MutationCache
} from '@tanstack/react-query';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAppError } from '@/hooks/useAppError';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { logger } from '@/lib/logger'; // Adjust path if needed
// Environment flags
const isDev = import.meta.env.DEV;
// Lazy-loaded route components (with retry fallback for transient chunk load failures)
const lazyWithRetry = (factory: () => Promise<{ default: ComponentType<any> }>) => {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      logger.error('Lazy load failed, retrying...', error);
      // Retry once after failure
      return await factory();
    }
  });
};
const CyberDashboard = lazyWithRetry(() => import('@/components/CyberDashboard'));
const CyberTerminal = lazyWithRetry(() => import('@/components/CyberTerminal'));
const ModuleDashboard = lazyWithRetry(() => import('@/components/ModuleDashboard'));
const SystemMonitor = lazyWithRetry(() => import('@/components/SystemMonitor'));
const NotFoundPage = lazyWithRetry(() => import('@/components/NotFoundPage'));
const LoginPage = lazyWithRetry(() => import('@/components/LoginPage'));
const UnauthorizedPage = lazyWithRetry(() => import('@/components/UnauthorizedPage'));
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => logger.error('Query error:', error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => logger.error('Mutation error:', error),
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
const GlobalFallback: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  logger.error('App crashed:', error);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4 text-center text-red-800">
      <h1 className="text-2xl font-bold">Something went wrong.</h1>
      <p className="mt-2">{error?.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
};
const App: FC = () => {
  const isOnline = useOnlineStatus();
  useAppError();
  useEffect(() => {
    if (!isOnline) {
      logger.warn('You are offline.');
    }
  }, [isOnline]);
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset} FallbackComponent={GlobalFallback}>
            <ThemeProvider>
              <Router>
                <Suspense fallback={<div className="p-4 text-gray-500">Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<CyberDashboard />} />
                    <Route path="/terminal" element={<CyberTerminal />} />
                    <Route path="/modules" element={<ModuleDashboard />} />
                    <Route path="/monitor" element={<SystemMonitor />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </Router>
              {isDev && <ReactQueryDevtools initialIsOpen={false} />}
            </ThemeProvider>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>
  );
};
export default App;
export { lazyWithRetry };
