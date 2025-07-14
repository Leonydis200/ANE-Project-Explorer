import { useEffect, useState } from 'react';
import { fetchModules } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LucideIcon, Brain, MessageCircle, Smile } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: string; // string name of the icon
  color: string;
}

const iconMap: Record<string, LucideIcon> = {
  Brain,
  MessageCircle,
  Smile
};

export default function ModuleTabs() {
  const [modules, setModules] = useState<Module[]>([]);
  const [active, setActive] = useState('overview');

  useEffect(() => {
    fetchModules().then(setModules).catch(console.error);
  }, []);

  return (
    <Tabs value={active} onValueChange={setActive} className="w-full max-w-5xl mx-auto">
      <TabsList className="grid grid-cols-3 gap-2">
        {modules.map(({ id, icon, title }) => {
          const Icon = iconMap[icon] || Brain;
          return (
            <TabsTrigger key={id} value={id} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {title}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {modules.map(({ id, title, description, color }) => (
        <TabsContent
          key={id}
          value={id}
          className={`rounded-xl p-6 mt-4 shadow-md ${color} text-white animate-fadeIn`}
        >
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-sm opacity-90">{description}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
