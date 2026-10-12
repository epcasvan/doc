/**
 * Type 10 — phrases au pluriel (déterminant défini « les »)
 * à partir des mots du type 5 de la fiche.
 */
import { displayVocabLabel } from '@/francais/display-vocab-label'
import { pick, shuffle, type Rng } from '@/math/rng'
import type { SoutienDetPart } from './phrases-data'

/** Pluriel scolaire simple (noms courants Voc / lecture). */
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

const PLURAL_TEMPLATES: ReadonlyArray<(plural: string) => string> = [
  (p) => `Les ${p} sont sur la table.`,
  (p) => `Les ${p} sont dans le jardin.`,
  (p) => `Les ${p} sont près de la porte.`,
  (p) => `Les ${p} sont dans la boîte.`,
  (p) => `Les ${p} sont sous la chaise.`,
  (p) => `Les ${p} sont dans le sac.`,
  (p) => `Les ${p} sont sur le banc.`,
  (p) => `Les ${p} sont devant l’école.`,
]

export type PluralDetRow = {
  parts: Array<{ blank: string } | { t: string }>
  sentence: string
}

/** Construit une phrase plurielle avec trou « Les » pour un mot du type 5. */
export function buildPluralDetForWord(word: string, rng: Rng): PluralDetRow {
  const plural = pluralizeFrNoun(word).toLocaleLowerCase('fr-FR')
  const sentence = pick(rng, [...PLURAL_TEMPLATES])(plural)
  const parts: SoutienDetPart[] = [{ blank: 'Les' }, { t: sentence.slice(3) }]
  return { parts: parts as PluralDetRow['parts'], sentence }
}

/** Une phrase par mot (ordre mélangé), pour le type 10. */
export function buildPluralDetsFromWords(
  words: readonly string[],
  rng: Rng,
  want: number,
): PluralDetRow[] {
  const seen = new Set<string>()
  const unique: string[] = []
  for (const w of words) {
    const key = displayVocabLabel(w).toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(displayVocabLabel(w))
  }
  return shuffle(rng, unique)
    .slice(0, want)
    .map((w) => buildPluralDetForWord(w, rng))
}
