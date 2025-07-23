import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary'; // or your local import
import { ThemeProvider } from './components/ThemeProvider';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const FallbackUI = ({ error, resetErrorBoundary }: any) => (
  <div className="flex h-screen w-full items-center justify-center bg-background p-4">
    <div className="max-w-md rounded-lg border border-red-400 bg-red-50 p-6 text-center text-red-800">
      <h2 className="mb-2 text-xl font-bold">Application Error</h2>
      <p className="mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  </div>
);

const LoadingFallback = (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="animate-pulse text-2xl font-medium text-foreground">
      Loading Application...
    </div>
  </div>
);
const handleGlobalError = (error: unknown, errorInfo: { componentStack?: string }) => {
  console.error('Uncaught error:', error, errorInfo);
};
      <Suspense fallback={LoadingFallback}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Suspense>