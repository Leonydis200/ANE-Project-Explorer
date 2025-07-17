import React, { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './components/ThemeProvider';
import App from './App';
import './index.css';

// Global error handler for uncaught errors
const handleGlobalError = (error: unknown, errorInfo: { componentStack?: string }) => {
  console.error('Uncaught error:', error, errorInfo);
  // In a production app, you'd want to log this to an error reporting service
  // logErrorToService(error, errorInfo);
};

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Create the root
const root = createRoot(rootElement);

// Initial render with error boundary and suspense
root.render(
  <StrictMode>
    <ErrorBoundary 
      fallback={(
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
          <div className="max-w-md rounded-lg border border-red-400 bg-red-50 p-6 text-center text-red-800">
            <h2 className="mb-2 text-xl font-bold">Application Error</h2>
            <p className="mb-4">Something went wrong while loading the application.</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      )}
    >
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="animate-pulse text-2xl font-medium text-foreground">
              Loading Application...
            </div>
          </div>
        }
      >
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);

// Web Vitals (optional: uncomment to measure performance)
// import { reportWebVitals } from './reportWebVitals';
// reportWebVitals(console.log);
