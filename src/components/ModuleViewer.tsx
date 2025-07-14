import React, { useEffect, useState } from 'react';
import { Brain, ActivitySquare, Bot, Radar, Settings2 } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, JSX.Element> = {
  Brain: <Brain className="w-8 h-8" />,
  ActivitySquare: <ActivitySquare className="w-8 h-8" />,
  Bot: <Bot className="w-8 h-8" />,
  Radar: <Radar className="w-8 h-8" />,
  Settings2: <Settings2 className="w-8 h-8" />,
};

type Module = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  metrics?: Record<string, string | number>;
};

interface ModuleViewerProps {
  activeModule: string;
  isDarkMode: boolean;
}

const ModuleViewer: React.FC<ModuleViewerProps> = ({ activeModule, isDarkMode }) => {
  const [modules, setModules] = useState<Module[]>([]);
  useEffect(() => {
    fetch('/api/modules.json')
      .then((res) => res.json())
      .then(setModules)
      .catch(console.error);
  }, []);

  const module = modules.find((m) => m.id === activeModule);
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
          {iconMap[module.icon] || <Brain className="w-8 h-8" />}
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
        {module.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(module.metrics).map(([key, value]) => (
              <div key={key} className={`p-4 rounded-lg border ${borderClass} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="text-xs uppercase text-muted-foreground">{key}</div>
                <div className="text-lg font-semibold">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleViewer;
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
