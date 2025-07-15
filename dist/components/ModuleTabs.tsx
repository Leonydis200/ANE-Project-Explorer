import React, { useEffect, useState } from 'react';
import { Brain, ActivitySquare, Bot, Radar, Settings2 } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  ActivitySquare,
  Bot,
  Radar,
  Settings2,
};

type Module = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
};

export default function ModuleTabs() {
  const [modules, setModules] = useState<Module[]>([]);
  const [active, setActive] = useState('overview');

  useEffect(() => {
    fetch('/api/modules.json')
      .then((res) => res.json())
      .then(setModules)
      .catch(console.error);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex space-x-2 border-b border-muted pb-2">
        {modules.map(({ id, icon, title }) => {
          const Icon = iconMap[icon] || Brain;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap
                ${active === id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              <Icon className="w-4 h-4" />
              {title}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        {modules.map(({ id, title, description, color }) =>
          active === id ? (
            <div
              key={id}
              className={`rounded-xl p-6 mt-4 shadow-md ${color} text-white animate-fadeIn`}
            >
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-sm opacity-90">{description}</p>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}