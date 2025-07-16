import { useState, useEffect } from 'react'
import { dataStream, RealTimeMetrics } from '../services/DataStream'
import { selfDiagnostics } from '../services/SelfDiagnosticsService'

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [repair, setRepair] = useState<any>(null)
  const [improvement, setImprovement] = useState<any>(null)
  const [update, setUpdate] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<string>('')
  const [userCommand, setUserCommand] = useState<any>(null)

  useEffect(() => {
    const subscriptions = [
      dataStream.getMetricsStream().subscribe(setMetrics),
      selfDiagnostics.getHealthStream().subscribe(setHealth),
      selfDiagnostics.getAlertsStream().subscribe(setAlerts),
      dataStream.getDiagnosticsStream().subscribe(setDiagnostics),
      dataStream.getRepairStream().subscribe(setRepair),
      dataStream.getImprovementStream().subscribe(setImprovement),
      dataStream.getUpdateStream().subscribe(setUpdate),
      dataStream.getConnectionStatus().subscribe(setConnectionStatus),
      dataStream.getFeedbackStream().subscribe(setFeedback),
      dataStream.getUserCommandStream().subscribe(setUserCommand),
    ]

    setIsLoading(false)

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe())
    }
  }, [])

  return {
    metrics,
    health,
    alerts,
    diagnostics,
    repair,
    improvement,
    update,
    isLoading,
    hasAlerts: alerts?.length > 0,
    connectionStatus,
    feedback,
    userCommand,
    sendUserCommand: dataStream.sendUserCommand.bind(dataStream),
  }
}
