/**
 * Phrases didactiques Soutien FR (types 9 / 10 / 12 / 14) par banque et par niveau.
 *
 * Source : `./phrases/<bankId>.json` — à remplir (FLE, phonétique) :
 * - Types 9 / 10 : listes à niveau a1 / a2 / b1 ;
 * - Types 12 / 14 : histoires A2–B1 (10 par banque) —
 *   type 12 = 9 phrases / histoire ; type 14 = 19 phrases / histoire.
 *   La fiche tire une histoire puis utilise les phrases dans l’ordre (Q1 = phrase 1…).
 * Banques actuellement vides : repli sur `countPhrases` / `readPhrases` / banques mot.
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

/** Histoire type 12 (9 phrases) ou 14 (19 phrases). */
export type SoutienPhraseStory = {
  level: SoutienPhraseLevel
  sentences: string[]
}

export type SoutienBankPhrases = {
  /** Type 9 — le mot (tel qu’écrit dans la phrase) et sa phrase. */
  type9: SoutienLevelWordPhrase[]
  /** Type 10 — déterminants l’ / le / la / les. */
  type10: SoutienLevelDetPhrase[]
  /**
   * Type 12 — compter le son (legacy plat ; utilisé seulement si pas d’histoires).
   * @deprecated préférer `type12Stories`
   */
  type12: SoutienLevelPhrase[]
  /**
   * Type 14 — lire les phrases (legacy plat).
   * @deprecated préférer `type14Stories`
   */
  type14: SoutienLevelPhrase[]
  /** Type 12 — 10 histoires × 9 phrases (A2–B1). */
  type12Stories: SoutienPhraseStory[]
  /** Type 14 — 10 histoires × 19 phrases (A2–B1). */
  type14Stories: SoutienPhraseStory[]
}

const FILES = import.meta.glob('./phrases/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Partial<SoutienBankPhrases> & {
    type12Stories?: unknown
    type14Stories?: unknown
  }
>

const BY_ID = new Map<string, SoutienBankPhrases>()
for (const [path, raw] of Object.entries(FILES)) {
  const id = path.replace(/^.*\//, '').replace(/\.json$/, '')
  if (!raw) continue
  BY_ID.set(id, {
    type9: Array.isArray(raw.type9)
      ? raw.type9.filter(isWordPhrase).map((row) => ({
          level: row.level ?? 'a2',
          word: row.word.trim(),
          sentence: row.sentence.trim(),
        }))
      : [],
    type10: Array.isArray(raw.type10) ? raw.type10.filter(isDetPhrase) : [],
    type12: Array.isArray(raw.type12)
      ? raw.type12
          .filter(isPhrase)
          .map((row) => ({ level: row.level ?? 'a2', sentence: row.sentence.trim() }))
      : [],
    type14: Array.isArray(raw.type14)
      ? raw.type14
          .filter(isPhrase)
          .map((row) => ({ level: row.level ?? 'a2', sentence: row.sentence.trim() }))
      : [],
    type12Stories: Array.isArray(raw.type12Stories)
      ? raw.type12Stories.filter((s) => isStory(s, 9))
      : [],
    type14Stories: Array.isArray(raw.type14Stories)
      ? raw.type14Stories.filter((s) => isStory(s, 19))
      : [],
  })
}

function isLevel(v: unknown): v is SoutienPhraseLevel {
  return v === 'a1' || v === 'a2' || v === 'b1'
}
function isPhrase(v: unknown): v is SoutienLevelPhrase {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  const levelOk = o.level === undefined || isLevel(o.level)
  return levelOk && typeof o.sentence === 'string' && o.sentence.trim().length > 0
}
function isWordPhrase(v: unknown): v is SoutienLevelWordPhrase {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.sentence !== 'string' || !o.sentence.trim()) return false
  if (typeof o.word !== 'string' || !o.word.trim()) return false
  if (o.level !== undefined && !isLevel(o.level)) return false
  return true
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
function isStory(v: unknown, wantLen: number): v is SoutienPhraseStory {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (!isLevel(o.level) || !Array.isArray(o.sentences)) return false
  if (o.sentences.length !== wantLen) return false
  return o.sentences.every((s) => typeof s === 'string' && s.trim().length > 0)
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

/** Histoires filtrées par niveau (A2–B1 ; `all` = les deux). */
export function filterSoutienStories(
  stories: readonly SoutienPhraseStory[],
  level: SoutienLevelFilter | undefined,
): SoutienPhraseStory[] {
  if (!level || level === 'all') {
    // Préférence A2–B1 : ignorer d’éventuels a1
    const ab = stories.filter((s) => s.level === 'a2' || s.level === 'b1')
    return ab.length > 0 ? ab : [...stories]
  }
  if (level === 'a1') {
    // Pas d’histoires A1 : repli A2
    const a2 = stories.filter((s) => s.level === 'a2')
    return a2.length > 0 ? a2 : [...stories]
  }
  return stories.filter((s) => s.level === level)
}

/** Ids de banques disposant de phrases rédigées. */
export function soutienPhraseBankIds(): string[] {
  return [...BY_ID.keys()].sort()
}
