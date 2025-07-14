import * as React from 'react'
import { Suspense, lazy, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, ActivitySquare, Bot, Radar, Settings2 } from 'lucide-react'
import SidebarLayout from '@/components/SidebarLayout'
import UserPanel from '@/components/UserPanel'
import { ThemeProvider } from './components/ThemeProvider'
import WelcomeWizard from './components/WelcomeWizard'
import UserPreferences from './components/UserPreferences'

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
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { moduleId } = useParams<{ moduleId?: string }>()
  const activeTab = moduleId || 'overview'

  useEffect(() => {
    fetch('/api/modules.json')
      .then((res) => res.json())
      .then((data) => setModules(data))
      .catch(() => setError('Failed to load modules.'))
  }, [])

  const current = modules.find((m) => m.id === activeTab)

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <div className="flex space-x-2 overflow-x-auto border-b border-muted pb-2">
        {modules.map((mod) => (
          <Link
            key={mod.id}
            to={mod.id === 'overview' ? '/' : `/${mod.id}`}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap
              ${activeTab === mod.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            aria-pressed={activeTab === mod.id}
            tabIndex={0}
          >
            {iconMap[mod.icon] || <span className="w-5 h-5" />}
            {mod.title}
          </Link>
        ))}
      </div>

      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className={`p-4 rounded-lg text-white ${current.color} shadow-lg flex flex-col md:flex-row md:items-center gap-4`}>
          <div className="flex items-center gap-3">
            {iconMap[current.icon] || <span className="w-5 h-5" />}
            <h2 className="text-xl font-bold">{current.title}</h2>
          </div>
          <div className="flex-1">
            <p className="text-sm opacity-80">{current.description}</p>
          </div>
          <Link
            to={`/detail/${current.id}`}
            className="ml-auto mt-2 md:mt-0 px-4 py-2 bg-white text-primary rounded shadow hover:bg-primary hover:text-white transition"
          >
            View Details
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(current.metrics).map(([key, value]) => (
            <div key={key} className="bg-muted p-4 rounded-lg shadow border border-gray-200">
              <div className="text-xs uppercase text-muted-foreground">{key}</div>
              <div className="text-lg font-semibold text-foreground">{value}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Simple error boundary for the app
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null)
  if (error) return <div className="p-6 text-red-500">Unexpected error: {error.message}</div>
  return (
    <React.Suspense fallback={<div className="p-6">Loading...</div>}>
      {children}
    </React.Suspense>
  )
}

export default function App() {
  const [showWizard, setShowWizard] = useState(() => !localStorage.getItem('wizardComplete'))

  return (
    <ThemeProvider>
      <BrowserRouter>
        <SidebarLayout>
          {showWizard && <WelcomeWizard onComplete={() => setShowWizard(false)} />}
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<ModuleDashboard />} />
              <Route path="/:moduleId" element={<ModuleDashboard />} />
              <Route path="/detail/:moduleId" element={<ModuleDetailPage />} />
              <Route path="/preferences" element={<UserPreferences />} />
            </Routes>
          </ErrorBoundary>
        </SidebarLayout>
      </BrowserRouter>
    </ThemeProvider>
  )
}