import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  AdvancedMetrics, 
  SystemHealth, 
  PerformanceMetrics, 
  OptimizationStatus 
} from '../types';
import { motion } from 'framer-motion'
import { dataStream } from '../services/DataStream'
import { selfDiagnostics } from '../services/SelfDiagnosticsService'
import { Activity, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { ErrorBoundary } from './common/ErrorBoundary'
import AlertBanner from './common/AlertBanner'

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({})
  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus>({})
  const [update, setUpdate] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const subscriptions = [
          dataStream.getMetricsStream().subscribe({
            next: setMetrics,
            error: (err) => setError(`Metrics stream error: ${err.message}`)
          }),
          selfDiagnostics.getHealthStream().subscribe({
            next: setHealth,
            error: (err) => setError(`Health stream error: ${err.message}`)
          }),
          dataStream.getPerformanceMetrics().subscribe({
            next: setPerformanceMetrics,
            error: (err) => setError(`Performance metrics error: ${err.message}`)
          }),
          dataStream.getUpdateStream().subscribe({
            next: setUpdate,
            error: (err) => setError(`Update stream error: ${err.message}`)
          })
        ]

        // Set loading to false after a short delay to show initial data
        setTimeout(() => setIsLoading(false), 1000)

        return () => subscriptions.forEach(sub => sub.unsubscribe())
      } catch (err) {
        setError(`Failed to initialize system monitor: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsLoading(false)
      }
    }

    const cleanup = initializeData()
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn())
    }
  }, [])

  const chartData = {
    labels: performanceMetrics.timestamps,
    datasets: [
      {
        label: 'CPU Usage',
        data: performanceMetrics.cpu,
        borderColor: '#4caf50',
        fill: false
      },
      {
        label: 'Memory Usage',
        data: performanceMetrics.memory,
        borderColor: '#2196f3',
        fill: false
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute' as const,
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Usage',
        },
        ticks: {
          beginAtZero: true,
          callback: (value) => `${value}%`,
        },
      },
    },
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    // Trigger re-initialization by changing a dependency
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading system monitor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <AlertBanner
          type="error"
          title="System Monitor Error"
          message={error}
          dismissible
          onDismiss={() => setError(null)}
          action={{
            label: "Retry",
            onClick: handleRetry
          }}
        />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-4">System Performance</h2>
        <Line data={chartData} options={chartOptions} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Health Status</h2>
        <div>
          <span className={`px-3 py-1 rounded-full ${health?.overall > 80 ? 'bg-success text-white' : health?.overall > 60 ? 'bg-warning text-white' : 'bg-danger text-white'}`}>
            {health?.overall ?? 'N/A'}%
          </span>
          <div className="mt-2 text-sm text-gray-500">Last check: {health?.lastCheck?.toLocaleString()}</div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Alerts & Notifications</h2>
        <ul>
          {health?.issues?.length
            ? health.issues.map((issue, idx) => (
                <li key={idx} className="text-danger">{issue}</li>
              ))
            : <li className="text-success">No critical issues detected.</li>
          }
        </ul>
        <div className="flex gap-2 mt-4">
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
        {update && (
          <div className="mt-2 text-success bg-success/10 p-2 rounded">
            Update Status: {JSON.stringify(update)}
          </div>
        )}
      </motion.div>
    </div>
    </ErrorBoundary>
  )
}
