import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Plus, RefreshCw } from 'lucide-react'
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

const categories = ['all', 'development', 'research', 'maintenance']

export default function ModernDashboard() {
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
    attention: projects.filter(p => p.status === 'warning' || p.status === 'error').length
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

          {/* Project Categories */}
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Object.entries(stats).map(([key, value]) => (
                <motion.div
                  key={key}
                  className="stats-card"
                  whileHover={{ y: -4 }}
                >
                  <div className="text-3xl font-bold text-primary">{value}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
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

            {/* Diagnostics, Repair, Improvement UI */}
            <div className="flex gap-3 mb-4">
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
              <div className="mb-4 bg-info/10 text-info p-2 rounded">
                Feedback: {feedback}
              </div>
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
          </div>
          {/* Project Creation Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
                <h3 className="font-bold mb-4">Create New Project</h3>
                {/* ...form fields for new project... */}
                <button className="btn btn-primary mt-4" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
