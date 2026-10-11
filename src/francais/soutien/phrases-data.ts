/**
 * Phrases didactiques Soutien FR (types 9 / 12 / 14) par banque et par niveau.
 *
 * Source : `./phrases/<bankId>.json` — rédigées à la main (FLE, phonétique) :
 * - A1 : 5–7 mots, ≥ 2 occurrences du son ;
 * - A2 : 8–12 mots, ≥ 3 occurrences ;
 * - B1 : 13–15 mots, ≥ 4 occurrences.
 * Le filtre `all` mélange les trois niveaux.
 */

export type SoutienPhraseLevel = 'a1' | 'a2' | 'b1'
export type SoutienLevelFilter = SoutienPhraseLevel | 'all'

export const SOUTIEN_LEVEL_FILTERS: ReadonlyArray<{ id: SoutienLevelFilter; label: string }> = [
  { id: 'all', label: 'Tous' },
  { id: 'a1', label: 'A1' },
  { id: 'a2', label: 'A2' },
  { id: 'b1', label: 'B1' },
]

export type SoutienLevelPhrase = { level: SoutienPhraseLevel; sentence: string }
export type SoutienLevelWordPhrase = SoutienLevelPhrase & { word: string }

export type SoutienBankPhrases = {
  /** Type 9 — le mot (tel qu’écrit dans la phrase) et sa phrase. */
  type9: SoutienLevelWordPhrase[]
  /** Type 12 — compter le son. */
  type12: SoutienLevelPhrase[]
  /** Type 14 — lire les phrases. */
  type14: SoutienLevelPhrase[]
}

const FILES = import.meta.glob('./phrases/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Partial<SoutienBankPhrases> | undefined
>

const BY_ID = new Map<string, SoutienBankPhrases>()
for (const [path, raw] of Object.entries(FILES)) {
  const id = path.replace(/^.*\//, '').replace(/\.json$/, '')
  if (!raw) continue
  BY_ID.set(id, {
    type9: Array.isArray(raw.type9) ? raw.type9.filter(isWordPhrase) : [],
    type12: Array.isArray(raw.type12) ? raw.type12.filter(isPhrase) : [],
    type14: Array.isArray(raw.type14) ? raw.type14.filter(isPhrase) : [],
  })
}

function isLevel(v: unknown): v is SoutienPhraseLevel {
  return v === 'a1' || v === 'a2' || v === 'b1'
}
function isPhrase(v: unknown): v is SoutienLevelPhrase {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return isLevel(o.level) && typeof o.sentence === 'string' && o.sentence.trim().length > 0
}
function isWordPhrase(v: unknown): v is SoutienLevelWordPhrase {
  if (!isPhrase(v)) return false
  const w = (v as Record<string, unknown>).word
  return typeof w === 'string' && w.trim().length > 0
}

/** Phrases rédigées pour une banque (ou `null` si aucun fichier). */
export function soutienPhrasesFor(bankId: string): SoutienBankPhrases | null {
  return BY_ID.get(bankId) ?? null
}

/** Filtre par niveau ; `all` / `undefined` → tout. */
export function filterSoutienLevel<T extends { level: SoutienPhraseLevel }>(
  rows: readonly T[],
  level: SoutienLevelFilter | undefined,
): T[] {
  if (!level || level === 'all') return [...rows]
  return rows.filter((r) => r.level === level)
}

/** Ids de banques disposant de phrases rédigées. */
export function soutienPhraseBankIds(): string[] {
  return [...BY_ID.keys()].sort()
}
