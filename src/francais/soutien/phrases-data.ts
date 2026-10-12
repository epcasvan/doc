/**
 * Phrases didactiques Soutien FR (types 9 / 10 / 12 / 14).
 *
 * Banque **commune** : tous les fichiers `./phrases/<bankId>.json` sont fusionnés.
 * La sélection par exercice filtre ensuite (exclusion mots fiche, ≥3 sons, etc.).
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
  type9: SoutienLevelWordPhrase[]
  type10: SoutienLevelDetPhrase[]
  type12: SoutienLevelPhrase[]
  type14: SoutienLevelPhrase[]
}

const FILES = import.meta.glob('./phrases/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Partial<SoutienBankPhrases>
>

function isLevel(v: unknown): v is SoutienPhraseLevel {
  return v === 'a1' || v === 'a2' || v === 'b1'
}
function isPhrase(v: unknown): v is SoutienLevelPhrase {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return isLevel(o.level) && typeof o.sentence === 'string' && o.sentence.trim().length > 0
}
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
function isDetPart(v: unknown): v is SoutienDetPart {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.blank === 'string' && o.blank.trim()) return true
  return typeof o.t === 'string'
}
function isDetPhrase(v: unknown): v is SoutienLevelDetPhrase {
  if (!isPhrase(v)) return false
  const parts = (v as Record<string, unknown>).parts
  return (
    Array.isArray(parts) &&
    parts.length > 0 &&
    parts.every(isDetPart) &&
    parts.some((p) => 'blank' in (p as object))
  )
}

function normalizeBank(raw: Partial<SoutienBankPhrases> | undefined): SoutienBankPhrases {
  if (!raw) {
    return { type9: [], type10: [], type12: [], type14: [] }
  }
  return {
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
  }
}

const BY_ID = new Map<string, SoutienBankPhrases>()
for (const [path, raw] of Object.entries(FILES)) {
  const id = path.replace(/^.*\//, '').replace(/\.json$/, '')
  if (!raw) continue
  BY_ID.set(id, normalizeBank(raw))
}

/** Phrases d’un fichier banque (rétrocompat). */
export function soutienPhrasesFor(bankId: string): SoutienBankPhrases | null {
  return BY_ID.get(bankId) ?? null
}

/** Banque commune : union de toutes les banques JSON (dédupliquée). */
export function soutienPhrasesCommon(): SoutienBankPhrases {
  const type9: SoutienLevelWordPhrase[] = []
  const type10: SoutienLevelDetPhrase[] = []
  const type12: SoutienLevelPhrase[] = []
  const type14: SoutienLevelPhrase[] = []
  const seen9 = new Set<string>()
  const seen10 = new Set<string>()
  const seen12 = new Set<string>()
  const seen14 = new Set<string>()
  for (const bank of BY_ID.values()) {
    for (const row of bank.type9) {
      const key = `${row.level}|${row.word.toLowerCase()}|${row.sentence}`
      if (seen9.has(key)) continue
      seen9.add(key)
      type9.push(row)
    }
    for (const row of bank.type10) {
      const key = `${row.level}|${row.sentence}`
      if (seen10.has(key)) continue
      seen10.add(key)
      type10.push(row)
    }
    for (const row of bank.type12) {
      const key = `${row.level}|${row.sentence}`
      if (seen12.has(key)) continue
      seen12.add(key)
      type12.push(row)
    }
    for (const row of bank.type14) {
      const key = `${row.level}|${row.sentence}`
      if (seen14.has(key)) continue
      seen14.add(key)
      type14.push(row)
    }
  }
  return { type9, type10, type12, type14 }
}

/** Toutes les phrases plates (9 + 12 + 14) pour types 12 / 14. */
export function soutienAllFlatPhrases(
  level: SoutienLevelFilter | undefined,
): SoutienLevelPhrase[] {
  const common = soutienPhrasesCommon()
  const from9 = common.type9.map((r) => ({ level: r.level, sentence: r.sentence }))
  const rows = [...from9, ...common.type12, ...common.type14]
  return filterSoutienLevel(rows, level)
}

/** Filtre par niveau ; `all` / `undefined` → tout. */
export function filterSoutienLevel<T extends { level: SoutienPhraseLevel }>(
  rows: readonly T[],
  level: SoutienLevelFilter | undefined,
): T[] {
  if (!level || level === 'all') return [...rows]
  return rows.filter((r) => r.level === level)
}

/** Ids de banques disposant d’un fichier. */
export function soutienPhraseBankIds(): string[] {
  return [...BY_ID.keys()].sort()
}
