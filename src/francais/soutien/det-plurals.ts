/**
 * Type 10 — déterminants définis à partir des mots du type 5.
 *
 * Cherche les phrases dans la banque commune types 9 + 12.
 * Seul le déterminant du mot type 5 est un trait ; les autres restent écrits.
 * Sur 8 : ≥ 5 singulier, ≥ 2 pluriel, le reste aléatoire.
 * Repli : modèles courts si la banque ne suffit pas.
 */
import { displayVocabLabel } from '@/francais/display-vocab-label'
import { int, pick, shuffle, type Rng } from '@/math/rng'
import {
  findDetBeforeNoun,
  numberFromDet,
  type SoutienPhraseNumber,
} from './phrase-number'
import type { SoutienDetPart, SoutienLevelPhrase } from './phrases-data'

export type DetNumber = 'singular' | 'plural'

export type Type10DetRow = {
  parts: Array<{ blank: string } | { t: string }>
  sentence: string
  number: DetNumber
}

/** Pluriel scolaire simple. */
export function pluralizeFrNoun(raw: string): string {
  const word = displayVocabLabel(raw).trim()
  if (!word) return word
  const lower = word.toLocaleLowerCase('fr-FR')
  if (/[sxz]$/i.test(lower)) return word
  if (/al$/i.test(lower) && lower.length > 3) {
    return `${word.slice(0, -2)}aux`
  }
  if (/(eau|au|eu)$/i.test(lower)) return `${word}x`
  return `${word}s`
}

function startsWithVowelSound(word: string): boolean {
  const w = word
    .trim()
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  return /^[aeiouy]/.test(w)
}

/** Article défini singulier (Le / La / L’) depuis Un / Une du type 5. */
export function definiteSingularArticle(
  word: string,
  indef: 'Un' | 'Une' | string = 'Un',
): string {
  const label = displayVocabLabel(word)
  if (startsWithVowelSound(label)) return 'L’'
  const gender = indef.toLocaleLowerCase('fr-FR').startsWith('une') ? 'Une' : 'Un'
  return gender === 'Une' ? 'La' : 'Le'
}

/** Singulier : repli si aucune phrase banque. */
const SINGULAR_TEMPLATES: ReadonlyArray<(noun: string, art: string) => string> = [
  (n, a) => `${a} ${n} est sur la table.`,
  (n, a) => `${a} ${n} est dans le jardin.`,
  (n, a) => `${a} ${n} est près de la porte.`,
  (n, a) => `${a} ${n} est dans la boîte.`,
  (n, a) => `${a} ${n} est sous la chaise.`,
  (n, a) => `${a} ${n} est dans le sac.`,
  (n, a) => `${a} ${n} est sur le banc.`,
  (n, a) => `${a} ${n} est devant l’école.`,
]

const PLURAL_TEMPLATES: ReadonlyArray<(noun: string) => string> = [
  (n) => `Les ${n} sont sur la table.`,
  (n) => `Les ${n} sont dans le jardin.`,
  (n) => `Les ${n} sont près de la porte.`,
  (n) => `Les ${n} sont dans la boîte.`,
  (n) => `Les ${n} sont sous la chaise.`,
  (n) => `Les ${n} sont dans le sac.`,
  (n) => `Les ${n} sont sur le banc.`,
  (n) => `Les ${n} sont devant l’école.`,
]

function splitBlankAt(
  sentence: string,
  blank: string,
  index: number,
): Type10DetRow['parts'] {
  const before = sentence.slice(0, index)
  const after = sentence.slice(index + blank.length)
  const parts: SoutienDetPart[] = []
  if (before) parts.push({ t: before })
  parts.push({ blank })
  if (after) parts.push({ t: after })
  return parts as Type10DetRow['parts']
}

function splitBlank(sentence: string, answer: string): Type10DetRow['parts'] {
  const idx = sentence.indexOf(answer)
  if (idx < 0) return [{ blank: answer }, { t: ` ${sentence}` }]
  return splitBlankAt(sentence, answer, idx)
}

/** Convertit un/une/des → le/la/l’/les (casse conservée si majuscule). */
function toDefiniteDet(
  rawDet: string,
  word: string,
  indef: string,
  number: SoutienPhraseNumber,
): string {
  const upper = rawDet[0] !== rawDet[0]?.toLocaleLowerCase('fr-FR')
  if (number === 'plur') {
    return upper ? 'Les' : 'les'
  }
  const art = definiteSingularArticle(word, indef)
  if (!upper) {
    if (art === 'L’') return 'l’'
    return art.toLocaleLowerCase('fr-FR')
  }
  return art
}

export function buildSingularDetForWord(
  word: string,
  indef: 'Un' | 'Une' | string,
  rng: Rng,
): Type10DetRow {
  const noun = displayVocabLabel(word).toLocaleLowerCase('fr-FR')
  const art = definiteSingularArticle(word, indef)
  const sentence = pick(rng, [...SINGULAR_TEMPLATES])(noun, art)
  return {
    parts: splitBlank(sentence, art),
    sentence,
    number: 'singular',
  }
}

export function buildPluralDetForWord(word: string, rng: Rng): Type10DetRow {
  const plural = pluralizeFrNoun(word).toLocaleLowerCase('fr-FR')
  const sentence = pick(rng, [...PLURAL_TEMPLATES])(plural)
  return {
    parts: splitBlank(sentence, 'Les'),
    sentence,
    number: 'plural',
  }
}

/**
 * Répartition pour `want` questions :
 * - au moins 2 pluriels (si want ≥ 2)
 * - au moins 5 singuliers (si want ≥ 7 ; sinon autant que possible)
 * - le reste aléatoire
 */
export function type10NumberCounts(want: number, rng: Rng): { singular: number; plural: number } {
  const n = Math.max(0, want)
  if (n === 0) return { singular: 0, plural: 0 }
  const minPlural = Math.min(2, n)
  const minSingular = Math.min(5, Math.max(0, n - minPlural))
  let singular = minSingular
  let plural = minPlural
  let rest = n - singular - plural
  while (rest > 0) {
    if (int(rng, 0, 1) === 0) singular += 1
    else plural += 1
    rest -= 1
  }
  return { singular, plural }
}

export type Type10Word = { word: string; article?: string }

/** Transforme une phrase banque en ligne type 10 pour un mot type 5. */
export function type10RowFromBankPhrase(
  sentence: string,
  word: string,
  indef: string = 'Un',
): Type10DetRow | null {
  const hit = findDetBeforeNoun(sentence, word)
  if (!hit) return null
  const numTag = numberFromDet(hit.det, hit.nounForm, word)
  const blank = toDefiniteDet(hit.det, word, indef, numTag)
  const before = sentence.slice(0, hit.index)
  const afterNoun = sentence.slice(hit.end).replace(/^\s+/, '')
  // L’/l’ collé au nom ; sinon un espace.
  const joiner = /^l['’]$/i.test(blank) ? '' : ' '
  const full = `${before}${blank}${joiner}${afterNoun}`
  const blankIndex = before.length
  return {
    parts: splitBlankAt(full, blank, blankIndex),
    sentence: full,
    number: numTag === 'plur' ? 'plural' : 'singular',
  }
}

function collectBankHits(
  words: readonly Type10Word[],
  phrases: readonly SoutienLevelPhrase[],
): { singular: Type10DetRow[]; plural: Type10DetRow[] } {
  const singular: Type10DetRow[] = []
  const plural: Type10DetRow[] = []
  const seen = new Set<string>()

  for (const w of words) {
    const indef = w.article ?? 'Un'
    for (const phrase of phrases) {
      const row = type10RowFromBankPhrase(phrase.sentence, w.word, indef)
      if (!row) continue
      const tagged = phrase.number
      if (tagged === 'plur' && row.number !== 'plural') continue
      if (tagged === 'sing' && row.number !== 'singular') continue
      const sig = `${row.number}|${row.sentence}`
      if (seen.has(sig)) continue
      seen.add(sig)
      if (row.number === 'plural') plural.push(row)
      else singular.push(row)
    }
  }
  return { singular, plural }
}

/**
 * Construit les phrases type 10 :
 * mots type 5 → phrases banque 9+12 → trait sur le déterminant du mot.
 */
export function buildType10DetsFromWords(
  words: readonly Type10Word[],
  rng: Rng,
  want: number,
  bankPhrases: readonly SoutienLevelPhrase[] = [],
): Type10DetRow[] {
  const seenWords = new Set<string>()
  const unique: Type10Word[] = []
  for (const row of words) {
    const key = displayVocabLabel(row.word).toLowerCase()
    if (!key || seenWords.has(key)) continue
    seenWords.add(key)
    unique.push({ word: displayVocabLabel(row.word), article: row.article })
  }
  if (unique.length === 0 || want <= 0) return []

  const { singular: needS, plural: needP } = type10NumberCounts(want, rng)
  const { singular: bankS, plural: bankP } = collectBankHits(unique, bankPhrases)
  const poolS = shuffle(rng, bankS)
  const poolP = shuffle(rng, bankP)
  const rows: Type10DetRow[] = []
  const usedSentences = new Set<string>()

  const takeBank = (pool: Type10DetRow[], n: number) => {
    for (const hit of pool) {
      if (rows.length >= want) break
      if (n <= 0) break
      if (usedSentences.has(hit.sentence)) continue
      usedSentences.add(hit.sentence)
      rows.push(hit)
      n -= 1
    }
    return n
  }

  let leftS = takeBank(poolS, needS)
  let leftP = takeBank(poolP, needP)

  const wordPool = shuffle(rng, unique)
  let wi = 0
  while (leftS > 0) {
    const w = wordPool[wi % wordPool.length]!
    wi += 1
    const row = buildSingularDetForWord(w.word, w.article ?? 'Un', rng)
    if (usedSentences.has(row.sentence)) continue
    usedSentences.add(row.sentence)
    rows.push(row)
    leftS -= 1
  }
  while (leftP > 0) {
    const w = wordPool[wi % wordPool.length]!
    wi += 1
    const row = buildPluralDetForWord(w.word, rng)
    if (usedSentences.has(row.sentence)) continue
    usedSentences.add(row.sentence)
    rows.push(row)
    leftP -= 1
  }

  return shuffle(rng, rows).slice(0, want)
}

/** @deprecated utiliser buildType10DetsFromWords */
export function buildPluralDetsFromWords(
  words: readonly string[],
  rng: Rng,
  want: number,
): Type10DetRow[] {
  return buildType10DetsFromWords(
    words.map((word) => ({ word })),
    rng,
    want,
  )
}
