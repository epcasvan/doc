/**
 * Phrases didactiques Soutien FR (types 9 / 10 / 12 / 14).
 *
 * Banque **commune** : tous les fichiers `./phrases/<bankId>.json` sont fusionnés.
 * Syntaxe identique type 9 et type 12 :
 * `{ "level", "number"?, "word", "sentence" }`
 */

import {
  inferFirstNoun,
  inferNumberForSentence,
  inferNumberForWordPhrase,
  parsePhraseNumber,
  type SoutienPhraseNumber,
} from './phrase-number'

export type SoutienPhraseLevel = 'a1' | 'a2' | 'b1'
export type SoutienLevelFilter = SoutienPhraseLevel | 'all'
export type { SoutienPhraseNumber }

export const SOUTIEN_LEVEL_FILTERS: ReadonlyArray<{ id: SoutienLevelFilter; label: string }> = [
  { id: 'all', label: 'Tous' },
  { id: 'a1', label: 'A1' },
  { id: 'a2', label: 'A2' },
  { id: 'b1', label: 'B1' },
]

/** Entrée banque type 9 / 12 (même syntaxe). */
export type SoutienLevelWordPhrase = {
  level: SoutienPhraseLevel
  /** Nombre : singulier / pluriel. */
  number?: SoutienPhraseNumber
  word: string
  sentence: string
}

/** Alias rétrocompat — même forme que type 9. */
export type SoutienLevelPhrase = SoutienLevelWordPhrase

export type SoutienDetPart = { t: string } | { blank: string }
export type SoutienLevelDetPhrase = {
  level: SoutienPhraseLevel
  number?: SoutienPhraseNumber
  sentence: string
  parts: SoutienDetPart[]
}

export type SoutienBankPhrases = {
  type9: SoutienLevelWordPhrase[]
  type10: SoutienLevelDetPhrase[]
  type12: SoutienLevelWordPhrase[]
  type14: SoutienLevelWordPhrase[]
}

const FILES = import.meta.glob('./phrases/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Partial<SoutienBankPhrases>
>

function isLevel(v: unknown): v is SoutienPhraseLevel {
  return v === 'a1' || v === 'a2' || v === 'b1'
}

function isPhraseRaw(
  v: unknown,
): v is { level?: unknown; sentence: string; word?: unknown; number?: unknown } {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.sentence !== 'string' || !o.sentence.trim()) return false
  if (o.level !== undefined && !isLevel(o.level)) return false
  if (o.number !== undefined && parsePhraseNumber(o.number) === undefined) return false
  if (o.word !== undefined && (typeof o.word !== 'string' || !o.word.trim())) return false
  return true
}

function isDetPart(v: unknown): v is SoutienDetPart {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.blank === 'string' && o.blank.trim()) return true
  return typeof o.t === 'string'
}

function isDetPhrase(v: unknown): v is SoutienLevelDetPhrase {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.sentence !== 'string' || !o.sentence.trim()) return false
  if (o.level !== undefined && !isLevel(o.level)) return false
  const parts = o.parts
  return (
    Array.isArray(parts) &&
    parts.length > 0 &&
    parts.every(isDetPart) &&
    parts.some((p) => 'blank' in (p as object))
  )
}

function firstLetterWord(sentence: string): string | undefined {
  const m = sentence.match(/\p{L}[\p{L}'’-]*/u)
  return m?.[0]
}

/** Normalise une entrée type 9 / 12 / 14 — syntaxe unique. */
export function normalizeWordPhrase(row: {
  level?: unknown
  number?: unknown
  word?: unknown
  sentence: string
}): SoutienLevelWordPhrase | null {
  const sentence = String(row.sentence).trim()
  if (!sentence) return null
  const word =
    (typeof row.word === 'string' && row.word.trim()
      ? row.word.trim()
      : inferFirstNoun(sentence) ?? firstLetterWord(sentence)) ?? ''
  if (!word) return null
  const number =
    parsePhraseNumber(row.number) ??
    inferNumberForWordPhrase(sentence, word) ??
    inferNumberForSentence(sentence)
  // Ordre canonique JSON : level, number, word, sentence
  return {
    level: (isLevel(row.level) ? row.level : 'a2') as SoutienPhraseLevel,
    ...(number ? { number } : {}),
    word,
    sentence,
  }
}

function normalizeBank(raw: Partial<SoutienBankPhrases> | undefined): SoutienBankPhrases {
  if (!raw) {
    return { type9: [], type10: [], type12: [], type14: [] }
  }
  const mapRows = (rows: unknown): SoutienLevelWordPhrase[] =>
    Array.isArray(rows)
      ? rows
          .filter(isPhraseRaw)
          .map((row) => normalizeWordPhrase(row))
          .filter((row): row is SoutienLevelWordPhrase => Boolean(row))
      : []

  return {
    type9: mapRows(raw.type9),
    type10: Array.isArray(raw.type10) ? raw.type10.filter(isDetPhrase) : [],
    type12: mapRows(raw.type12),
    type14: mapRows(raw.type14),
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
  const type12: SoutienLevelWordPhrase[] = []
  const type14: SoutienLevelWordPhrase[] = []
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
      const key = `${row.level}|${row.word.toLowerCase()}|${row.sentence}`
      if (seen12.has(key)) continue
      seen12.add(key)
      type12.push(row)
    }
    for (const row of bank.type14) {
      const key = `${row.level}|${row.word.toLowerCase()}|${row.sentence}`
      if (seen14.has(key)) continue
      seen14.add(key)
      type14.push(row)
    }
  }
  return { type9, type10, type12, type14 }
}

/** Toutes les phrases plates (9 + 12 + 14) pour types 12 / 14 / 10. */
export function soutienAllFlatPhrases(
  level: SoutienLevelFilter | undefined,
): SoutienLevelPhrase[] {
  const common = soutienPhrasesCommon()
  const rows = [...common.type9, ...common.type12, ...common.type14]
  return filterSoutienLevel(rows, level)
}

/** Banque commune type 9 + 12 (même syntaxe). */
export function soutienPhrasesType9And12(
  level: SoutienLevelFilter | undefined,
): SoutienLevelWordPhrase[] {
  const common = soutienPhrasesCommon()
  return filterSoutienLevel([...common.type9, ...common.type12], level)
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
