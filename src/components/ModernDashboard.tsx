
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileSearch, Plus, RefreshCw, AlertCircle, Info, Brain } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useRealTimeMetrics } from '../hooks/useRealTimeMetrics'
import { dataStream } from '../services/DataStream'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'warning' | 'error'
  version: string
  lastUpdated: string
  type: string
}

interface Module {
  id: string
  title: string
  description: string
  alerts: number
  color: string
  icon: JSX.Element
  metrics: Record<string, string | number>
}

const modules: Module[] = [
  {
    id: 'overview',
    title: 'Overview',
    description: 'System performance metrics',
    alerts: 2,
    color: 'bg-indigo-200',
    icon: <Brain className="w-5 h-5" />,
    metrics: {
      latency: '120ms',
      performance: '94%',
      errors: 3,
      uptime: '99.9%',
      memory: '512MB',
    },
  },
  {
    id: 'network',
    title: 'Network',
    description: 'Network health and traffic',
    alerts: 0,
    color: 'bg-green-200',
    icon: <Info className="w-5 h-5" />,
    metrics: {
      requests: '3500/s',
      bandwidth: '1.2Gbps',
      packetLoss: '0.2%',
    },
  },
]

const categories = ['all', 'development', 'research', 'maintenance']

export default function ModernDashboard() {
  const [tab, setTab] = useState('overview')
  const [expandedMetrics, setExpandedMetrics] = useState<Record<string, boolean>>({})
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const { diagnostics, repair, improvement, feedback } = useRealTimeMetrics()

  useEffect(() => {
    fetch('/api/projects.json')
      .then(res => res.json())
      .then(setProjects)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetch('/api/projects.json')
          .then(res => res.json())
          .then(setProjects)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const handleTabChange = (newTab: string) => {
    setTab(newTab)
    toast.dismiss()
    const module = modules.find(m => m.id === newTab)
    if (module?.alerts) {
      toast(
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {module.title} has {module.alerts} active alert
              {module.alerts > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              Check the monitoring panel for details
            </p>
          </div>
        </div>,
        { duration: 3000 }
      )
    }
  }

  const toggleMetricExpansion = (moduleId: string) => {
    setExpandedMetrics(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  const filteredProjects = projects.filter(
    p =>
      (selectedCategory === 'all' || p.type === selectedCategory) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    development: projects.filter(p => p.type === 'development').length,
    attention: projects.filter(p => p.status === 'warning' || p.status === 'error').length,
  }

  return (
    <div className="modern-layout">
      <div className="glass-container flex">
        {/* Sidebar */}
        <aside className="glass-sidebar">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              ANE Explorer
            </h1>
          </div>
          <div className="p-4">
            <div className="relative">
              <FileSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {categories.map(cat => (
              <button
                key={cat}
                className={`nav-item${selectedCategory === cat ? ' active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Projects Overview</h2>
              <div className="flex gap-3">
                <button className="btn btn-ghost" onClick={() => setAutoRefresh(!autoRefresh)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
                </button>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </button>
              </div>
            </div>

            <Tabs value={tab} onValueChange={handleTabChange} className="w-full mb-8">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {modules.map(module => (
                  <Tooltip key={module.id}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={module.id}
                        className="flex flex-col items-center justify-center h-auto py-4 relative"
                      >
                        {module.alerts > 0 && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
                        )}
                        <div className={`p-3 rounded-lg mb-2 ${module.color}`}>{module.icon}</div>
                        <span className="font-medium">{module.title}</span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{module.description}</TooltipContent>
                  </Tooltip>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                {modules.map(module => (
                  <TabsContent key={module.id} value={module.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${module.color}`}>{module.icon}</div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-bold">{module.title}</h3>
                                  {module.alerts > 0 && (
                                    <Badge variant="destructive" className="gap-1">
                                      <AlertCircle className="w-4 h-4" />
                                      {module.alerts} Alert{module.alerts > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground mt-1">{module.description}</p>
                              </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg px-4 py-2 flex items-center gap-2">
                              <Info className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">Last updated: Just now</span>
                            </div>
                          </div>

                          <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium text-muted-foreground">PERFORMANCE METRICS</h4>
                              {Object.keys(module.metrics).length > 3 && (
                                <button
                                  onClick={() => toggleMetricExpansion(module.id)}
                                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                >
                                  {expandedMetrics[module.id] ? 'Show Less' : 'Show More'}
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Object.entries(module.metrics)
                                .slice(0, expandedMetrics[module.id] ? undefined : 3)
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="border rounded-lg p-4 bg-muted/5 hover:bg-muted/10 transition-colors"
                                  >
                                    <p className="text-sm text-muted-foreground font-medium capitalize">{key}</p>
                                    <p className="text-lg font-semibold mt-1">{value}</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </Tabs>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Object.entries(stats).map(([key, value]) => (
                <motion.div key={key} className="stats-card" whileHover={{ y: -4 }}>
                  <div className="text-3xl font-bold text-primary">{value}</div>
                  <div className="text-sm text-gray-500 mt-1">{key}</div>
                </motion.div>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <motion.div
                  key={project.id}
                  className="project-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <span className={`status-badge ${project.status}`} />
                  </div>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <span>v{project.version}</span>
                    <span>{project.lastUpdated}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Diagnostic Controls */}
            <div className="flex gap-3 mt-6 mb-4">
              <button className="btn btn-ghost" onClick={() => dataStream.triggerSelfDiagnostics()}>
                Run Diagnostics
              </button>
              <button className="btn btn-ghost" onClick={() => dataStream.triggerSelfRepair()}>
                Run Self-Repair
              </button>
              <button className="btn btn-ghost" onClick={() => dataStream.triggerSelfImprovement()}>
                Run Self-Improvement
              </button>
              <button className="btn btn-ghost" onClick={() => dataStream.triggerSelfUpdate()}>
                Run Self-Update
              </button>
            </div>

            {feedback && (
              <div className="mb-4 bg-info/10 text-info p-2 rounded">Feedback: {feedback}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 shadow">
                <h4 className="font-bold mb-2">Diagnostics</h4>
                <pre>{JSON.stringify(diagnostics, null, 2)}</pre>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <h4 className="font-bold mb-2">Repair Status</h4>
                <pre>{JSON.stringify(repair, null, 2)}</pre>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <h4 className="font-bold mb-2">Improvement Status</h4>
                <pre>{JSON.stringify(improvement, null, 2)}</pre>
              </div>
            </div>

            {showModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
                  <h3 className="font-bold mb-4">Create New Project</h3>
                  {/* Add form fields here */}
                  <button className="btn btn-primary mt-4" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
