// src/components/LogViewer.tsx
import React from 'react';

interface LogViewerProps {
  logs: Array<{ timestamp: string; message: string; type?: string }>;
  isDarkMode: boolean;
  'aria-live'?: React.AriaAttributes['aria-live'];
  'aria-atomic'?: React.AriaAttributes['aria-atomic'];
  'aria-relevant'?: React.AriaAttributes['aria-relevant'];
}

const LogViewer: React.FC<LogViewerProps> = ({ 
  logs, 
  isDarkMode,
  'aria-live': ariaLive,
  'aria-atomic': ariaAtomic,
  'aria-relevant': ariaRelevant
}) => {
  return (
    <div 
      className={`rounded-2xl shadow-xl p-5 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-relevant={ariaRelevant}
    >
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        System Logs
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`text-xs p-2 rounded-lg ${
              isDarkMode 
                ? log.type === 'warning' 
                  ? 'bg-yellow-900/30' 
                  : 'bg-gray-700/30'
                : log.type === 'warning' 
                  ? 'bg-yellow-100' 
                  : 'bg-gray-100'
            }`}
          >
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {log.timestamp}
            </span>
            <span className={`ml-2 ${
              log.type === 'warning' 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : isDarkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-700'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogViewer;
