import React from 'react';
import { motion } from 'framer-motion';
import { useRealTimeMetrics } from '../hooks/useRealTimeMetrics';

export function SystemStatus() {
  const { metrics, health, alerts, feedback, sendUserCommand } = useRealTimeMetrics();
  // Temporary placeholder components
const HealthIndicator = ({ id, name, status, value, unit }: any) => (
  <div key={id} className="health-indicator">
    <span>{name}</span>
    <span>{value} {unit}</span>
    <span>{status}</span>
  </div>
);

const AlertList = ({ alerts }: any) => (
  <div className="alert-list">
    {alerts.map((alert: any) => (
      <div key={alert.id} className={`alert ${alert.severity}`}>
        {alert.message}
      </div>
    ))}
  </div>
);

const PerformanceGraph = ({ data }: any) => (
  <div className="performance-graph">
    {/* Placeholder for performance graph */}
    Performance Graph Placeholder
  </div>
);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6"
    >
      <div className="stat-card">
        <h3>System Health</h3>
        <div className="text-2xl font-bold">{health.score}%</div>
        <div className="flex mt-2">
          {health.indicators.map(indicator => (
            <HealthIndicator key={indicator.id} {...indicator} />
          ))}
        </div>
      </div>

      <div className="stat-card">
        <h3>Active Alerts</h3>
        <AlertList alerts={alerts} />
      </div>

      <div className="stat-card">
        <h3>Performance</h3>
        <PerformanceGraph data={metrics.performance} />
      </div>

      <div className="stat-card">
        <h3>User Actions</h3>
        <button onClick={() => sendUserCommand('diagnostics', {})}>Run Diagnostics</button>
        <button onClick={() => sendUserCommand('repair', {})}>Run Self-Repair</button>
        <button onClick={() => sendUserCommand('improvement', {})}>Run Self-Improvement</button>
        <button onClick={() => sendUserCommand('update', {})}>Run Self-Update</button>
        <div className="mt-2 text-sm text-primary">{feedback}</div>
      </div>
    </motion.div>
  );
}
