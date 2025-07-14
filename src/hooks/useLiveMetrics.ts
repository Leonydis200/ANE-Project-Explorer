import { useEffect, useState } from 'react'

export interface LiveMetrics {
  id: string
  metrics: Record<string, string | number>
}

const generateRandomMetrics = (): LiveMetrics[] => {
  return [
    {
      id: 'overview',
      metrics: {
        uptime: `${(99 + Math.random()).toFixed(2)}%`,
        nodes: 42 + Math.floor(Math.random() * 3),
        status: 'Online',
      },
    },
    {
      id: 'nlp',
      metrics: {
        throughput: `${1000 + Math.floor(Math.random() * 500)} req/min`,
        models: 8,
        latency: `${10 + Math.floor(Math.random() * 10)}ms`,
      },
    },
    {
      id: 'emotions',
      metrics: {
        sentimentAccuracy: `${(94 + Math.random()).toFixed(1)}%`,
        emotionalRange: '7 layers',
      },
    },
    {
      id: 'prediction',
      metrics: {
        predictionAccuracy: `${(90 + Math.random()).toFixed(1)}%`,
        modelsTrained: 15 + Math.floor(Math.random() * 3),
      },
    },
    {
      id: 'control',
      metrics: {
        activeProcesses: 120 + Math.floor(Math.random() * 10),
        systemLoad: `${35 + Math.floor(Math.random() * 10)}%`,
        alerts: 2,
      },
    },
  ]
}

export const useLiveMetrics = () => {
  const [metrics, setMetrics] = useState<LiveMetrics[]>(generateRandomMetrics())

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateRandomMetrics())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return metrics
}  