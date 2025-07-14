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

  useEffect(() => {
    const subscriptions = [
      dataStream.getMetricsStream().subscribe(setMetrics),
      selfDiagnostics.getHealthStream().subscribe(setHealth),
      selfDiagnostics.getAlertsStream().subscribe(setAlerts),
      dataStream.getDiagnosticsStream().subscribe(setDiagnostics),
      dataStream.getRepairStream().subscribe(setRepair),
      dataStream.getImprovementStream().subscribe(setImprovement),
    ];

    return () => subscriptions.forEach((sub) => sub.unsubscribe());
  }, []);

  return {
    metrics,
    health,
    alerts,
    diagnostics,
    repair,
    improvement,
    isLoading: !metrics || !health,
    hasAlerts: alerts.length > 0,
  };
}
