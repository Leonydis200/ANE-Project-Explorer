export interface SystemHealth {
  overall: number;
  components: Record<string, number>;
  lastCheck: string | Date;
  issues?: string[];
}

export interface DiagnosticEntry {
  timestamp: number | string | Date;
  results: Array<{
    status: 'success' | 'warning' | 'error';
    message: string;
    details?: any;
  }>;
}

export interface DashboardState {
  health: SystemHealth | null;
  alerts: string[];
  feedback: string;
  history: DiagnosticEntry[];
  isLoading: boolean;
  error: string | null;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error';
  label: string;
  className?: string;
}
