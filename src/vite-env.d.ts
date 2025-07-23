/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_APP_NAME?: string
    readonly DEV: boolean
    readonly PROD: boolean
    // Add other environment variables you use
  }
}
