import React from 'react';
import { motion } from 'framer-motion';
import { useRealTimeMetrics } from '../hooks/useRealTimeMetrics';

export function SystemStatus() {
  const { metrics, health, alerts } = useRealTimeMetrics();

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
    </motion.div>
  );
}
