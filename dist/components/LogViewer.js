"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const LogViewer = ({ logs, isDarkMode, 'aria-live': ariaLive, 'aria-atomic': ariaAtomic, 'aria-relevant': ariaRelevant }) => {
    return (<div className={`rounded-2xl shadow-xl p-5 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} aria-live={ariaLive} aria-atomic={ariaAtomic} aria-relevant={ariaRelevant}>
      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        System Logs
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {logs.map((log, index) => (<div key={index} className={`text-xs p-2 rounded-lg ${isDarkMode
                ? log.type === 'warning'
                    ? 'bg-yellow-900/30'
                    : 'bg-gray-700/30'
                : log.type === 'warning'
                    ? 'bg-yellow-100'
                    : 'bg-gray-100'}`}>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {log.timestamp}
            </span>
            <span className={`ml-2 ${log.type === 'warning'
                ? 'text-yellow-600 dark:text-yellow-400'
                : isDarkMode
                    ? 'text-gray-300'
                    : 'text-gray-700'}`}>
              {log.message}
            </span>
          </div>))}
      </div>
    </div>);
};
exports.default = LogViewer;
