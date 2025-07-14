// src/config/modules.ts
import { 
  Brain, 
  Cpu, 
  MessageCircle, 
  Activity, 
  TrendingUp, 
  Shield, 
  Database, 
  Map 
} from 'lucide-react';

export const modules = {
  overview: {
    title: 'ANE Overview',
    icon: <Brain className="w-5 h-5" />,
    description: 'Autonomous Nexus Entity - Advanced AI System',
    color: 'bg-purple-500'
  },
  agi: {
    title: 'AGI Module',
    icon: <Cpu className="w-5 h-5" />,
    description: 'Artificial General Intelligence Core',
    color: 'bg-blue-500'
  },
  nlp: {
    title: 'NLP Module',
    icon: <MessageCircle className="w-5 h-5" />,
    description: 'Natural Language Processing',
    color: 'bg-green-500'
  },
  emotion: {
    title: 'Emotional Intelligence',
    icon: <Activity className="w-5 h-5" />,
    description: 'Emotion Detection & Response',
    color: 'bg-pink-500'
  },
  predictive: {
    title: 'Predictive Analytics',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'Forecasting & Predictions',
    color: 'bg-orange-500'
  },
  security: {
    title: 'Security & Privacy',
    icon: <Shield className="w-5 h-5" />,
    description: 'Authentication & Protection',
    color: 'bg-red-500'
  },
  database: {
    title: 'Database Layer',
    icon: <Database className="w-5 h-5" />,
    description: 'Data Management & Storage',
    color: 'bg-indigo-500'
  },
  roadmap: {
    title: 'Future Roadmap',
    icon: <Map className="w-5 h-5" />,
    description: 'Development Timeline',
    color: 'bg-teal-500'
  }
};
