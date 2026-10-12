/**
 * Phrases didactiques Soutien FR (types 9 / 10 / 12 / 14).
 *
 * Un fichier par son : `./phrases/<son>.json`
 * `{ son, phrases: [{ word, variants: [{ level, number?, sentences[] }] }] }`
 *
 * La fiche d’un son ne lit que ce fichier (pas les ~33k lignes globales).
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

/** Variante niveau / nombre dans un fichier son. */
export type SoutienPhraseVariant = {
  level: SoutienPhraseLevel
  number?: SoutienPhraseNumber
  sentences: string[]
}

/** Entrée mot dans un fichier son (le son est celui du fichier). */
export type SoutienWordPhrases = {
  word: string
  variants: SoutienPhraseVariant[]
}

/** Ligne plate pour les générateurs (une phrase). */
export type SoutienLevelWordPhrase = {
  level: SoutienPhraseLevel
  number?: SoutienPhraseNumber
  word: string
  son: string
  sentence: string
}

/** Alias — même forme plate. */
export type SoutienLevelPhrase = SoutienLevelWordPhrase

export type SoutienDetPart = { t: string } | { blank: string }
export type SoutienLevelDetPhrase = {
  level: SoutienPhraseLevel
  number?: SoutienPhraseNumber
  sentence: string
  parts: SoutienDetPart[]
}

export type SoutienBankPhrases = {
  phrases: SoutienLevelWordPhrase[]
  /** @deprecated alias de `phrases` */
  type9: SoutienLevelWordPhrase[]
  type10: SoutienLevelDetPhrase[]
  /** @deprecated alias de `phrases` */
  type12: SoutienLevelWordPhrase[]
  type14: SoutienLevelWordPhrase[]
}

/** Eager : tous les fichiers sont connus ; on n’utilise que celui du son demandé. */
const FILES = import.meta.glob('./phrases/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, { son?: string; phrases?: unknown[] }>

function isLevel(v: unknown): v is SoutienPhraseLevel {
  return v === 'a1' || v === 'a2' || v === 'b1'
}

function bankBundle(rows: SoutienLevelWordPhrase[]): SoutienBankPhrases {
  return {
    phrases: rows,
    type9: rows,
    type10: [],
    type12: rows,
    type14: rows,
  }
}

function normalizeVariant(raw: unknown): SoutienPhraseVariant | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const level = (isLevel(o.level) ? o.level : 'a2') as SoutienPhraseLevel
  const number = parsePhraseNumber(o.number)
  const sentences: string[] = []
  if (Array.isArray(o.sentences)) {
    for (const s of o.sentences) {
      if (typeof s === 'string' && s.trim()) sentences.push(s.trim())
    }
  }
  if (sentences.length === 0 && typeof o.sentence === 'string' && o.sentence.trim()) {
    sentences.push(o.sentence.trim())
  }
  if (sentences.length === 0) return null
  return {
    level,
    ...(number ? { number } : {}),
    sentences,
  }
}

function expandFile(son: string, raw: { phrases?: unknown[] } | undefined): SoutienLevelWordPhrase[] {
  const rows: SoutienLevelWordPhrase[] = []
  const list = Array.isArray(raw?.phrases) ? raw.phrases : []
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    const o = entry as Record<string, unknown>
    const word =
      typeof o.word === 'string' && o.word.trim()
        ? o.word.trim()
        : inferFirstNoun(typeof o.sentence === 'string' ? o.sentence : '') ?? ''
    if (!word) continue

    const variantsRaw = Array.isArray(o.variants)
      ? o.variants
      : Array.isArray(o.sounds)
        ? o.sounds
        : [o]

    for (const vr of variantsRaw) {
      const variant = normalizeVariant(vr)
      if (!variant) continue
      for (const sentence of variant.sentences) {
        const number =
          variant.number ??
          inferNumberForWordPhrase(sentence, word) ??
          inferNumberForSentence(sentence)
        rows.push({
          level: variant.level,
          ...(number ? { number } : {}),
          word,
          son,
          sentence,
        })
      }
    }
  }
  return rows
}

const BY_SON = new Map<string, SoutienLevelWordPhrase[]>()
for (const [filePath, raw] of Object.entries(FILES)) {
  const fromName = filePath.replace(/^.*\//, '').replace(/\.json$/, '')
  const son =
    typeof raw?.son === 'string' && raw.son.trim() ? raw.son.trim() : fromName
  if (!son) continue
  const rows = expandFile(son, raw)
  const prev = BY_SON.get(son) ?? []
  BY_SON.set(son, prev.concat(rows))
}

let commonCache: SoutienLevelWordPhrase[] | null = null
function allFlat(): SoutienLevelWordPhrase[] {
  if (commonCache) return commonCache
  const rows: SoutienLevelWordPhrase[] = []
  const seen = new Set<string>()
  for (const list of BY_SON.values()) {
    for (const row of list) {
      const key = `${row.son}|${row.level}|${row.word.toLowerCase()}|${row.sentence}`
      if (seen.has(key)) continue
      seen.add(key)
      rows.push(row)
    }
  }
  commonCache = rows
  return rows
}

/** Phrases d’un seul son (fichier `phrases/<son>.json` uniquement). */
export function soutienPhrasesFor(bankId: string): SoutienBankPhrases | null {
  const rows = BY_SON.get(bankId)
  if (!rows || rows.length === 0) return null
  return bankBundle(rows)
}

/** Banque commune : union de tous les sons (type 10, repli). */
export function soutienPhrasesCommon(): SoutienBankPhrases {
  return bankBundle(allFlat())
}

/** Phrases plates d’un son, sinon toute la banque. */
export function soutienPhrasesForSonOrAll(
  son: string | undefined,
  level: SoutienLevelFilter | undefined,
): SoutienLevelWordPhrase[] {
  const base =
    son && BY_SON.has(son) && (BY_SON.get(son)?.length ?? 0) > 0
      ? [...(BY_SON.get(son) ?? [])]
      : allFlat()
  return filterSoutienLevel(base, level)
}

/** Toutes les phrases plates (tous sons). */
export function soutienAllFlatPhrases(
  level: SoutienLevelFilter | undefined,
): SoutienLevelPhrase[] {
  return filterSoutienLevel(allFlat(), level)
}

/** Banque type 9 + 12 : par défaut tout ; préférer `soutienPhrasesForSonOrAll`. */
export function soutienPhrasesType9And12(
  level: SoutienLevelFilter | undefined,
): SoutienLevelWordPhrase[] {
  return filterSoutienLevel(allFlat(), level)
}

/** Entrées groupées d’un son (édition / export d’un fichier). */
export function soutienPhrasesGrouped(son?: string): SoutienWordPhrases[] {
  const rows = son && BY_SON.has(son) ? (BY_SON.get(son) ?? []) : allFlat()
  const byWord = new Map<string, SoutienWordPhrases>()
  for (const row of rows) {
    if (son && row.son !== son) continue
    const key = row.word.toLowerCase()
    let entry = byWord.get(key)
    if (!entry) {
      entry = { word: row.word, variants: [] }
      byWord.set(key, entry)
    }
    let variant = entry.variants.find(
      (v) => v.level === row.level && (v.number ?? '') === (row.number ?? ''),
    )
    if (!variant) {
      variant = {
        level: row.level,
        ...(row.number ? { number: row.number } : {}),
        sentences: [],
      }
      entry.variants.push(variant)
    }
    if (!variant.sentences.includes(row.sentence)) variant.sentences.push(row.sentence)
  }
  return [...byWord.values()].sort((a, b) => a.word.localeCompare(b.word, 'fr'))
}

/** Filtre par niveau ; `all` / `undefined` → tout. */
export function filterSoutienLevel<T extends { level: SoutienPhraseLevel }>(
  rows: readonly T[],
  level: SoutienLevelFilter | undefined,
): T[] {
  if (!level || level === 'all') return [...rows]
  return rows.filter((r) => r.level === level)
}

/** Filtre par son travaillé. */
export function filterSoutienSon<T extends { son: string }>(
  rows: readonly T[],
  son: string | undefined,
): T[] {
  if (!son) return [...rows]
  return rows.filter((r) => r.son === son)
}

/** Ids de sons (fichiers présents). */
export function soutienPhraseBankIds(): string[] {
  return [...BY_SON.keys()].sort()
}

/** Sérialise un son au format fichier `phrases/<son>.json`. */
export function serializeSonFile(
  son: string,
  rows: readonly SoutienLevelWordPhrase[],
): { son: string; phrases: SoutienWordPhrases[] } {
  const forSon = rows.filter((r) => r.son === son)
  return { son, phrases: soutienPhrasesGroupedFromRows(forSon) }
}

function soutienPhrasesGroupedFromRows(
  rows: readonly SoutienLevelWordPhrase[],
): SoutienWordPhrases[] {
  const byWord = new Map<string, SoutienWordPhrases>()
  for (const row of rows) {
    const key = row.word.toLowerCase()
    let entry = byWord.get(key)
    if (!entry) {
      entry = { word: row.word, variants: [] }
      byWord.set(key, entry)
    }
    let variant = entry.variants.find(
      (v) => v.level === row.level && (v.number ?? '') === (row.number ?? ''),
    )
    if (!variant) {
      variant = {
        level: row.level,
        ...(row.number ? { number: row.number } : {}),
        sentences: [],
      }
      entry.variants.push(variant)
    }
    if (!variant.sentences.includes(row.sentence)) variant.sentences.push(row.sentence)
  }
  return [...byWord.values()].sort((a, b) => a.word.localeCompare(b.word, 'fr'))
}

/** @deprecated utiliser serializeSonFile / soutienPhrasesGrouped */
export function serializeGroupedPhrases(
  rows: readonly SoutienLevelWordPhrase[],
): Array<{ word: string; sounds: Array<SoutienPhraseVariant & { son: string }> }> {
  const byWord = new Map<
    string,
    { word: string; sounds: Array<SoutienPhraseVariant & { son: string }> }
  >()
  for (const row of rows) {
    const key = row.word.toLowerCase()
    let entry = byWord.get(key)
    if (!entry) {
      entry = { word: row.word, sounds: [] }
      byWord.set(key, entry)
    }
    let block = entry.sounds.find(
      (s) =>
        s.son === row.son &&
        s.level === row.level &&
        (s.number ?? '') === (row.number ?? ''),
    )
    if (!block) {
      block = {
        son: row.son,
        level: row.level,
        ...(row.number ? { number: row.number } : {}),
        sentences: [],
      }
      entry.sounds.push(block)
    }
    if (!block.sentences.includes(row.sentence)) block.sentences.push(row.sentence)
  }
  return [...byWord.values()].sort((a, b) => a.word.localeCompare(b.word, 'fr'))
}
