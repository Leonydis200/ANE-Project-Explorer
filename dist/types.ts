export interface LiveMetrics {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface AdvancedMetrics {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  // Add other properties as needed
}

export interface SystemHealth {
  status: 'online' | 'offline' | 'degraded';
  indicators: HealthIndicator[];
  issues: string[];
}

export interface HealthIndicator {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'critical';
  value: number;
  unit: string;
}

export interface PerformanceMetrics {
  // Define performance metrics properties
}

export interface OptimizationStatus {
  // Define optimization status properties
}

export interface SystemAlert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}