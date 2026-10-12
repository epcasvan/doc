/**
 * Phrases didactiques Soutien FR (types 9 / 10 / 12 / 14) par banque et par niveau.
 *
 * Source : `./phrases/<bankId>.json` — listes à niveau a1 / a2 / b1.
 * Types 12 / 14 : phrases plates (pas d’histoires).
 * Banques vides → repli sur `countPhrases` / `readPhrases` / banques mot.
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
export type SoutienDetPart = { t: string } | { blank: string }
export type SoutienLevelDetPhrase = SoutienLevelPhrase & {
  parts: SoutienDetPart[]
}

export type SoutienBankPhrases = {
  /** Type 9 — le mot (tel qu’écrit dans la phrase) et sa phrase. */
  type9: SoutienLevelWordPhrase[]
  /** Type 10 — déterminants l’ / le / la / les. */
  type10: SoutienLevelDetPhrase[]
  /** Type 12 — compter le son. */
  type12: SoutienLevelPhrase[]
  /** Type 14 — lire les phrases. */
  type14: SoutienLevelPhrase[]
}

const FILES = import.meta.glob('./phrases/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Partial<SoutienBankPhrases>
>

const BY_ID = new Map<string, SoutienBankPhrases>()
for (const [path, raw] of Object.entries(FILES)) {
  const id = path.replace(/^.*\//, '').replace(/\.json$/, '')
  if (!raw) continue
  BY_ID.set(id, {
    type9: Array.isArray(raw.type9)
      ? raw.type9.filter(isWordPhraseRaw).map((row) => ({
          level: (isLevel(row.level) ? row.level : 'a2') as SoutienPhraseLevel,
          word: String(row.word).trim(),
          sentence: String(row.sentence).trim(),
        }))
      : [],
    type10: Array.isArray(raw.type10) ? raw.type10.filter(isDetPhrase) : [],
    type12: Array.isArray(raw.type12)
      ? raw.type12.filter(isPhraseRaw).map((row) => ({
          level: (isLevel(row.level) ? row.level : 'a2') as SoutienPhraseLevel,
          sentence: String(row.sentence).trim(),
        }))
      : [],
    type14: Array.isArray(raw.type14)
      ? raw.type14.filter(isPhraseRaw).map((row) => ({
          level: (isLevel(row.level) ? row.level : 'a2') as SoutienPhraseLevel,
          sentence: String(row.sentence).trim(),
        }))
      : [],
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
/** Phrase plate (niveau optionnel — défaut a2 à l’import). */
function isPhraseRaw(v: unknown): v is { level?: unknown; sentence: string } {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.sentence !== 'string' || !o.sentence.trim()) return false
  if (o.level !== undefined && !isLevel(o.level)) return false
  return true
}
function isWordPhraseRaw(
  v: unknown,
): v is { level?: unknown; word: string; sentence: string } {
  if (!isPhraseRaw(v)) return false
  const w = (v as Record<string, unknown>).word
  return typeof w === 'string' && w.trim().length > 0
}
function isWordPhrase(v: unknown): v is SoutienLevelWordPhrase {
  if (!isPhrase(v)) return false
  const w = (v as Record<string, unknown>).word
  return typeof w === 'string' && w.trim().length > 0
}
function isDetPart(v: unknown): v is SoutienDetPart {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.blank === 'string' && o.blank.trim()) return true
  return typeof o.t === 'string'
}
function isDetPhrase(v: unknown): v is SoutienLevelDetPhrase {
  if (!isPhrase(v)) return false
  const parts = (v as Record<string, unknown>).parts
  return Array.isArray(parts) && parts.length > 0 && parts.every(isDetPart) && parts.some((p) => 'blank' in (p as object))
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
