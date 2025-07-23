declare module '@/hooks/useOnlineStatus';
declare module '@/hooks/useAppError';
declare module '@/lib/logger';
declare module '@/components/ui/*';
type SystemHealth = {
  indicators: any[];
  issues: any[];
type SystemAlert = {
  severity: 'low' | 'medium' | 'high';
// Fix issues declarations
  issues: string[]; // Make consistent across all interfaces
  // other common properties
interface AdvancedMetrics extends BaseSystemMetrics {
  // other specific properties
interface EnhancedSystemMetrics extends BaseSystemMetrics {
  performance?: never; // Remove or properly define
  // other properties
