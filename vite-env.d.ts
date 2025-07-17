/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom" />

// Environment Variables Type Definitions
interface ImportMetaEnv {
  // Application
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_BASE_URL: string;
  
  // API Configuration
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_OFFLINE: string;
  readonly VITE_ENABLE_DEBUG: string;
  
  // Build Configuration
  readonly VITE_SOURCEMAP: string;
  readonly VITE_MINIFY: string;
  
  // Performance
  readonly VITE_LAZY_LOAD: string;
  readonly VITE_PRELOAD_RESOURCES: string;
  
  // Security
  readonly VITE_CSP_ENABLED: string;
  readonly VITE_HSTS_ENABLED: string;
  readonly VITE_XSS_PROTECTION: string;
  readonly VITE_NOSNIFF: string;
  
  // PWA Configuration
  readonly VITE_PWA_ENABLED: string;
  readonly VITE_PWA_REGISTER_TYPE: string;
  readonly VITE_PWA_SCOPE: string;
  readonly VITE_PWA_START_URL: string;
  readonly VITE_PWA_ORIENTATION: string;
  readonly VITE_PWA_DISPLAY: string;
  readonly VITE_PWA_BACKGROUND_COLOR: string;
  readonly VITE_PWA_THEME_COLOR: string;
  
  // Sentry (Error Tracking)
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SENTRY_ENVIRONMENT: string;
  
  // Google Analytics
  readonly VITE_GA_TRACKING_ID: string;
  
  // Development Server
  readonly VITE_PORT: string;
  readonly VITE_HOST: string;
  readonly VITE_OPEN_BROWSER: string;
  readonly VITE_HTTPS: string;
  readonly VITE_PROXY_TARGET: string;
  
  // Testing
  readonly VITE_TEST_ENV: string;
  readonly VITE_TEST_COVERAGE: string;
  readonly VITE_TEST_WATCH: string;
  
  // Build Output
  readonly VITE_OUT_DIR: string;
  readonly VITE_ASSETS_DIR: string;
  
  // Authentication
  readonly VITE_AUTH_ENABLED: string;
  readonly VITE_AUTH_PROVIDER: string;
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_REFRESH_TOKEN_KEY: string;
  
  // Internationalization
  readonly VITE_I18N_ENABLED: string;
  readonly VITE_I18N_DEFAULT_LOCALE: string;
  readonly VITE_I18N_FALLBACK_LOCALE: string;
  readonly VITE_I18N_LOCALE_DIR: string;
  
  // Theme
  readonly VITE_THEME_DEFAULT: string;
  readonly VITE_THEME_AVAILABLE: string;
  readonly VITE_THEME_STORAGE_KEY: string;
  
  // API Timeouts (in milliseconds)
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_API_RETRY_ATTEMPTS: string;
  readonly VITE_API_RETRY_DELAY: string;
  
  // Feature Toggles
  readonly VITE_FEATURE_DARK_MODE: string;
  readonly VITE_FEATURE_NOTIFICATIONS: string;
  readonly VITE_FEATURE_ANALYTICS: string;
  readonly VITE_FEATURE_OFFLINE: string;
  
  // API Endpoints
  readonly VITE_API_AUTH: string;
  readonly VITE_API_USERS: string;
  readonly VITE_API_MODULES: string;
  readonly VITE_API_DIAGNOSTICS: string;
  
  // WebSocket Endpoints
  readonly VITE_WS_EVENTS: string;
  readonly VITE_WS_LOGS: string;
  
  // Feature Flags (UI)
  readonly VITE_FEATURE_DASHBOARD: string;
  readonly VITE_FEATURE_MODULES: string;
  readonly VITE_FEATURE_DIAGNOSTICS: string;
  readonly VITE_FEATURE_SETTINGS: string;
  readonly VITE_FEATURE_USERS: string;
  
  // Performance Monitoring
  readonly VITE_PERF_MONITORING: string;
  readonly VITE_WEB_VITALS: string;
  
  // Cache
  readonly VITE_CACHE_ENABLED: string;
  readonly VITE_CACHE_VERSION: string;
  readonly VITE_CACHE_PREFIX: string;
  
  // Logging
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_LOG_CONSOLE: string;
  readonly VITE_LOG_FILE: string;
  readonly VITE_LOG_FILE_PATH: string;
  
  // Error Handling
  readonly VITE_ERROR_BOUNDARY: string;
  readonly VITE_ERROR_REPORTING: string;
  readonly VITE_ERROR_REPORTING_URL: string;
  
  // Security Headers
  readonly VITE_SECURITY_HEADERS: string;
  readonly VITE_CSP_DIRECTIVES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declarations for environment variables
namespace NodeJS {
  interface ProcessEnv extends ImportMetaEnv {}
}

// For CSS Modules with TypeScript
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// For SCSS Modules with TypeScript
declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// For LESS Modules with TypeScript
declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// For SASS Modules with TypeScript
declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// For JSON files
declare module '*.json' {
  const value: any;
  export default value;
}

// For SVG files as React components
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

// For image files
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.avif' {
  const value: string;
  export default value;
}

declare module '*.ico' {
  const value: string;
  export default value;
}

declare module '*.bmp' {
  const value: string;
  export default value;
}

// For CSS files
declare module '*.css' {
  const content: string;
  export default content;
}

// For SCSS files
declare module '*.scss' {
  const content: string;
  export default content;
}

// For MD/MDX files
declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.mdx' {
  const content: string;
  export default content;
}

// For GraphQL files
declare module '*.graphql' {
  import { DocumentNode } from 'graphql';
  const content: DocumentNode;
  export default content;
}

declare module '*.gql' {
  import { DocumentNode } from 'graphql';
  const content: DocumentNode;
  export default content;
}

// For Web Workers
declare module '*?worker' {
  const worker: new () => Worker;
  export default worker;
}

declare module '*?worker&inline' {
  const worker: new () => Worker;
  export default worker;
}

// For CSS/SCSS modules with TypeScript (type-safe class names)
type CSSModuleClasses = { readonly [key: string]: string };

declare module '*.module.css' {
  const classes: CSSModuleClasses;
  export default classes;
}

declare module '*.module.scss' {
  const classes: CSSModuleClasses;
  export default classes;
}

// For environment variable type checking
type ImportMetaEnv = {
  [key: string]: any;
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global type extensions
declare global {
  // Add any global type extensions here
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    __INITIAL_STATE__?: any;
  }
}

export {}; // This file needs to be a module
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.avif';
declare module '*.ico';
declare module '*.bmp';
declare module '*.tiff';
declare module '*.woff';
declare module '*.woff2';
declare module '*.eot';
declare module '*.ttf';
declare module '*.otf';

// For CSS custom properties (variables)
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// For SCSS files
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

// For LESS files
declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}

// For SASS files
declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}

// For JSON files
declare module '*.json' {
  const value: any;
  export default value;
}

// For YAML files
declare module '*.yaml' {
  const value: any;
  export default value;
}

declare module '*.yml' {
  const value: any;
  export default value;
}
