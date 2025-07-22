declare module '@/hooks/useOnlineStatus';
declare module '@/hooks/useAppError';
declare module '@/lib/logger';
declare module '@/components/ui/*';

type SystemHealth = {
  status: 'healthy' | 'degraded' | 'critical';
  indicators: any[];
  issues: any[];
};

type SystemAlert = {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
};
// Fix issues declarations
interface BaseSystemMetrics {
  issues: string[]; // Make consistent across all interfaces
  // other common properties
}

interface AdvancedMetrics extends BaseSystemMetrics {
  disk: number;
  // other specific properties
}

interface EnhancedSystemMetrics extends BaseSystemMetrics {
  performance?: never; // Remove or properly define
  // other properties
}