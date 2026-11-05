/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALERTS_URL?: string
  readonly VITE_DEMO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
