// EnhancedModuleDashboard.tsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Brain, ActivitySquare, Bot, Radar, Settings2, AlertCircle } from 'lucide-react'
import { useLiveMetrics } from '@/hooks/useLiveMetrics'

const modules = [
  {
    id: 'overview',
    title: 'ANE Overview',
    icon: <Brain className="w-5 h-5" />,
    description: 'Autonomous Nexus Entity - Advanced AI System',
    color: 'bg-purple-500',
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing',
    icon: <ActivitySquare className="w-5 h-5" />,
    description: 'Handles real-time language understanding & generation.',
    color: 'bg-blue-500',
  },
  {
    id: 'emotions',
    title: 'Emotional Intelligence',
    icon: <Bot className="w-5 h-5" />,
    description: 'Emotion recognition, response modulation, and empathy layers.',
    color: 'bg-pink-500',
  },
  {
    id: 'prediction',
    title: 'Predictive Analytics',
    icon: <Radar className="w-5 h-5" />,
    description: 'Forecasting, behavior modeling & real-time insights.',
    color: 'bg-yellow-500',
  },
  {
    id: 'control',
    title: 'System Control & Monitoring',
    icon: <Settings2 className="w-5 h-5" />,
    description: 'Orchestrates distributed processes and manages lifecycle.',
    color: 'bg-green-500',
  },
]

export default function EnhancedModuleDashboard() {
  const [tab, setTab] = useState('overview')
  const currentModule = modules.find((m) => m.id === tab)!
  const { metrics, loading, error } = useLiveMetrics(tab)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {modules.map((mod) => (
            <TabsTrigger key={mod.id} value={mod.id} className="flex items-center gap-2">
              {mod.icon}
              <span className="text-sm font-medium">{mod.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent key={tab} value={tab} asChild>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <Card className={`p-4 ${currentModule.color} text-white`}>
                <h2 className="text-xl font-bold">{currentModule.title}</h2>
                <p className="text-sm opacity-80">{currentModule.description}</p>
              </Card>

              {loading && <p className="text-sm text-muted-foreground">Loading metrics...</p>}
              {error && <p className="text-sm text-red-500">Error loading metrics</p>}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metrics &&
                  Object.entries(metrics).map(([key, value]) => (
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
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
