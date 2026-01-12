/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STOCKDATA_API_KEY: string
  readonly VITE_FMP_API_KEY: string
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_SCUTTLEBUTT_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

