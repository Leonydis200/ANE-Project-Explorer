import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, AlertTriangle } from '@/components/ui/icons';
import { Subscription } from 'rxjs';
import { SelfDiagnosticsService } from '@/services/SelfDiagnosticsService';
import { ErrorBoundary } from './common/ErrorBoundary';
import { DashboardSkeleton } from './common/LoadingSkeleton';
import { AlertBanner } from './common/AlertBanner';
import type { SystemHealth, DiagnosticEntry } from '@/types/dashboard';

const diagnosticsService = new SelfDiagnosticsService();
const PAGE_SIZE = 10;

const useDiagnostics = () => {
  const [state, setState] = useState<{
    health: SystemHealth | null;
    alerts: string[];
    feedback: string;
    history: DiagnosticEntry[];
    isLoading: boolean;
    error: string | null;
  }>({
    health: null,
    alerts: [],
    feedback: 'Idle',
    history: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const subscriptions: Subscription[] = [];

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      subscriptions.push(
        diagnosticsService.getHealthObservable().subscribe({
          next: (health) => isMounted && setState(prev => ({ ...prev, health })),
          error: (error) => isMounted && setState(prev => ({
            ...prev,
            error: 'Failed to load system health',
            isLoading: false
          }))
        }),
        diagnosticsService.getAlertsObservable().subscribe({
          next: (alerts) => isMounted && setState(prev => ({ ...prev, alerts })),
          error: (error) => isMounted && setState(prev => ({
            ...prev,
            error: 'Failed to load alerts',
            isLoading: false
          }))
        }),
        diagnosticsService.getFeedbackObservable().subscribe({
          next: (feedback) => isMounted && setState(prev => ({ ...prev, feedback })),
          error: (error) => isMounted && setState(prev => ({
            ...prev,
            error: 'Failed to load feedback',
            isLoading: false
          }))
        }),
        diagnosticsService.getDiagnosticsHistory().subscribe({
          next: (history) => isMounted && setState(prev => ({
            ...prev,
            history,
            isLoading: false
          })),
          error: (error) => isMounted && setState(prev => ({
            ...prev,
            error: 'Failed to load diagnostics history',
            isLoading: false
          }))
        })
      );
    } catch (error) {
      if (isMounted) {
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize diagnostics',
          isLoading: false
        }));
      }
    }

    return () => {
      isMounted = false;
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, []);

  return state;
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}> = ({ currentPage, totalPages, onPageChange, className = '' }) => (
  <div className={`flex justify-end items-center gap-2 mt-2 ${className}`}>
    <button
      onClick={() => onPageChange(currentPage - 1)}
      className={`px-3 py-1 text-sm rounded-md ${
        currentPage === 0
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
      disabled={currentPage === 0}
      aria-label="Previous page"
    >
      Previous
    </button>
    <span className="text-sm text-gray-600">
      Page {currentPage + 1} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      className={`px-3 py-1 text-sm rounded-md ${
        currentPage >= totalPages - 1
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
      disabled={currentPage >= totalPages - 1}
      aria-label="Next page"
    >
      Next
    </button>
  </div>
);

const StatusBadge: React.FC<{
  status: 'success' | 'warning' | 'error';
  label: string;
  className?: string;
}> = ({ status, label, className = '' }) => {
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]} ${className}`}
    >
      {label}
    </span>
  );
};

export default function CyberDashboard() {
  const [page, setPage] = useState(0);
  const { health, alerts, feedback, history, isLoading, error } = useDiagnostics();

  const handlePageChange = useCallback((newPage: number) => {
    setPage(Math.max(0, Math.min(newPage, Math.ceil(history.length / PAGE_SIZE) - 1)));
  }, [history.length]);

  const pagedHistory = useMemo(() => 
    history.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [history, page]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(history.length / PAGE_SIZE)),
    [history.length]
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <AlertBanner type="error" message={error ?? ''} />
      </div>
    );
  }



  return (
    <div className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full max-w-7xl mx-auto min-h-screen">
      {/* Responsive: stack on mobile, side-by-side on lg+ */}
      <ErrorBoundary fallback={
        <div className="col-span-1 lg:col-span-2 p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
          <p className="text-red-700 text-sm sm:text-base">Failed to load system health. Please refresh the page.</p>
        </div>
      }>
        <Card className="col-span-1 lg:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">System Health</h2>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-0">
                  <span className="text-sm sm:text-base font-medium text-gray-700">Overall Status</span>
                  <StatusBadge 
                    status={
                      !health ? 'warning' : 
                      health.overall > 80 ? 'success' : 
                      health.overall > 50 ? 'warning' : 'error'
                    } 
                    label={`${health?.overall || 0}%`} 
                  />
                </div>
                <Progress 
                  value={health?.overall || 0} 
                  className={`h-2 sm:h-3 ${
                    !health ? 'bg-gray-200' : 
                    health.overall > 80 ? 'bg-green-500' : 
                    health.overall > 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} 
                />
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-medium mb-3 text-gray-700">Components</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {health?.components ? (
                    Object.entries(health.components).map(([key, value]) => (
                      <div key={key} className="space-y-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm capitalize font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-xs font-semibold text-gray-600">{value}%</span>
                        </div>
                        <Progress 
                          value={value} 
                          className={`h-1.5 sm:h-2 ${
                            value > 80 ? 'bg-green-500' : 
                            value > 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full flex items-center justify-center py-8 px-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 text-center">No component data available</p>
                    </div>
                  )}
                </div>
              </div>

              {health?.lastCheck && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Last checked: {new Date(health.lastCheck).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <ErrorBoundary fallback={
        <AlertBanner type="error" message="Failed to load alerts." />
      }>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="h-full p-4 sm:p-6">
             <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center" id="current-alerts-heading">
                <AlertTriangle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
                <span className="text-gray-900">Current Alerts</span>
                {alerts.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 min-w-[1.5rem] text-center" aria-label={`${alerts.length} active alerts`}>
                    {alerts.length}
                  </span>
                )}
             </h2>
                         <div className="space-y-2" role="region" aria-labelledby="current-alerts-heading">
                {alerts.length > 0 ? (
                  <ul className="space-y-3" aria-live="polite">
                    {alerts.map((alert, idx) => (
                      <li key={idx} className="flex items-start p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md hover:bg-yellow-100 transition-colors duration-150">
                        <AlertTriangle className="flex-shrink-0 mt-0.5 mr-3 h-4 w-4 text-yellow-600" aria-hidden="true" />
                        <span className="text-sm text-gray-800 leading-relaxed">{alert}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center h-20 sm:h-24 text-center bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">No active alerts</p>
                  </div>
                )}
             </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <ErrorBoundary fallback={
        <AlertBanner type="error" message="Failed to load system feedback." />
      }>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="h-full p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-900">System Feedback</span>
            </h2>
            <div className="flex items-center min-h-[5rem] sm:min-h-[6rem] p-3 bg-green-50 rounded-lg">
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{feedback}</p>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>

      <ErrorBoundary fallback={
        <AlertBanner type="error" message="Failed to load diagnostics history." />
      }>
        <Card className="col-span-1 lg:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900" id="diagnostics-history-heading">Diagnostics History</h2>
              <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {history.length} total entries
              </div>
            </div>
            
            <section
              className="overflow-auto max-h-80 sm:max-h-96 -mx-2 sm:-mx-4 px-2 sm:px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              role="region"
              aria-labelledby="diagnostics-history-heading"
              tabIndex={0}
            >
              {pagedHistory.length > 0 ? (
                <ul className="space-y-3 sm:space-y-4" aria-live="polite">
                  {pagedHistory.map((entry, index) => (
                    <DiagnosticsEntry key={index} entry={entry} />
                  ))}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-32 sm:h-40 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 text-center px-4">No diagnostic history available</p>
                </div>
              )}
            </section>

            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-4"
              />
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  );
}

// DiagnosticsEntry subcomponent for modularity and accessibility
const DiagnosticsEntry: React.FC<{ entry: DiagnosticEntry }> = ({ entry }) => (
  <li
    className="p-3 bg-white dark:bg-gray-800 rounded shadow border border-gray-100 dark:border-gray-700"
    tabIndex={0}
    aria-label={`Diagnostics entry from ${entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'unknown time'}`}
  >
    <div className="flex justify-between items-center">
      <span className="font-medium text-gray-800 dark:text-gray-100">
        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown time'}
      </span>
      <StatusBadge status={entry.status} label={entry.status} />
    </div>
    <ul className="mt-2 space-y-1">
      {entry.results.map((result, idx) => (
        <li key={idx} className="flex items-start">
          <span
            className={`inline-flex items-center justify-center w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${
              result.status === 'error'
                ? 'text-red-500'
                : result.status === 'warning'
                ? 'text-yellow-500'
                : 'text-green-500'
            }`}
            aria-label={result.status}
          >
            {result.status === 'error' ? '✕' : result.status === 'warning' ? '!' : '✓'}
          </span>
          <span className="text-sm text-gray-700">{result.message}</span>
        </li>
      ))}
    </ul>
  </li>
);
