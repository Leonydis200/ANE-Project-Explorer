// src/components/common/ErrorBoundary.tsx
import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

// Extend global window interface
declare global {
  interface Window {
    __REACT_ERROR_BOUNDARY_RECOVERED_ERRORS__?: Array<{
      error: unknown;
      errorInfo: React.ErrorInfo;
      timestamp: number;
    }>;
  }
}

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  errorTimestamp: number | null;
  componentStack: string;
  isRetrying: boolean;
  showDetails: boolean;
  lastResetKey: string | number | null;
  retryCount: number;
}

// Error boundary props interface
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
  onReset?: (error: Error | null) => void;
  resetKeys?: Array<string | number | boolean | null | undefined>;
  onResetKeysChange?: (
    prevResetKeys: Array<string | number | boolean | null | undefined> | undefined,
    resetKeys: Array<string | number | boolean | null | undefined> | undefined
  ) => void;
  fallbackRender?: (props: ErrorBoundaryFallbackProps) => React.ReactNode;
  FallbackComponent?: React.ComponentType<ErrorBoundaryFallbackProps>;
  errorMessage?: string | ((error: Error) => string);
  errorTitle?: string | ((error: Error) => string);
  showRetry?: boolean;
  showHomeButton?: boolean;
  retryButtonText?: string;
  homeButtonText?: string;
  className?: string;
  loadingComponent?: React.ReactNode;
  logErrors?: boolean;
  showErrorDetailsInDev?: boolean;
}

// Fallback component props
interface ErrorBoundaryFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  errorTimestamp: number | null;
  resetErrorBoundary: () => void;
  isRetrying: boolean;
  showDetails: boolean;
  toggleDetails: () => void;
  goHome: () => void;
  copyErrorToClipboard: () => void;
  errorMessage?: string;
  errorTitle?: string;
  showRetry?: boolean;
  showHomeButton?: boolean;
  retryButtonText?: string;
  homeButtonText?: string;
  className?: string;
  retryCount?: number;
  maxRetryAttempts?: number;
}

// Default fallback component
const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  errorInfo,
  errorId = 'unknown',
  errorTimestamp = Date.now(),
  resetErrorBoundary,
  isRetrying = false,
  showDetails = false,
  toggleDetails,
  goHome = () => (window.location.href = '/'),
  copyErrorToClipboard = () => {},
  errorMessage = 'Something went wrong. Please try again later.',
  errorTitle = 'An unexpected error occurred',
  showRetry = true,
  showHomeButton = true,
  retryButtonText = 'Try again',
  homeButtonText = 'Go to home',
  className,
}) => {
  const formattedTimestamp = React.useMemo(
    () => new Date(errorTimestamp).toLocaleString(),
    [errorTimestamp]
  );

  const handleCopyError = React.useCallback(() => {
    try {
      navigator.clipboard.writeText(
        `Error ID: ${errorId}\n` +
          `Time: ${formattedTimestamp}\n` +
          `Message: ${error?.message || 'No error message'}\n` +
          `Stack: ${error?.stack || 'No stack trace'}\n` +
          `Component Stack: ${errorInfo?.componentStack || 'No component stack'}`
      );
      copyErrorToClipboard();
    } catch (copyError) {
      console.error('Failed to copy error details:', copyError);
    }
  }, [error, errorInfo, errorId, formattedTimestamp, copyErrorToClipboard]);

  const handleRetry = React.useCallback(() => {
    if (isRetrying) return;
    resetErrorBoundary();
  }, [isRetrying, resetErrorBoundary]);

  return (
    <div 
      className={cn('p-4 max-w-4xl mx-auto', className)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <Alert variant="destructive">
        <AlertTitle className="text-lg font-semibold">
          {errorTitle}
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">{errorMessage}</p>
          
          <div className="mt-4 space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Error ID: {errorId}</p>
              <p>Time: {formattedTimestamp}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {showRetry && (
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="gap-2"
                  aria-label={retryButtonText}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      {retryButtonText}
                    </>
                  )}
                </Button>
              )}

              {showHomeButton && (
                <Button 
                  variant="outline" 
                  onClick={goHome}
                  aria-label={homeButtonText}
                >
                  {homeButtonText}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDetails}
                className="text-xs gap-1"
                aria-expanded={showDetails}
                aria-controls="error-details"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show details
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyError}
                className="text-xs"
                aria-label="Copy error details to clipboard"
              >
                Copy error
              </Button>
            </div>

            {showDetails && (
              <div 
                id="error-details"
                className="mt-4 p-3 bg-muted/50 rounded-md text-xs font-mono overflow-auto max-h-60"
              >
                <pre>{JSON.stringify({
                  message: error?.message,
                  name: error?.name,
                  stack: error?.stack,
                  componentStack: errorInfo?.componentStack
                }, null, 2)}</pre>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Main ErrorBoundary component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `err_${Math.random().toString(36).substr(2, 9)}`,
      errorTimestamp: Date.now(),
      componentStack: '',
      isRetrying: false,
      showDetails: false,
      lastResetKey: null,
      retryCount: 0,
    };
  }

  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
    errorTimestamp: null,
    componentStack: '',
    isRetrying: false,
    showDetails: false,
    lastResetKey: null,
    retryCount: 0,
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo, componentStack: errorInfo.componentStack });

    // Log error to error tracking service if available
    if (this.props.logErrors !== false) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call onError callback if provided
    if (this.props.onError && this.state.errorId) {
      this.props.onError(error, errorInfo, this.state.errorId);
    }

    // Track error in development
    if (import.meta.env.DEV) {
      window.__REACT_ERROR_BOUNDARY_RECOVERED_ERRORS__ = 
        window.__REACT_ERROR_BOUNDARY_RECOVERED_ERRORS__ || [];
      window.__REACT_ERROR_BOUNDARY_RECOVERED_ERRORS__.push({
        error,
        errorInfo,
        timestamp: Date.now(),
      });
    }
  }

  static getDerivedStateFromProps(
    nextProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ) {
    const { resetKeys } = nextProps;
    const { lastResetKey } = prevState;

    if (resetKeys && lastResetKey !== null) {
      const resetKey = JSON.stringify(resetKeys);
      if (resetKey !== lastResetKey) {
        return {
          hasError: false,
          error: null,
          errorInfo: null,
          errorId: null,
          errorTimestamp: null,
          componentStack: '',
          isRetrying: false,
          showDetails: false,
          lastResetKey: resetKey,
          retryCount: 0,
        };
      }
    }

    return null;
  }

  componentDidUpdate(
    prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ) {
    const { resetKeys, onResetKeysChange } = this.props;
    
    if (resetKeys !== prevProps.resetKeys) {
      onResetKeysChange?.(prevProps.resetKeys, resetKeys);
    }

    if (this.state.error && !prevState.error) {
      // Error was just set - log it
      this.logError(this.state.error, this.state.errorInfo);
    }
  }

  logError(error: Error, errorInfo: React.ErrorInfo | null) {
    // In a real app, you would send the error to an error reporting service
    // Example: logErrorToService(error, errorInfo);
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    const { onReset } = this.props;
    const { error } = this.state;

    this.setState(
      {
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        errorTimestamp: null,
        componentStack: '',
        isRetrying: true,
        showDetails: false,
        retryCount: this.state.retryCount + 1,
      },
      () => {
        if (onReset) {
          onReset(error);
        }
      }
    );
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  goHome = () => {
    window.location.href = '/';
  };

  copyErrorToClipboard = () => {
    const { error, errorInfo, errorId, errorTimestamp } = this.state;
    const errorDetails = {
      id: errorId,
      timestamp: errorTimestamp ? new Date(errorTimestamp).toISOString() : null,
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  render() {
    const {
      children,
      fallback: FallbackComponent,
      fallbackRender,
      errorMessage,
      errorTitle,
      showRetry = true,
      showHomeButton = true,
      retryButtonText = 'Try again',
      homeButtonText = 'Go to home',
      className,
    } = this.props;

    const {
      hasError,
      error,
      errorInfo,
      errorId,
      errorTimestamp,
      isRetrying,
      showDetails,
    } = this.state;

    if (!hasError) {
      return children;
    }

    const fallbackProps: ErrorBoundaryFallbackProps = {
      error: error!,
      errorInfo,
      errorId,
      errorTimestamp,
      resetErrorBoundary: this.resetErrorBoundary,
      isRetrying,
      showDetails,
      toggleDetails: this.toggleDetails,
      goHome: this.goHome,
      copyErrorToClipboard: this.copyErrorToClipboard,
      errorMessage: typeof errorMessage === 'function' 
        ? errorMessage(error!) 
        : errorMessage,
      errorTitle: typeof errorTitle === 'function' 
        ? errorTitle(error!) 
        : errorTitle,
      showRetry,
      showHomeButton,
      retryButtonText,
      homeButtonText,
      className,
    };

    if (typeof fallbackRender === 'function') {
      return fallbackRender(fallbackProps);
    }

    if (FallbackComponent) {
      return <FallbackComponent {...fallbackProps} />;
    }

    return <ErrorBoundaryFallback {...fallbackProps} />;
  }
}

// Export the ErrorBoundary component with proper TypeScript types
export default ErrorBoundary;

// Export the fallback component for external use
export { ErrorBoundaryFallback };

// Export types for external use
export type { 
  ErrorBoundaryProps, 
  ErrorBoundaryState, 
  ErrorBoundaryFallbackProps 
};