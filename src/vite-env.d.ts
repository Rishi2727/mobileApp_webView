/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_API_DOMAIN: string
  readonly VITE_API_IS_SECURE: string
  readonly VITE_API_X_API_KEY: string
  readonly VITE_APP_VERSION: string
  readonly VITE_RUNTIME_VERSION: string
  readonly VITE_DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}