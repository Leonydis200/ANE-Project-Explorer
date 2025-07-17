import React, { useCallback } from 'react';
import { Brain, ActivitySquare, Bot, Radar, Settings2, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from './common/ErrorBoundary';
import { AlertBanner } from './common/AlertBanner';

const iconMap: Record<string, JSX.Element> = {
  Brain: <Brain className="w-8 h-8" />,
  ActivitySquare: <ActivitySquare className="w-8 h-8" />,
  Bot: <Bot className="w-8 h-8" />,
  Radar: <Radar className="w-8 h-8" />,
  Settings2: <Settings2 className="w-8 h-8" />,
};

// Types
type Module = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  metrics?: Record<string, string | number>;
  status?: 'active' | 'inactive' | 'maintenance';
  lastUpdated?: string;
};

interface ModuleViewerProps {
  activeModule: string;
  isDarkMode: boolean;
}

// Skeleton Loader Component
const ModuleSkeleton = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className="space-y-6">
    <div className="flex items-center space-x-4">
      <div className={`w-14 h-14 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
      <div className="flex-1 space-y-2">
        <div className={`h-6 w-3/4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
        <div className={`h-4 w-1/2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className={`h-4 w-1/3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`} />
          <div className={`h-6 w-2/3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
        </div>
      ))}
    </div>
  </div>
);

// Metric Card Component
const MetricCard = React.memo(({ 
  title, 
  value, 
  isDarkMode 
}: { 
  title: string; 
  value: string | number;
  isDarkMode: boolean;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-all hover:shadow-md`}
  >
    <div className="text-xs uppercase text-muted-foreground">{title}</div>
    <div className="text-lg font-semibold mt-1">{value}</div>
  </motion.div>
));

MetricCard.displayName = 'MetricCard';

const ModuleViewer: React.FC<ModuleViewerProps> = ({ activeModule, isDarkMode }) => {
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  
  // Fetch modules data with React Query
  const { 
    data: modules = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery<Module[]>({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await fetch('/api/modules.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch modules: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Handle retry with refetch
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`rounded-2xl shadow-xl p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${borderClass}`}>
        <ModuleSkeleton isDarkMode={isDarkMode} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <AlertBanner
          type="error"
          title="Module Loading Error"
          message={error instanceof Error ? error.message : 'Failed to load module data'}
          dismissible
          onDismiss={() => {}}
          action={{
            label: 'Retry',
            onClick: handleRetry,
            icon: <RefreshCw className="w-4 h-4 mr-1" />
          }}
        />
      </div>
    );
  }

  // Find the active module
  const module = modules.find((m) => m.id === activeModule);

  // Module not found state
  if (!module) {
    return (
      <div className="p-6">
        <AlertBanner
          type="warning"
          title="Module Not Found"
          message={`Module "${activeModule}" was not found in the available modules.`}
          dismissible={false}
          action={{
            label: 'Back to Modules',
            onClick: () => window.history.back(),
          }}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`rounded-2xl shadow-xl p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${borderClass}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${module.color} text-white`}>
                  {iconMap[module.icon] || <Brain className="w-8 h-8" />}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {module.title}
                    </h2>
                    {module.status && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        module.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : module.status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {module.status}
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {module.description}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                aria-label="Refresh module data"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>

            {module.metrics && Object.keys(module.metrics).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(module.metrics).map(([key, value]) => (
                  <MetricCard 
                    key={key} 
                    title={key} 
                    value={value} 
                    isDarkMode={isDarkMode} 
                  />
                ))}
              </div>
            )}

            {module.lastUpdated && (
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-right`}>
                Last updated: {new Date(module.lastUpdated).toLocaleString()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default ModuleViewer;
