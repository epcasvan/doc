/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACCESS_ADMIN?: string
  readonly VITE_ACCESS_FULL?: string
  readonly VITE_ACCESS_PARTIAL?: string
  /** Domaines du compte admin (peut inclure tpm). */
  readonly VITE_ACCESS_DOMAINS_ADMIN?: string
  /** Liste de domaines séparés par des virgules (ex. français,algèbre,géométrie,…). */
  readonly VITE_ACCESS_DOMAINS_FULL?: string
  /** Liste de domaines séparés par des virgules (ex. algèbre,géométrie). */
  readonly VITE_ACCESS_DOMAINS_PARTIAL?: string
  /** Origine de l’API fiches (Cloudflare Worker), sans slash final. */
  readonly VITE_FICHES_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
