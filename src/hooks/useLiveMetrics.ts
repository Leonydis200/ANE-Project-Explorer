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

  const refreshData = useCallback(async () => {
    try {
      const diagnostics = await selfDiagnostics.runDiagnostics()
      // Handle diagnostics results
    } catch (err) {
      setError(err as Error)
    }
  }, [])

  useEffect(() => {
    const subscription = dataStream.getMetricsStream().subscribe(data => {
      setSystemHealth(data)
      updateMetrics(data)
    })

    const diagSub = selfDiagnostics.getHealthStream().subscribe(setDiagnostics)
    const impSub = systemImprovement.getStatusStream().subscribe(setImprovementStatus)

    selfDiagnostics.startMonitoring()

    return () => {
      subscription.unsubscribe()
      diagSub.unsubscribe()
      impSub.unsubscribe()
    }
  }, [])

  const updateMetrics = (data: EnhancedSystemMetrics) => {
    const newMetrics: LiveMetrics[] = [
      {
        id: 'overview',
        metrics: {
          uptime: `${data.uptime}%`,
          nodes: data.nodes,
          status: data.status,
        },
        health: data.health,
        status: data.statusLevel,
      },
      {
        id: 'nlp',
        metrics: {
          throughput: `${data.nlp.throughput} req/min`,
          models: data.nlp.models,
          latency: `${data.nlp.latency}ms`,
        },
        health: data.nlp.health,
        status: data.nlp.status,
      },
      {
        id: 'emotions',
        metrics: {
          sentimentAccuracy: `${data.emotions.sentimentAccuracy}%`,
          emotionalRange: `${data.emotions.emotionalRange} layers`,
        },
        health: data.emotions.health,
        status: data.emotions.status,
      },
      {
        id: 'prediction',
        metrics: {
          predictionAccuracy: `${data.prediction.predictionAccuracy}%`,
          modelsTrained: data.prediction.modelsTrained,
        },
        health: data.prediction.health,
        status: data.prediction.status,
      },
      {
        id: 'control',
        metrics: {
          activeProcesses: data.control.activeProcesses,
          systemLoad: `${data.control.systemLoad}%`,
          alerts: data.control.alerts,
        },
        health: data.control.health,
        status: data.control.status,
      },
    ]

    setMetrics(newMetrics)
  }

  return { 
    metrics, 
    systemHealth, 
    error,
    diagnostics,
    improvementStatus,
    refreshData 
  }
}