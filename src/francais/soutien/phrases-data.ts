/**
 * Phrases didactiques Soutien FR (types 9 / 10 / 12 / 14).
 *
 * Fichier unique `./phrases.json` :
 * `{ word, sounds: [{ son, level, number?, sentences: string[] }] }`
 * — un mot, plusieurs sons, plusieurs phrases par son.
 */

import phrasesFile from './phrases.json'
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

/** Bloc son + phrases (dans le JSON). */
export type SoutienSoundBlock = {
  son: string
  level: SoutienPhraseLevel
  number?: SoutienPhraseNumber
  sentences: string[]
}

/** Entrée banque : un mot, un ou plusieurs sons. */
export type SoutienWordPhrases = {
  word: string
  sounds: SoutienSoundBlock[]
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
  /** Vivier unique (ex-type 9 + 12). */
  phrases: SoutienLevelWordPhrase[]
  /** @deprecated alias de `phrases` */
  type9: SoutienLevelWordPhrase[]
  type10: SoutienLevelDetPhrase[]
  /** @deprecated alias de `phrases` */
  type12: SoutienLevelWordPhrase[]
  type14: SoutienLevelWordPhrase[]
}

function isLevel(v: unknown): v is SoutienPhraseLevel {
  return v === 'a1' || v === 'a2' || v === 'b1'
}

function normalizeSoundBlock(raw: unknown, fallbackSon: string): SoutienSoundBlock | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const son = typeof o.son === 'string' && o.son.trim() ? o.son.trim() : fallbackSon
  if (!son) return null
  const level = (isLevel(o.level) ? o.level : 'a2') as SoutienPhraseLevel
  const number = parsePhraseNumber(o.number)
  const sentencesRaw = o.sentences
  const sentences: string[] = []
  if (Array.isArray(sentencesRaw)) {
    for (const s of sentencesRaw) {
      if (typeof s === 'string' && s.trim()) sentences.push(s.trim())
      else if (s && typeof s === 'object' && typeof (s as { text?: unknown }).text === 'string') {
        const t = String((s as { text: string }).text).trim()
        if (t) sentences.push(t)
      }
    }
  }
  // Rétrocompat : une seule `sentence`
  if (sentences.length === 0 && typeof o.sentence === 'string' && o.sentence.trim()) {
    sentences.push(o.sentence.trim())
  }
  if (sentences.length === 0) return null
  return {
    son,
    level,
    ...(number ? { number } : {}),
    sentences,
  }
}

function normalizeWordEntry(raw: unknown): SoutienWordPhrases | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const word =
    typeof o.word === 'string' && o.word.trim()
      ? o.word.trim()
      : typeof o.sentence === 'string'
        ? inferFirstNoun(o.sentence) ?? ''
        : ''
  if (!word) return null

  const sounds: SoutienSoundBlock[] = []
  if (Array.isArray(o.sounds)) {
    for (const block of o.sounds) {
      const n = normalizeSoundBlock(block, '')
      if (n) sounds.push(n)
    }
  } else {
    // Rétrocompat ligne plate : { word, son, level, number, sentence(s) }
    const n = normalizeSoundBlock(o, typeof o.son === 'string' ? o.son : '')
    if (n) sounds.push(n)
  }
  if (sounds.length === 0) return null
  return { word, sounds }
}

function expandWordEntry(entry: SoutienWordPhrases): SoutienLevelWordPhrase[] {
  const rows: SoutienLevelWordPhrase[] = []
  for (const block of entry.sounds) {
    for (const sentence of block.sentences) {
      const number =
        block.number ??
        inferNumberForWordPhrase(sentence, entry.word) ??
        inferNumberForSentence(sentence)
      rows.push({
        level: block.level,
        ...(number ? { number } : {}),
        word: entry.word,
        son: block.son,
        sentence,
      })
    }
  }
  return rows
}

function loadGroupedPhrases(): SoutienWordPhrases[] {
  const root = phrasesFile as { phrases?: unknown } | unknown[]
  const list = Array.isArray(root)
    ? root
    : Array.isArray((root as { phrases?: unknown }).phrases)
      ? (root as { phrases: unknown[] }).phrases
      : []
  const out: SoutienWordPhrases[] = []
  for (const raw of list) {
    const n = normalizeWordEntry(raw)
    if (n) out.push(n)
  }
  return out
}

const GROUPED = loadGroupedPhrases()

const ALL_FLAT: SoutienLevelWordPhrase[] = (() => {
  const rows: SoutienLevelWordPhrase[] = []
  const seen = new Set<string>()
  for (const entry of GROUPED) {
    for (const row of expandWordEntry(entry)) {
      const key = `${row.son}|${row.level}|${row.word.toLowerCase()}|${row.sentence}`
      if (seen.has(key)) continue
      seen.add(key)
      rows.push(row)
    }
  }
  return rows
})()

function bankBundle(rows: SoutienLevelWordPhrase[]): SoutienBankPhrases {
  return {
    phrases: rows,
    type9: rows,
    type10: [],
    type12: rows,
    type14: rows,
  }
}

const BY_SON = new Map<string, SoutienBankPhrases>()
for (const row of ALL_FLAT) {
  const cur = BY_SON.get(row.son)
  if (cur) {
    cur.phrases.push(row)
  } else {
    BY_SON.set(row.son, bankBundle([row]))
  }
}
// Re-alias type9/12/14 arrays to same phrases ref per son
for (const [son, bundle] of BY_SON) {
  BY_SON.set(son, bankBundle([...bundle.phrases]))
}

const COMMON = bankBundle(ALL_FLAT)

/** Entrées groupées (édition / export). */
export function soutienPhrasesGrouped(): readonly SoutienWordPhrases[] {
  return GROUPED
}

/** Phrases d’un son / banque (filtre `son`). */
export function soutienPhrasesFor(bankId: string): SoutienBankPhrases | null {
  return BY_SON.get(bankId) ?? null
}

/** Banque commune : toutes les phrases (tous sons). */
export function soutienPhrasesCommon(): SoutienBankPhrases {
  return COMMON
}

/** Toutes les phrases plates pour types 12 / 14 / 10. */
export function soutienAllFlatPhrases(
  level: SoutienLevelFilter | undefined,
): SoutienLevelPhrase[] {
  return filterSoutienLevel(ALL_FLAT, level)
}

/** Banque commune type 9 + 12 (même vivier). */
export function soutienPhrasesType9And12(
  level: SoutienLevelFilter | undefined,
): SoutienLevelWordPhrase[] {
  return filterSoutienLevel(ALL_FLAT, level)
}

/** Filtre par niveau ; `all` / `undefined` → tout. */
export function filterSoutienLevel<T extends { level: SoutienPhraseLevel }>(
  rows: readonly T[],
  level: SoutienLevelFilter | undefined,
): T[] {
  if (!level || level === 'all') return [...rows]
  return rows.filter((r) => r.level === level)
}

/** Filtre optionnel par son travaillé. */
export function filterSoutienSon<T extends { son: string }>(
  rows: readonly T[],
  son: string | undefined,
): T[] {
  if (!son) return [...rows]
  return rows.filter((r) => r.son === son)
}

/** Ids de sons présents dans la banque. */
export function soutienPhraseBankIds(): string[] {
  return [...BY_SON.keys()].sort()
}

/** Sérialise au format groupé (word → sounds → sentences). */
export function serializeGroupedPhrases(
  rows: readonly SoutienLevelWordPhrase[],
): SoutienWordPhrases[] {
  const byWord = new Map<string, SoutienWordPhrases>()
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
