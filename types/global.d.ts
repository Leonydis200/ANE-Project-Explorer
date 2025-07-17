// Global type definitions for the application

// Extend the Window interface
declare interface Window {
  __REACT_ERROR_BOUNDARY_RECOVERED_ERRORS__?: Array<{
    error: unknown;
    errorInfo: Error;
    timestamp: number;
  }>;
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
  __ERROR_BOUNDARY_HAS_ERROR__?: boolean;
}

// Extend the Error interface
declare interface Error {
  code?: string | number;
  statusCode?: number;
  cause?: unknown;
  isOperational?: boolean;
  toJSON?: () => Record<string, unknown>;
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    VITE_APP_NAME?: string;
    VITE_APP_VERSION?: string;
    VITE_APP_BUILD_DATE?: string;
    VITE_SENTRY_DSN?: string;
    VITE_GOOGLE_ANALYTICS_ID?: string;
  }
}

// Vite environment variables
declare interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_BUILD_DATE: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
  readonly DEV: boolean;
  readonly MODE: 'development' | 'production' | 'test';
  readonly PROD: boolean;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// JSX types for React
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
