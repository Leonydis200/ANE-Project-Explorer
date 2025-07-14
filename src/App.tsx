import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ActivitySquare, Bot, Radar, Settings2 } from 'lucide-react'

const modules = [
  {
    id: 'overview',
    title: 'ANE Overview',
    icon: <Brain className="w-5 h-5" />,
    description: 'Autonomous Nexus Entity - Advanced AI System',
    color: 'bg-purple-500',
    metrics: {
      uptime: '99.97%',
      nodes: 42,
      status: 'Online',
    },
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing',
    icon: <ActivitySquare className="w-5 h-5" />,
    description: 'Handles real-time language understanding & generation.',
    color: 'bg-blue-500',
    metrics: {
      throughput: '1200 req/min',
      models: 8,
      latency: '15ms',
    },
  },
  {
    id: 'emotions',
    title: 'Emotional Intelligence',
    icon: <Bot className="w-5 h-5" />,
    description: 'Emotion recognition, response modulation, and empathy layers.',
    color: 'bg-pink-500',
    metrics: {
      sentimentAccuracy: '94.5%',
      emotionalRange: '7 layers',
    },
  },
  {
    id: 'prediction',
    title: 'Predictive Analytics',
    icon: <Radar className="w-5 h-5" />,
    description: 'Forecasting, behavior modeling & real-time insights.',
    color: 'bg-yellow-500',
    metrics: {
      predictionAccuracy: '91.8%',
      modelsTrained: 15,
    },
  },
  {
    id: 'control',
    title: 'System Control & Monitoring',
    icon: <Settings2 className="w-5 h-5" />,
    description: 'Orchestrates distributed processes and manages lifecycle.',
    color: 'bg-green-500',
    metrics: {
      activeProcesses: 128,
      systemLoad: '42%',
      alerts: 2,
    },
  },
]

export default function ModuleDashboard() {
  const [tab, setTab] = useState('overview')
  const current = modules.find((m) => m.id === tab)!

  return (
    <div className="p-6 space-y-6">
      <div className="flex space-x-2 overflow-x-auto border-b border-muted pb-2">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setTab(mod.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap
              ${tab === mod.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            {mod.icon}
            {mod.title}
          </button>
        ))}
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className={`p-4 rounded-lg text-white ${current.color}`}>
          <h2 className="text-xl font-bold">{current.title}</h2>
          <p className="text-sm opacity-80">{current.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(current.metrics).map(([key, value]) => (
            <div key={key} className="bg-muted p-4 rounded-lg shadow">
              <div className="text-xs uppercase text-muted-foreground">{key}</div>
              <div className="text-lg font-semibold text-foreground">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}