import { useState, useEffect } from 'react';
import { dataStream, RealTimeMetrics } from '../services/DataStream';
import { selfDiagnostics } from '../services/SelfDiagnostics';

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [repair, setRepair] = useState<any>(null);
  const [improvement, setImprovement] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscriptions = [
      dataStream.getMetricsStream().subscribe(setMetrics),
      selfDiagnostics.getHealthStream().subscribe(setHealth),
      selfDiagnostics.getAlertsStream().subscribe(setAlerts),
      dataStream.getDiagnosticsStream().subscribe(setDiagnostics),
      dataStream.getRepairStream().subscribe(setRepair),
      dataStream.getImprovementStream().subscribe(setImprovement),
    ];

    const connSub = dataStream.getConnectionStatus().subscribe(setConnectionStatus);
    setIsLoading(false);
    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
      connSub.unsubscribe();
    };
  }, []);

  return {
    metrics,
    health,
    alerts,
    diagnostics,
    repair,
    improvement,
    isLoading,
    hasAlerts: alerts.length > 0,
    connectionStatus,
  };
}
