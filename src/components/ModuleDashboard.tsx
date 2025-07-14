import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs } from '@/components/ui/Tabs'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
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
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-5 gap-2">
          {modules.map((mod) => (
            <TabsTrigger key={mod.id} value={mod.id} className="flex items-center gap-2">
              {mod.icon}
              <span className="text-sm font-medium">{mod.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {modules.map((mod) => (
          <TabsContent key={mod.id} value={mod.id} asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <Card className={`p-4 ${mod.color} text-white`}>
                <h2 className="text-xl font-bold">{mod.title}</h2>
                <p className="text-sm opacity-80">{mod.description}</p>
              </Card>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(mod.metrics).map(([key, value]) => (
                  <Card key={key} className="bg-muted">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase text-muted-foreground">{key}</div>
                      <div className="text-lg font-semibold">{value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}