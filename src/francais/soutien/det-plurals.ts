/**
 * Type 10 — phrases à trous (déterminant défini) à partir des mots du type 5.
 *
 * Seul le déterminant du mot issu du type 5 est un trait ; les autres
 * déterminants de la phrase sont écrits en toutes lettres.
 *
 * Sur 8 questions : ≥ 5 singulier, ≥ 2 pluriel, le reste aléatoire.
 */
import { displayVocabLabel } from '@/francais/display-vocab-label'
import { int, pick, shuffle, type Rng } from '@/math/rng'
import type { SoutienDetPart } from './phrases-data'

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

/** Singulier : le trait porte uniquement sur le déterminant du mot type 5. */
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

function splitBlank(sentence: string, answer: string): Type10DetRow['parts'] {
  const idx = sentence.indexOf(answer)
  if (idx < 0) {
    return [{ blank: answer }, { t: ` ${sentence}` }]
  }
  const before = sentence.slice(0, idx)
  const after = sentence.slice(idx + answer.length)
  const parts: SoutienDetPart[] = []
  if (before) parts.push({ t: before })
  parts.push({ blank: answer })
  if (after) parts.push({ t: after })
  return parts as Type10DetRow['parts']
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

/** Construit les phrases type 10 (quotas singulier / pluriel). */
export function buildType10DetsFromWords(
  words: readonly Type10Word[],
  rng: Rng,
  want: number,
): Type10DetRow[] {
  const seen = new Set<string>()
  const unique: Type10Word[] = []
  for (const row of words) {
    const key = displayVocabLabel(row.word).toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push({ word: displayVocabLabel(row.word), article: row.article })
  }
  if (unique.length === 0 || want <= 0) return []

  const { singular: needS, plural: needP } = type10NumberCounts(want, rng)
  const pool = shuffle(rng, unique)
  const rows: Type10DetRow[] = []

  for (let i = 0; i < needS; i++) {
    const w = pool[i % pool.length]!
    rows.push(buildSingularDetForWord(w.word, w.article ?? 'Un', rng))
  }
  for (let i = 0; i < needP; i++) {
    const w = pool[(i + needS) % pool.length]!
    rows.push(buildPluralDetForWord(w.word, rng))
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
