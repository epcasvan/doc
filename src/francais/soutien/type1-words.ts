import { displayVocabLabel, isCompoundVocabLabel } from '@/francais/display-vocab-label'
import { resolveGameImageSrc } from '@/jeux/image-resolve'
import { shuffle, type Rng } from '@/math/rng'
import type { SoutienVowelBank } from './banks'
import { soutienImageFor } from './images'
import { lessonWordsByLetter } from './phoneme'

/**
 * Mot type 1 / 5 / 7 / 9 / 16 : pas de composé, image vocabulaire réelle (fichier).
 * Les types sans image (6, 8, 11, 15, 17…) utilisent `lessonWordsForText`.
 */
export function isSoutienType1Word(raw: string): boolean {
  if (!raw.trim()) return false
  if (isCompoundVocabLabel(raw)) return false
  // Index fichier (public/lib/images/vocabulaire) — ignore les chemins cassés du registre Voc.
  return Boolean(resolveGameImageSrc(raw))
}

/**
 * Tous les mots type 1 du son (lettre de la leçon) : banque + Voc.
 * Uniquement mots simples avec image.
 */
export function type1WordPool(bank: SoutienVowelBank): string[] {
  const pool = lessonWordsByLetter(bank).filter(isSoutienType1Word)
  /** Banque d’abord (ordre leçon), puis Voc. */
  const bankSet = new Set(bank.words.map((w) => w.toLowerCase()))
  const fromBank = pool.filter((w) => bankSet.has(w.toLowerCase()))
  const fromVocab = pool.filter((w) => !bankSet.has(w.toLowerCase()))
  // Slugs conservés pour image / phonème ; affichage via displayVocabLabel.
  return [...fromBank, ...fromVocab]
}

/**
 * Mots type 1 : banque + Voc filtrés (image + mot simple).
 * Avec `rng` : tirage aléatoire.
 */
export function type1Words(bank: SoutienVowelBank, rng?: Rng, count = 16): string[] {
  const want = Math.max(1, Math.min(24, Math.round(count) || 16))
  const pool = type1WordPool(bank)
  if (!rng) return pool.slice(0, want)
  return shuffle(rng, [...pool]).slice(0, Math.min(want, pool.length))
}

/** Entrées type 1 avec libellé affiché + image garantie. */
export function type1EntriesWithImages(
  bank: SoutienVowelBank,
  rng?: Rng,
  count = 16,
): Array<{ id: string; label: string; imageSrc: string }> {
  const words = type1Words(bank, rng, count)
  return words.map((raw, index) => {
    const imageSrc = resolveGameImageSrc(raw) ?? soutienImageFor(raw) ?? ''
    return {
      id: `soutien-${index}-${raw}`,
      label: displayVocabLabel(raw),
      imageSrc,
    }
  })
}
