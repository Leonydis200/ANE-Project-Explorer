// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import SystemControlPanel from './components/SystemControlPanel';
import ModuleViewer from './components/ModuleViewer';
import LogViewer from './components/LogViewer';
import { modules } from './config/modules';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeModule, setActiveModule] = useState('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; type?: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  // Dark mode persistence
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) setIsDarkMode(stored === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const simulateSystem = () => {
    if (!isRunning) {
      const messages = [
        'AGI: Initializing reasoning engine...',
        'NLP: Loading sentiment analysis model...',
        'Database: Connecting to PostgreSQL...',
        'Security: JWT authentication enabled',
        'Predictive: RandomForest model loaded',
        'Emotional: Emotion detection ready',
        'System: All modules operational'
      ];
      
      // Clear any previous timeouts
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
      
      messages.forEach((msg, index) => {
        const timeoutId = setTimeout(() => {
          setLogs(prev => [...prev, { 
            timestamp: new Date().toLocaleTimeString(), 
            message: msg, 
            type: 'info' 
          }]);
        }, index * 1000);
        timeouts.current.push(timeoutId);
      });
    } else {
      // Clear all pending timeouts
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
      setLogs(prev => [...prev, { 
        timestamp: new Date().toLocaleTimeString(), 
        message: 'System shutdown initiated', 
        type: 'warning' 
      }]);
    }
    setIsRunning(!isRunning);
  };

  const toggleFavorite = (key: string) => {
    setFavorites(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Toaster position="bottom-right" />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar
            modules={modules}
            favorites={favorites}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showFavoritesOnly={showFavoritesOnly}
            setShowFavoritesOnly={setShowFavoritesOnly}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(dm => !dm)}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            toggleFavorite={toggleFavorite}
          />
          
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ModuleViewer activeModule={activeModule} isDarkMode={isDarkMode} />
              </motion.div>
            </AnimatePresence>

            <SystemControlPanel 
              isRunning={isRunning} 
              simulateSystem={simulateSystem} 
              isDarkMode={isDarkMode}
            />
            
            {logs.length > 0 && (
              <LogViewer 
                logs={logs} 
                isDarkMode={isDarkMode}
                aria-live="polite"
                aria-atomic="false"
                aria-relevant="additions"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
