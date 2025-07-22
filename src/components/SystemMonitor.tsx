import React, { useState, useEffect } from 'react';
import { 
  AdvancedMetrics, 
  SystemHealth, 
  PerformanceMetrics, 
  OptimizationStatus 
} from './types';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { dataStream } from '../services/DataStream';
import { SelfDiagnosticsService } from '../services/SelfDiagnosticsService';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const selfDiagnostics = new SelfDiagnosticsService();

interface ChartData {
  labels?: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    fill: boolean;
  }[];
}

interface SystemUpdate {
  status: string;
  message: string;
  timestamp: Date;
}

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    timestamps: [],
    cpu: [],
    memory: []
  });
  const [optimizationStatus, setOptimizationStatus] = useState<OptimizationStatus>({});
  const [update, setUpdate] = useState<SystemUpdate | null>(null);

  useEffect(() => {
    const subscriptions = [
      dataStream.getMetricsStream().subscribe({
        next: (data: AdvancedMetrics) => setMetrics(data),
        error: (err: Error) => console.error('Metrics stream error:', err)
      }),
      selfDiagnostics.getHealthStream().subscribe({
        next: (data: SystemHealth) => setHealth(data),
        error: (err: Error) => console.error('Health stream error:', err)
      }),
      dataStream.getPerformanceMetrics().subscribe({
        next: (data: PerformanceMetrics) => setPerformanceMetrics(data),
        error: (err: Error) => console.error('Performance metrics error:', err)
      }),
      dataStream.getUpdateStream().subscribe({
        next: (data: SystemUpdate) => setUpdate(data),
        error: (err: Error) => console.error('Update stream error:', err)
      })
    ];

    return () => subscriptions.forEach(sub => sub.unsubscribe());
  }, []);

  const chartData: ChartData = {
    labels: performanceMetrics.timestamps,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: performanceMetrics.cpu,
        borderColor: '#4caf50',
        fill: false
      },
      {
        label: 'Memory Usage (%)',
        data: performanceMetrics.memory,
        borderColor: '#2196f3',
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y}%`;
            }
            return label;
          }
        }
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
          text: 'Usage (%)',
        },
        min: 0,
        max: 100,
        ticks: {
          callback: (value: string | number) => `${value}%`,
        },
      },
    },
  };

  const handleTriggerDiagnostics = () => {
    dataStream.triggerSelfDiagnostics().catch(err => {
      console.error('Diagnostics error:', err);
    });
  };

  const handleTriggerRepair = () => {
    dataStream.triggerSelfRepair().catch(err => {
      console.error('Repair error:', err);
    });
  };

  const handleTriggerImprovement = () => {
    dataStream.triggerSelfImprovement().catch(err => {
      console.error('Improvement error:', err);
    });
  };

  const handleTriggerUpdate = () => {
    dataStream.triggerSelfUpdate().catch(err => {
      console.error('Update error:', err);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-4">System Performance</h2>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Health Status</h2>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${
            health?.overall && health.overall > 80 ? 'bg-green-500' : 
            health?.overall && health.overall > 60 ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}>
            <span className="text-xl font-bold">{health?.overall ?? 'N/A'}%</span>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last check: {health?.lastCheck ? new Date(health.lastCheck).toLocaleString() : 'N/A'}
            </div>
            {health?.indicators && (
              <div className="mt-2 space-y-1">
                {health.indicators.map((indicator, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {indicator.status === 'healthy' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span>{indicator.name}: {indicator.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:col-span-2"
      >
        <h2 className="text-lg font-semibold mb-4">System Controls</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleTriggerDiagnostics}
          >
            <Activity className="inline mr-2 w-4 h-4" />
            Run Diagnostics
          </button>
          <button 
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            onClick={handleTriggerRepair}
          >
            <AlertTriangle className="inline mr-2 w-4 h-4" />
            Run Self-Repair
          </button>
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            onClick={handleTriggerImprovement}
          >
            <CheckCircle className="inline mr-2 w-4 h-4" />
            Run Self-Improvement
          </button>
          <button 
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            onClick={handleTriggerUpdate}
          >
            Run Self-Update
          </button>
        </div>
        
        {update && (
          <div className={`mt-4 p-3 rounded ${
            update.status === 'success' ? 'bg-green-100 text-green-800' :
            update.status === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            <div className="font-medium">Update Status: {update.status}</div>
            <div className="text-sm">{update.message}</div>
            <div className="text-xs mt-1">
              {new Date(update.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}