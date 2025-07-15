import React from 'react';
import { Play, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SystemControlPanelProps {
  isRunning: boolean;
  simulateSystem: () => void;
  isDarkMode: boolean;
}

const SystemControlPanel: React.FC<SystemControlPanelProps> = ({ 
  isRunning, 
  simulateSystem,
  isDarkMode
}) => {
  const handleClick = () => {
    simulateSystem();
    toast.success(
      isRunning 
        ? 'System shutdown initiated' 
        : 'System startup sequence activated',
      {
        icon: isRunning ? '🛑' : '🚀',
        position: 'bottom-right'
      }
    );
  };

  return (
    <div className={`rounded-2xl shadow-xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        System Control
      </h3>
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium ${
          isRunning
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isDarkMode ? 'focus:ring-gray-900' : 'focus:ring-white'
        }`}
        aria-pressed={isRunning}
      >
        {isRunning ? <Activity className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        <span>{isRunning ? 'Stop System' : 'Start System'}</span>
      </button>
    </div>
  );
};

export default SystemControlPanel;
