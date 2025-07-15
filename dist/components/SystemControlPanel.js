"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const SystemControlPanel = ({ isRunning, simulateSystem, isDarkMode }) => {
    const handleClick = () => {
        simulateSystem();
        react_hot_toast_1.toast.success(isRunning
            ? 'System shutdown initiated'
            : 'System startup sequence activated', {
            icon: isRunning ? '🛑' : '🚀',
            position: 'bottom-right'
        });
    };
    return (<div className={`rounded-2xl shadow-xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        System Control
      </h3>
      <button onClick={handleClick} className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors font-medium ${isRunning
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-gray-900' : 'focus:ring-white'}`} aria-pressed={isRunning}>
        {isRunning ? <lucide_react_1.Activity className="w-5 h-5"/> : <lucide_react_1.Play className="w-5 h-5"/>}
        <span>{isRunning ? 'Stop System' : 'Start System'}</span>
      </button>
    </div>);
};
exports.default = SystemControlPanel;
