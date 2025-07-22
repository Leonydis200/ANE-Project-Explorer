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