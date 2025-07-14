import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Brain, ActivitySquare, Bot, Radar, Settings2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Module {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  color: string
  metrics: Record<string, string | number>
  alerts?: number
}

const modules: Module[] = [
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
    alerts: 1,
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
    alerts: 2,
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

  const handleTabChange = (newTab: string) => {
    setTab(newTab)
    toast.dismiss()
    const module = modules.find((m) => m.id === newTab)
    if (module?.alerts) {
      toast(
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{module.title} has {module.alerts} active alert{module.alerts > 1 ? 's' : ''}</p>
            <p className="text-sm text-muted-foreground">Check the monitoring panel for details</p>
          </div>
        </div>,
        { duration: 3000 }
      )
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {modules.map((mod) => (
            <TabsTrigger key={mod.id} value={mod.id} className="flex items-center gap-2 relative">
              {mod.icon}
              <span className="text-sm font-medium truncate">{mod.title}</span>
              {mod.alerts && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs px-1.5">
                  {mod.alerts}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent key={tab} value={tab} asChild forceMount>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <Card className={`p-4 ${current.color} text-white`}>
                <h2 className="text-xl font-bold">{current.title}</h2>
                <p className="text-sm opacity-80">{current.description}</p>
              </Card>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(current.metrics).map(([key, value]) => (
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
