declare module '@/hooks/useOnlineStatus';
declare module '@/hooks/useAppError';
declare module '@/lib/logger';
declare module '@/components/ui/*';

type SystemHealth = {
  indicators: unknown[];
  issues: unknown[];
};

type SystemAlert = {
  severity: 'low' | 'medium' | 'high';
  // Fix issues declarations
  issues: string[]; // Make consistent across all interfaces
  // other common properties can go here
};

interface BaseSystemMetrics {
  // define common properties here if missing
}

interface AdvancedMetrics extends BaseSystemMetrics {
  // other specific properties
}

interface EnhancedSystemMetrics extends BaseSystemMetrics {
  performance?: never; // or define properly
  // other properties
}
