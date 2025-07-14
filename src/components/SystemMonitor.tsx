import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import { dataStream } from '../services/DataStream'
import { selfDiagnostics } from '../services/SelfDiagnostics'
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({})
  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus>({})

  useEffect(() => {
    const subscriptions = [
      dataStream.getMetricsStream().subscribe(setMetrics),
      selfDiagnostics.getHealthStream().subscribe(setHealth),
      dataStream.getPerformanceMetrics().subscribe(setPerformanceMetrics)
    ]

    return () => subscriptions.forEach(sub => sub.unsubscribe())
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

  return (
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
        {/* Health status display */}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        {/* Alerts and notifications */}
      </motion.div>
    </div>
  )
}
      >
        {/* Health status display */}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        {/* Alerts and notifications */}
      </motion.div>
    </div>
  )
}
