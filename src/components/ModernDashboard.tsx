import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Plus, RefreshCw } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'warning' | 'error'
  version: string
  lastUpdated: string
  type: string
}

export default function ModernDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Stats calculation
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
            {/* ...categories... */}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Projects Overview</h2>
              <div className="flex gap-3">
                <button className="btn btn-ghost">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
                <button className="btn btn-primary">
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
              {projects.map(project => (
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
          </div>
        </main>
      </div>
    </div>
  )
}
