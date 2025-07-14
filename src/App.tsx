import { Suspense, lazy, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, ActivitySquare, Bot, Radar, Settings2 } from 'lucide-react'
import SidebarLayout from '@/components/SidebarLayout'

const ModuleDetailPage = lazy(() => import('@/components/ModuleDetailPage'))

const iconMap: Record<string, JSX.Element> = {
  Brain: <Brain className="w-5 h-5" />,
  ActivitySquare: <ActivitySquare className="w-5 h-5" />,
  Bot: <Bot className="w-5 h-5" />,
  Radar: <Radar className="w-5 h-5" />,
  Settings2: <Settings2 className="w-5 h-5" />,
}

type Module = {
  id: string
  title: string
  icon: string
  description: string
  color: string
  metrics: Record<string, string | number>
}

function ModuleDashboard() {
  const [modules, setModules] = useState<Module[]>([])
  const [tab, setTab] = useState('overview')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/modules.json')
      .then((res) => res.json())
      .then((data) => setModules(data))
      .catch(() => setError('Failed to load modules.'))
  }, [])

  const current = modules.find((m) => m.id === tab)

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }
  if (!modules.length) {
    return <div className="p-6 text-muted-foreground">Loading modules...</div>
  }
  if (!current) {
    return <div className="p-6 text-red-500">Module not found.</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex space-x-2 overflow-x-auto border-b border-muted pb-2">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setTab(mod.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap
              ${tab === mod.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            aria-pressed={tab === mod.id}
            tabIndex={0}
          >
            {iconMap[mod.icon] || <span className="w-5 h-5" />}
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

export default function App() {
  return (
    <BrowserRouter>
      <SidebarLayout>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            <Route path="/" element={<ModuleDashboard />} />
            <Route path="/:moduleId" element={<ModuleDetailPage />} />
          </Routes>
        </Suspense>
      </SidebarLayout>
    </BrowserRouter>
  )
}