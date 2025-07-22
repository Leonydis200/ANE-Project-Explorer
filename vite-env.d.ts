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
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_SOCKET_URL: string;
  
  // Authentication
  readonly VITE_AUTH_ENABLED: string;
  readonly VITE_AUTH_PROVIDER: string;
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_OFFLINE: string;
  
  // Build Configuration
  readonly VITE_SOURCEMAP: string;
  readonly VITE_MINIFY: string;
  
  // Development
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly VITE_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// CSS Modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Assets
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

// JSON
declare module '*.json' {
  const value: any;
  export default value;
}

// Web Workers
declare module '*?worker' {
  const worker: new () => Worker;
  export default worker;
}

// Global type extensions
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: Function;
  }
}

export {}; // Ensure this is a module