import * as React from 'react';
import { Component, ErrorInfo, ReactNode, ComponentType } from 'react';

// Add JSX namespace for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw, AlertCircle, Copy, AlertTriangle, Home, Info } from 'lucide-react';

// Define the window interface to include the clipboard API
declare global {
  interface Window {
    clipboardData: any;
  }

  // Add Vite env types
  interface ImportMeta {
    env: {
      MODE: string;
      DEV: boolean;
      VITE_APP_VERSION?: string;
      VITE_APP_BUILD_DATE?: string;
    };
  }
}

// Environment variable types
type EnvVars = {
  NODE_ENV?: 'development' | 'production' | 'test';
  REACT_APP_VERSION?: string;
  REACT_APP_BUILD_DATE?: string;
  VITE_APP_VERSION?: string;
  VITE_APP_BUILD_DATE?: string;
  MODE?: string;
  DEV?: boolean;
};

// Type definitions for error boundary props and state
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<ErrorFallbackProps>;
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  onRetry?: () => void;
  onGoHome?: () => void;
  onCopyError?: () => void;
  resetTimeout?: number;
  retryButtonText?: string;
  homeButtonText?: string;
  showRetryButton?: boolean;
  showHomeButton?: boolean;
  logErrors?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  errorTimestamp: string;
  componentStack: string;
  showDetails: boolean;
  isRetrying: boolean;
  lastResetKey: number;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  componentStack: string;
  onReset: () => void;
  onRetry: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
  onCopyError: () => void;
  retryButtonText: string;
  homeButtonText: string;
  showRetryButton: boolean;
  showHomeButton: boolean;
}

// Environment detection - works with both Vite and Create React App
const getEnvVar = (): EnvVars => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env as unknown as EnvVars;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env as unknown as EnvVars;
  }
  return {};
};

const env = getEnvVar();
const isDev = env.DEV || env.NODE_ENV === 'development' || false;

// Helper function to get error details
const getErrorDetails = (error: Error, errorInfo: ErrorInfo | null) => {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack || 'No stack trace available',
    componentStack: errorInfo?.componentStack || 'No component stack available',
  };
};

// Helper function to format error stack for display
const formatErrorStack = (stack: string | undefined): string => {
  if (!stack) return 'No stack trace available';
  return stack
    .split('\n')
    .map((line) => line.trim())
    .join('\n');
};

// Helper function to generate a unique error ID
const generateErrorId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Default error fallback component with proper prop types
const DefaultErrorFallback = ({
  error,
  errorInfo,
  componentStack,
  onReset,
  onRetry,
  showDetails,
  onToggleDetails,
  onCopyError,
  retryButtonText = 'Try Again',
  homeButtonText = 'Go Home',
  showRetryButton = true,
  showHomeButton = true,
}: ErrorFallbackProps) => {
  const handleCopyError = async () => {
    if (!error) return;

    try {
      const errorDetails = getErrorDetails(error, errorInfo);
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      if (onCopyError) onCopyError();
    } catch (copyError) {
      console.error('Failed to copy error details:', copyError);
    }
  };

  return (
    <div className={cn('p-4 max-w-4xl mx-auto')}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>An unexpected error occurred. Please try again or contact support if the problem persists.</p>

          {error?.message && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="font-medium">{error.message}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {showRetryButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                {retryButtonText}
              </Button>
            )}

            {showHomeButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                {homeButtonText}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleDetails}
              className="ml-auto flex items-center gap-1"
            >
              {showDetails ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <Info className="h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          </div>

          {showDetails && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Error Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyError}
                  className="text-xs h-6 px-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>

              <div className="bg-muted/50 p-3 rounded-md text-xs font-mono overflow-auto max-h-60">
                <p className="font-medium mb-1">{error?.name || 'Error'}</p>
                <p className="mb-2">{error?.message || 'No error message available'}</p>

                {error?.stack && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Stack Trace:</p>
                    <pre className="whitespace-pre-wrap break-words">
                      {formatErrorStack(error.stack)}
                    </pre>
                  </div>
                )}

                {componentStack && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Component Stack:</p>
                    <pre className="whitespace-pre-wrap break-words">
                      {componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly define state and props to avoid TypeScript errors
  public state: ErrorBoundaryState;
  public props: Readonly<ErrorBoundaryProps> & Readonly<{ children?: ReactNode }>;
  static defaultProps: Partial<ErrorBoundaryProps> = {
    resetTimeout: 0,
    retryButtonText: 'Try Again',
    homeButtonText: 'Go Home',
    showRetryButton: true,
    showHomeButton: true,
  };

  private resetTimeout: number | NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      errorTimestamp: '',
      componentStack: '',
      showDetails: false,
      isRetrying: false,
      lastResetKey: 0,
    };

    // Bind methods
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.toggleErrorDetails = this.toggleErrorDetails.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
    this.copyErrorToClipboard = this.copyErrorToClipboard.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
      errorTimestamp: new Date().toISOString(),
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, logErrors = true } = this.props;
    const { errorId } = this.state;

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId: errorId || generateErrorId(),
      errorTimestamp: new Date().toISOString(),
      componentStack: errorInfo?.componentStack || '',
      hasError: true,
    });

    // Log error to console in development
    if (logErrors && isDev) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call the onError callback if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (e) {
        console.error('Error in onError callback:', e);
      }
    }

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Example: Report to error tracking service
      // reportErrorToService(error, errorInfo, errorId);

  componentDidMount(): void {
    // Handle unhandled promise rejections
    private handleUnhandledRejection = (event: unknown): void => {
      const rejectionEvent = event as PromiseRejectionEvent;
      const { onUnhandledRejection } = this.props;
      
      if (onUnhandledRejection) {
        onUnhandledRejection(rejectionEvent.reason, rejectionEvent);
      } else {
        this.setState({
          error: rejectionEvent.reason instanceof Error 
            ? rejectionEvent.reason 
            : new Error(String(rejectionEvent.reason)),
          hasError: true,
        });
      }
    };

    // Handle global errors
    private handleGlobalError = (event: unknown): void => {
      const errorEvent = event as ErrorEvent;
      const { onGlobalError } = this.props;
      
      if (onGlobalError) {
        onGlobalError(
          errorEvent.error || new Error(errorEvent.message), 
          errorEvent
        );
      } else if (!this.state.hasError) {
        this.setState({
          error: errorEvent.error || new Error(errorEvent.message),
          hasError: true,
        });
      }
    };

    // Add event listeners
    window.addEventListener('error', this.handleGlobalError as EventListener);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection as EventListener);
  }

  componentWillUnmount(): void {
    // Clean up event listeners
    if (this.handleGlobalError) {
      window.removeEventListener('error', this.handleGlobalError as EventListener);
    }
    if (this.handleUnhandledRejection) {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection as EventListener);
    }

    // Clear any pending timeouts
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
  }

  // ...

  copyErrorToClipboard = (): void => {
    const { error, errorInfo, errorId, errorTimestamp } = this.state;
    const { onCopyError } = this.props;

    if (!error) return;

    try {
      const errorDetails = getErrorDetails(error, errorInfo);
      // Get environment variables
      const env = getEnvVar();
      const envInfo = {
        environment: env.MODE || env.NODE_ENV || 'development',
        version: env.VITE_APP_VERSION || env.REACT_APP_VERSION || 'unknown',
        buildDate: env.VITE_APP_BUILD_DATE || env.REACT_APP_BUILD_DATE || 'unknown',
      };

      const textToCopy = JSON.stringify(
        {
          errorId,
          timestamp: errorTimestamp,
          ...errorDetails,
          ...envInfo,
        },
        null,
        2
      );

      // Fallback for older browsers
      const copyToClipboard = (text: string): Promise<void> => {
        if (navigator.clipboard) {
          return navigator.clipboard.writeText(text);
        }
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (!successful) {
            throw new Error('Copy command was unsuccessful');
          }
          return Promise.resolve();
        } catch (err) {
          return Promise.reject(err);
        } finally {
          document.body.removeChild(textArea);
        }
      };

      copyToClipboard(textToCopy).then(() => {
        // Call the onCopyError callback if provided
        if (onCopyError) {
          try {
            onCopyError();
          } catch (e) {
            console.error('Error in onCopyError callback:', e);
          }
        }
      }).catch((e) => {
        console.error('Failed to copy to clipboard:', e);
      });
    } catch (e) {
      console.error('Failed to copy error details:', e);
    }
  };

  render() {
    const { 
      children, 
      fallback: FallbackComponent = DefaultErrorFallback,
      className,
      style,
      retryButtonText = 'Try Again',
      homeButtonText = 'Go Home',
      showRetryButton = true,
      showHomeButton = true,
    } = this.props;
    
    const { 
      hasError, 
      error, 
      errorInfo, 
      showDetails, 
      componentStack,
      isRetrying,
      lastResetKey,
    } = this.state;

    if (hasError && error) {
      return (
        <div 
          key={`error-boundary-${lastResetKey}`}
          className={cn("error-boundary", className)} 
          style={style}
        >
          <FallbackComponent 
            error={error}
            errorInfo={errorInfo}
            componentStack={componentStack}
            onReset={this.handleGoHome}
            onRetry={this.resetErrorBoundary}
            showDetails={showDetails}
            onToggleDetails={this.toggleErrorDetails}
            onCopyError={this.copyErrorToClipboard}
            retryButtonText={retryButtonText}
            homeButtonText={homeButtonText}
            showRetryButton={showRetryButton}
            showHomeButton={showHomeButton}
          />
        </div>
      );
    }

    if (isRetrying) {
      return (
        <div className="flex items-center justify-center p-4">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    return <>{children}</>;
  }
}

// Export the default fallback component for external use
export { DefaultErrorFallback as ErrorBoundaryFallback };

// Export the helper functions for testing and reuse
export { getErrorDetails, formatErrorStack, generateErrorId };

// Export the prop types for external use
export type { ErrorBoundaryProps, ErrorFallbackProps };

export default ErrorBoundary;
