/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_BACKEND: string
  readonly SUPABASE_STORAGE_BUCKET: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

