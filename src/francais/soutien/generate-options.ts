import type { MathItem } from '@/math/types'
import type { SoutienLevelFilter } from './phrases-data'

export type SoutienBatch = {
  items: MathItem[]
  instruction: string
  preferredColumns?: number
}

export type SoutienCompleterEntry = {
  id: string
  article: string
  before: string
  blank: string
  after: string
  word: string
  imageSrc?: string
}

export type SoutienGenerateOptions = {
  /** Type 1 : mode libre (mots / images saisis). */
  soutienMotsLibre?: boolean
  soutienMotsEntries?: ReadonlyArray<{ id: string; label: string; imageSrc?: string }>
  /**
   * Colonnes : type 4 → 1–2 ; types 5/6/8 → 1–3 ; type 7 → 3–5.
   * (Mélange indépendant par colonne pour le type 4.)
   */
  columns?: number
  /** Type 5 : mode libre. */
  soutienCompleterLibre?: boolean
  soutienCompleterEntries?: ReadonlyArray<SoutienCompleterEntry>
  /** Types 9 / 15 : mots déjà tirés (types 1 et 5) à exclure. */
  excludeWords?: readonly string[]
  /** Type 16 : mots du type 1 de la fiche (images). */
  type1Words?: readonly string[]
  /** Types 9 / 12 / 14 : niveau des phrases (défaut `all`). */
  level?: SoutienLevelFilter
}
