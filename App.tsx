import { 
  Suspense, 
  lazy, 
  useCallback, 
  useMemo, 
  useEffect,
  useState,
  useRef,
  type ComponentType,
  type ReactNode,
  type FC
} from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  QueryClient, 
  QueryClientProvider, 
  QueryErrorResetBoundary,
  QueryCache,
  MutationCache
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAppError } from '@/hooks/useAppError';
import { logger } from '@/lib/logger';

// Dummy auth hooks - replace with your actual implementation
const useAuth = () => {
  // Return true if authenticated
  return true; // or false
};
const useUserRoles = () => {
  // Return an array of user roles
  return ['admin']; // example roles
};

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

type RouteConfig = {
  path: string;
  component: ComponentType;
  fallback?: ReactNode;
  requiresAuth?: boolean;
  meta?: {
    title?: string;
    description?: string;
    roles?: string[];
  };
  preload?: () => void; // optional preload function
};

const lazyWithRetry = (importFn: () => Promise<{ default: ComponentType }>) => {
  const lazyComponent = lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      logger.error('Failed to load component', { error });
      await new Promise(res => setTimeout(res, 1000));
      return importFn();
    }
  });

  // Attach preload method to component
  (lazyComponent as any).preload = importFn;

  return lazyComponent;
};

// Lazy load routes
const CyberDashboard = lazyWithRetry(() => import('@/components/CyberDashboard'));
const CyberTerminal = lazyWithRetry(() => import('@/components/CyberTerminal'));
const ModuleDashboard = lazyWithRetry(() => import('@/components/ModuleDashboard'));
const SystemMonitor = lazyWithRetry(() => import('@/components/SystemMonitor'));
const NotFoundPage = lazyWithRetry(() => import('@/components/NotFoundPage'));

const routes: RouteConfig[] = [
  {
    path: '/',
    component: CyberDashboard,
    meta: { title: 'Dashboard', description: 'Overview of system status and metrics' },
    preload: CyberDashboard.preload,
  },
  {
    path: '/terminal',
    component: CyberTerminal,
    requiresAuth: true,
    meta: { title: 'Terminal', description: 'Interactive command line interface', roles: ['admin', 'operator'] },
    preload: CyberTerminal.preload,
  },
  {
    path: '/modules',
    component: ModuleDashboard,
    requiresAuth: true,
    meta: { title: 'Modules', description: 'Manage and monitor system modules', roles: ['admin', 'operator'] },
    preload: ModuleDashboard.preload,
  },
  {
    path: '/system',
    component: SystemMonitor,
    requiresAuth: true,
    meta: { title: 'System Monitor', description: 'Real-time system performance metrics', roles: ['admin'] },
    preload: SystemMonitor.preload,
  },
  {
    path: '*',
    component: NotFoundPage,
    meta: { title: 'Not Found' },
    preload: NotFoundPage.preload,
  },
];

// Preload routes on hover
const RoutePreloader: FC<{ path: string }> = ({ path }) => {
  const preload = useCallback(() => {
    const route = routes.find(r => r.path === path);
    if (route?.preload) {
      route.preload();
    }
  }, [path]);

  return <div onMouseEnter={preload} className="hidden" aria-hidden="true" />;
};

// Query client setup
const createQueryClient = () => {
  const queryCache = new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        logger.error('Query error', { error, queryKey: query.queryKey, meta: query.meta });
      }
    },
  });
  const mutationCache = new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) return;
      logger.error('Mutation error', { error, mutationKey: mutation.options.mutationKey });
    },
    onSuccess: (data, variables, context, mutation) => {
      logger.info('Mutation successful', { mutationKey: mutation.options.mutationKey, data, variables });
    },
  });
  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: 'always',
        retry: (failureCount, error: any) => {
          if ([404, 401].includes(error?.response?.status)) return false;
          return failureCount < 3;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        onError: (error: Error) => logger.error('Query error', { error }),
      },
      mutations: {
        retry: (failureCount, error: any) => {
          if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
          return failureCount < 2;
        },
        onError: (error: Error) => logger.error('Mutation error', { error }),
      },
    },
  });
};

// PageLoader and ErrorFallback can be mostly copied as-is from your version

const PageLoader: FC<{ message?: string; fullPage?: boolean }> = ({ message = 'Loading application...', fullPage = true }) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <div
      className={`flex flex-col items-center justify-center ${fullPage ? 'min-h-screen' : 'py-16'} bg-background transition-opacity duration-200`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary/20 rounded-full" aria-hidden="true" />
        <div
          className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
          style={{ borderImage: 'linear-gradient(to right, var(--primary), var(--primary-foreground)) 1' }}
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
      <p className="mt-4 text-foreground/80 text-sm font-medium">{message}</p>
      <p className="text-xs text-muted-foreground mt-2">Please wait...</p>
    </div>
  );
};

const ErrorFallback: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { reportError } = useAppError();
  const [showDetails, setShowDetails] = useState(false);
  const errorReported = useRef(false);

  useEffect(() => {
    if (error && !errorReported.current) {
      reportError(error, { location: location.pathname, componentStack: (error as any).stack });
      errorReported.current = true;
    }
  }, [error, location.pathname, reportError]);

  const handleRetry = useCallback(() => resetErrorBoundary(), [resetErrorBoundary]);
  const handleGoHome = useCallback(() => { navigate('/', { replace: true }); resetErrorBoundary(); }, [navigate, resetErrorBoundary]);
  const handleReload = useCallback(() => window.location.reload(), []);
  const toggleDetails = useCallback(() => setShowDetails(prev => !prev), []);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 md:p-6 bg-background text-foreground"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="w-full max-w-md p-6 space-y-4 bg-card rounded-lg shadow-lg border border-destructive/20">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-xl">!</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
            <p className="text-muted-foreground text-sm">
              {isOnline ? "We're working on fixing the issue." : 'You appear to be offline. Please check your connection.'}
            </p>
          </div>
        </div>

        <div className="bg-muted/30 p-3 rounded-md">
          <p className="text-sm font-medium mb-1">Error details:</p>
          <p className="text-sm text-muted-foreground break-words">{error.message || 'An unexpected error occurred'}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleRetry}
            className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isOnline}
            aria-label="Try again"
          >
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            aria-label="Go to home page"
          >
            Go Home
          </button>
        </div>

        <button
          onClick={handleReload}
          className="w-full px-4 py-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
          aria-label="Reload the application"
        >
          Reload Application
        </button>

        {isDev && (
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={toggleDetails}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              aria-expanded={showDetails}
              aria-controls="error-details"
            >
              {showDetails ? 'Hide' : 'Show'} technical details
              <span className="text-xs" aria-hidden="true">
                {showDetails ? '▲' : '▼'}
              </span>
            </button>

            {showDetails && (
              <div id="error-details" className="mt-3 p-3 bg-muted/20 rounded-md overflow-auto max-h-60">
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">{error.stack || 'No stack trace available'}</pre>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Location: {location.pathname}</p>
                  <p>Environment: {isProd ? 'Production' : 'Development'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const App: FC = () => {
  const queryClient = useMemo(() => createQueryClient(), []);
  const [isMounted, setIsMounted] = useState(false);

  const isAuthenticated = useAuth();
  const userRoles = useUserRoles();
  const location = useLocation();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      queryClient.clear();
    };
  }, [queryClient]);

  // Update document title and meta description on route changes
  useEffect(() => {
    const currentRoute = routes.find(
      route => route.path === location.pathname || (route.path !== '/' && location.pathname.startsWith(route.path))
    );

    const appName = import.meta.env.VITE_APP_NAME || 'Application';
    const pageTitle = currentRoute?.meta?.title ? `${currentRoute.meta.title} | ${appName}` : appName;
    document.title = pageTitle;

    if (currentRoute?.meta?.description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', currentRoute.meta.description);
    }
  }, [location.pathname]);

  const renderRoute = useCallback(
    (route: RouteConfig) => {
      const { path, component: Component, fallback, requiresAuth = false, meta } = route;

      // Auth guard
      if (requiresAuth && !isAuthenticated) {
        return <Route key={path} path={path} element={<Navigate to="/login" replace />} />;
      }
      // Role guard
      if (meta?.roles && !meta.roles.some(role => userRoles.includes(role))) {
        return <Route key={path} path={path} element={<Navigate to="/unauthorized" replace />} />;
      }

      const routeElement = (
        <Suspense fallback={fallback || <PageLoader message={`Loading ${meta?.title || 'page'}...`} />}>
          <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.history.go(0)} resetKeys={[path]}>
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary onReset={reset} FallbackComponent={ErrorFallback}>
                  <Component />
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </ErrorBoundary>
        </Suspense>
      );

      return <Route key={path} path={path} element={routeElement} caseSensitive={false} />;
    },
    [isAuthenticated, userRoles]
  );

  if (!isMounted) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" enableSystem disableTransitionOnChange>
          <Router>
            {routes.map(route => (
              <RoutePreloader key={`preload-${route.path}`} path={route.path} />
            ))}

            <Routes>
              {routes.map(renderRoute)}

              {/* Fallback 404 route */}
              <Route
                path="*"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Navigate to="/" replace />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
            </Routes>
          </Router>

          {isDev && (
            <ReactQueryDevtools
              initialIsOpen={false}
              position="bottom-right"
              toggleButtonProps={{
                style: { bottom: '4rem', right: '1rem', zIndex: 1000 },
                'aria-label': 'Toggle React Query DevTools',
              }}
            />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
