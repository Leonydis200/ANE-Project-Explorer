export type SystemHealth = {
  status: 'healthy' | 'degraded' | 'critical';
  indicators: {
    name: string;
    value: number;
    status: 'good' | 'warning' | 'critical';
  }[];
  issues: {
    id: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
};

export type SystemAlert = {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
};

export type PerformanceMetrics = {
  cpu: number;
  memory: number;
  responseTime: number;
};

export type EnhancedSystemMetrics = {
  // Add your specific metric properties here
};