import { useEffect, useState, useCallback } from 'react'
import { dataStream, EnhancedSystemMetrics } from '../services/DataStream'
import { selfDiagnostics } from '../services/SelfDiagnostics'
import { systemImprovement } from '../services/SystemImprovement'

export interface LiveMetrics {
  id: string
  metrics: Record<string, string | number>
  health: number
  status: 'healthy' | 'degraded' | 'critical'
}

export const useLiveMetrics = () => {
  const [metrics, setMetrics] = useState<LiveMetrics[]>([])
  const [systemHealth, setSystemHealth] = useState<EnhancedSystemMetrics | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [improvementStatus, setImprovementStatus] = useState<string>('idle')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')
  const [feedback, setFeedback] = useState<string>('')
  const [improvementHistory, setImprovementHistory] = useState<any[]>([])

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      const results = await selfDiagnostics.runDiagnostics()
      setDiagnostics(results)
      setFeedback('Diagnostics refreshed')
    } catch (err) {
      console.error('Diagnostics refresh error:', err)
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateMetrics = (data: EnhancedSystemMetrics) => {
    const nlp = data.nlp || {}
    const emotions = data.emotions || {}
    const prediction = data.prediction || {}
    const control = data.control || {}

    const newMetrics: LiveMetrics[] = [
      {
        id: 'overview',
        metrics: {
          uptime: `${data.uptime ?? 0}%`,
          nodes: data.nodes ?? 0,
          status: data.status ?? 'unknown',
        },
        health: data.health ?? 0,
        status: data.statusLevel ?? 'degraded',
      },
      {
        id: 'nlp',
        metrics: {
          throughput: `${nlp.throughput ?? 0} req/min`,
          models: nlp.models ?? 0,
          latency: `${nlp.latency ?? 0}ms`,
        },
        health: nlp.health ?? 0,
        status: nlp.status ?? 'degraded',
      },
      {
        id: 'emotions',
        metrics: {
          sentimentAccuracy: `${emotions.sentimentAccuracy ?? 0}%`,
          emotionalRange: `${emotions.emotionalRange ?? 0} layers`,
        },
        health: emotions.health ?? 0,
        status: emotions.status ?? 'degraded',
      },
      {
        id: 'prediction',
        metrics: {
          predictionAccuracy: `${prediction.predictionAccuracy ?? 0}%`,
          modelsTrained: prediction.modelsTrained ?? 0,
        },
        health: prediction.health ?? 0,
        status: prediction.status ?? 'degraded',
      },
      {
        id: 'control',
        metrics: {
          activeProcesses: control.activeProcesses ?? 0,
          systemLoad: `${control.systemLoad ?? 0}%`,
          alerts: control.alerts ?? 0,
        },
        health: control.health ?? 0,
        status: control.status ?? 'degraded',
      },
    ]

    setMetrics(newMetrics)
  }

  useEffect(() => {
    const subscriptions = [
      dataStream.getMetricsStream().subscribe(data => {
        setSystemHealth(data)
        updateMetrics(data)
      }),
      selfDiagnostics.getHealthStream().subscribe(setDiagnostics),
      systemImprovement.getStatusStream().subscribe(setImprovementStatus),
      dataStream.getConnectionStatus().subscribe(setConnectionStatus),
      systemImprovement.getFeedbackStream().subscribe(setFeedback),
      systemImprovement.getImprovementHistory().subscribe(setImprovementHistory),
    ]

    selfDiagnostics.startMonitoring()
    setLoading(false)

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
    }
  }, [])

  return {
    metrics,
    systemHealth,
    error,
    diagnostics,
    improvementStatus,
    refreshData,
    loading,
    tab,
    setTab,
    connectionStatus,
    feedback,
    improvementHistory,
    triggerUserImprovement: systemImprovement.triggerUserImprovement.bind(systemImprovement),
  }
}
