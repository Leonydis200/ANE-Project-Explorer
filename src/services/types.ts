export interface PerformanceMetrics {
  timestamps: number[];
  cpu: number[];
  memory: number[];
  issues: string[];
}

export interface AdvancedMetrics {
  disk: number[];
  issues: string[];
  // Add other required properties
}

export interface OptimizationStatus {
  status: 'idle' | 'optimizing' | 'optimized' | 'error';
  lastOptimized: Date;
  improvements: string[];
}

export interface HealthIndicator {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'critical';
  value: number;
  unit: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  indicators: HealthIndicator[];
  timestamp: Date;
}
