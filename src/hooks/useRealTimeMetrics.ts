import { useState, useEffect } from 'react';
import DataStreamService from '../services/DataStream';
import SelfDiagnosticsService from '../services/SelfDiagnosticsService';
import type { 
  RealTimeMetrics, 
  SystemHealth, 
  SystemAlert 
} from '../services/types';

// Initialize services
const dataStream = new DataStreamService();
const selfDiagnostics = new SelfDiagnosticsService();

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [repair, setRepair] = useState<RepairStatus | null>(null);
  const [improvement, setImprovement] = useState<ImprovementResult | null>(null);
  const [update, setUpdate] = useState<UpdateStatus | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'error'
  >('disconnected');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string>('');
  const [userCommand, setUserCommand] = useState<unknown>(null);

  useEffect(() => {
    const subscriptions = [
      dataStream.getMetricsStream().subscribe({
        next: setMetrics,
        error: (err) => console.error('Metrics stream error:', err)
      }),
      selfDiagnostics.getHealthStream().subscribe({
        next: setHealth,
        error: (err) => console.error('Health stream error:', err)
      }),
      selfDiagnostics.getAlertsStream().subscribe({
        next: setAlerts,
        error: (err) => console.error('Alerts stream error:', err)
      }),
      dataStream.getDiagnosticsStream().subscribe({
        next: setDiagnostics,
        error: (err) => console.error('Diagnostics stream error:', err)
      }),
      dataStream.getRepairStream().subscribe({
        next: setRepair,
        error: (err) => console.error('Repair stream error:', err)
      }),
      dataStream.getImprovementStream().subscribe({
        next: setImprovement,
        error: (err) => console.error('Improvement stream error:', err)
      }),
      dataStream.getUpdateStream().subscribe({
        next: setUpdate,
        error: (err) => console.error('Update stream error:', err)
      }),
      dataStream.getConnectionStatus().subscribe({
        next: setConnectionStatus,
        error: (err) => console.error('Connection status error:', err)
      }),
      dataStream.getFeedbackStream().subscribe({
        next: setFeedback,
        error: (err) => console.error('Feedback stream error:', err)
      }),
      dataStream.getUserCommandStream().subscribe({
        next: setUserCommand,
        error: (err) => console.error('User command stream error:', err)
      }),
    ];

    setIsLoading(false);

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, []);

  const sendUserCommand = useCallback((command: string, payload?: unknown) => {
    return dataStream.sendCommand(command, payload);
  }, []);

  return {
    metrics,
    health,
    alerts,
    diagnostics,
    repair,
    improvement,
    update,
    isLoading,
    hasAlerts: alerts.length > 0,
    connectionStatus,
    feedback,
    userCommand,
    sendUserCommand,
  };
}

// Type definitions for the hook's return values
interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface RepairStatus {
  status: 'pending' | 'completed' | 'failed';
  repairedIssues: string[];
}

interface ImprovementResult {
  performanceGain: number;
  changes: string[];
}

interface UpdateStatus {
  version: string;
  status: 'available' | 'downloading' | 'installed' | 'failed';
}