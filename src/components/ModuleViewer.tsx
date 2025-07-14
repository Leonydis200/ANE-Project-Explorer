// src/components/ModuleViewer.tsx
import React from 'react';
import { modules } from '../config/modules';
import { motion } from 'framer-motion';

interface ModuleViewerProps {
  activeModule: string;
  isDarkMode: boolean;
}

const ModuleViewer: React.FC<ModuleViewerProps> = ({ activeModule, isDarkMode }) => {
  const module = modules[activeModule as keyof typeof modules];
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  
  if (!module) return <div>Module not found</div>;

  return (
    <div className={`rounded-2xl shadow-xl p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${borderClass}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center mb-6"
      >
        <div className={`p-3 rounded-lg ${module.color} text-white mr-4`}>
          {module.icon}
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {module.title}
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {module.description}
          </p>
        </div>
      </motion.div>

      <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
        {activeModule === 'overview' ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Autonomous Nexus Entity</h3>
              <p>Advanced AI system combining AGI, NLP, emotional intelligence, and predictive analytics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${borderClass} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Architecture</h4>
                <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Docker containerized services</li>
                  <li>• PostgreSQL database</li>
                  <li>• FastAPI backend</li>
                  <li>• Streamlit UI</li>
                </ul>
              </div>
              
              <div className={`p-4 rounded-lg border ${borderClass} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>AI Capabilities</h4>
                <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Text generation (GPT-2)</li>
                  <li>• Sentiment analysis</li>
                  <li>• Predictive modeling</li>
                  <li>• Emotion detection</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-lg border ${borderClass} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {activeModule === 'database' ? 'Database Schema' : 'Key Features'}
            </h4>
            
            {activeModule === 'database' ? (
              <div className="font-mono text-sm">
                <div>Table: items</div>
                <div>- id: Integer (Primary Key)</div>
                <div>- name: String (Indexed)</div>
                <div>- description: String (Nullable)</div>
              </div>
            ) : (
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Feature implementation details</li>
                <li>• Performance metrics</li>
                <li>• Integration points</li>
                <li>• Configuration options</li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleViewer;
