export interface LiveMetrics {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

// Base interface for common properties
interface BaseSystemMetrics {
  issues: string[];
  timestamp?: Date;
}

export interface AdvancedMetrics extends BaseSystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  load?: number[];
  uptime?: number;
}

export interface SystemHealth extends BaseSystemMetrics {
  status: 'online' | 'offline' | 'degraded';
  overall?: number;
  lastCheck?: Date;
  indicators: HealthIndicator[];
}

export interface HealthIndicator {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'critical';
  value: number;
  unit: string;
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface OptimizationStatus {
  lastOptimized: Date;
  improvements: string[];
  performanceGain: number;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface SystemAlert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  component?: string;
  resolved?: boolean;
}

export interface PerformanceMetrics extends BaseSystemMetrics {
  timestamps: string[];
  cpu: number[];
  memory: number[];
  networkIn?: number[];
  networkOut?: number[];
  diskRead?: number[];
  diskWrite?: number[];
}

// For systems with enhanced monitoring capabilities
export interface EnhancedSystemMetrics extends BaseSystemMetrics {
  cpu: {
    usage: number;
    temperature?: number;
    frequency?: number;
  };
  memory: {
    usage: number;
    free: number;
    cached: number;
  };
  disk: {
    usage: number;
    read: number;
    write: number;
  };
  network: {
    in: number;
    out: number;
    connections: number;
  };
}