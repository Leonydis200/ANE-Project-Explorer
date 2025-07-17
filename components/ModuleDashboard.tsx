import React, { JSX, useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, ActivitySquare, Bot, Radar, Settings2, Loader2 } from 'lucide-react'
import ErrorBoundary from './common/ErrorBoundary'
import AlertBanner from './common/AlertBanner'

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

export default function ModuleDashboard() {
  const [modules, setModules] = useState<Module[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { moduleId } = useParams<{ moduleId?: string }>()
  const activeTab = moduleId || 'overview'

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    fetch('/api/modules.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setModules(data)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to load modules:', err)
        setError('Failed to load modules. Please try again later.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const current = modules.find((m) => m.id === activeTab)

  // Loading state with spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">Loading modules...</p>
        </div>
      </div>
    )
  }

  // Error state with AlertBanner
  if (error) {
    return (
      <div className="p-6">
        <AlertBanner
          type="error"
          title="Failed to Load Modules"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Module not found state
  if (!current && modules.length > 0) {
    return (
      <div className="p-6">
        <AlertBanner
          type="warning"
          title="Module Not Found"
          message={`The module "${activeTab}" could not be found.`}
        />
        <div className="mt-4">
          <Link
            to="/modules"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Modules
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={<div className="p-6 text-red-500">Something went wrong with the module dashboard.</div>}>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-6 space-y-6">
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

      <motion.div key={current.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
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
    </ErrorBoundary>
  )
}
