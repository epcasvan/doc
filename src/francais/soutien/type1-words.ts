import { shuffle, type Rng } from '@/math/rng'
import type { SoutienVowelBank } from './banks'
import { soutienImageFor } from './images'
import { lessonWordsByLetter } from './phoneme'

/**
 * Tous les mots type 1 du son (lettre de la leçon) : banque + Voc.
 * Utilisé en mode libre pour proposer des remplacements au-delà des 16 défauts.
 */
export function type1WordPool(bank: SoutienVowelBank): string[] {
  const pool = lessonWordsByLetter(bank)
  const withImg: string[] = []
  const without: string[] = []
  for (const w of pool) {
    if (soutienImageFor(w)) withImg.push(w)
    else without.push(w)
  }
  /** Banque d’abord (ordre leçon), puis Voc avec image, puis le reste. */
  const bankSet = new Set(bank.words.map((w) => w.toLowerCase()))
  const fromBank = pool.filter((w) => bankSet.has(w.toLowerCase()))
  const fromVocabImg = withImg.filter((w) => !bankSet.has(w.toLowerCase()))
  const fromVocabRest = without.filter((w) => !bankSet.has(w.toLowerCase()))
  // Slugs conservés pour image / phonème ; affichage via displayVocabLabel.
  return [...fromBank, ...fromVocabImg, ...fromVocabRest]
}

/**
 * Mots type 1 : banque + Voc filtrés par la lettre de la leçon.
 * Avec `rng` : tirage aléatoire (priorité aux mots avec image).
 */
export function type1Words(bank: SoutienVowelBank, rng?: Rng, count = 16): string[] {
  const want = Math.max(1, Math.min(24, Math.round(count) || 16))
  const pool = type1WordPool(bank)
  const withImg = pool.filter((w) => Boolean(soutienImageFor(w)))
  const source = withImg.length >= want ? withImg : pool
  if (!rng) return source.slice(0, want)
  return shuffle(rng, [...source]).slice(0, Math.min(want, source.length))
}
