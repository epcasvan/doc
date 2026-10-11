/** Helpers privés pour genKind Soutien FR. */
import { int, pick, shuffle, type Rng } from '@/math/rng'
import type { MathItem, PhraseToken } from '@/math/types'
import type { SoutienVowelBank } from './banks'
import {
  ALL_VOCAB_LABELS,
  countLessonPhonemeInText,
  lessonWordsBySound,
  wordHasLessonSound,
} from './phoneme'

/** Types 15 / 16 : 5 QR + 5 mots/images par série. */
export const AUDIO_ORDER_CLIPS = 5

export const DISTRACTOR_LETTERS = 'bcdfghjklmnpqrstvwxzBCDFGHIJKLMNPQRSTVWXZ'.split('')

export function otherWords(bank: SoutienVowelBank): string[] {
  const own = new Set(lessonWordsBySound(bank).map((w) => w.toLowerCase()))
  const fallback = [
    'chat',
    'chien',
    'soleil',
    'lune',
    'livre',
    'table',
    'porte',
    'fenêtre',
    'école',
    'maison',
    'train',
    'fleur',
    'pomme',
    'pain',
    'fromage',
    'vélo',
  ]
  const pool = ALL_VOCAB_LABELS.length > 0 ? ALL_VOCAB_LABELS : fallback
  return pool.filter((w) => !own.has(w.toLowerCase()) && !wordHasLessonSound(w, bank))
}

/** Type 2 : tableau cols×rows ; le nombre de questions = nombre de lignes (max 15). */
export function letterGrid(rng: Rng, bank: SoutienVowelBank, rowCount: number): MathItem {
  /** 8 colonnes : cercles + padding 10 px tiennent sur l’A4. */
  const cols = 8
  const rows = Math.max(1, Math.min(15, Math.round(rowCount) || 5))
  const size = cols * rows
  /** ~¼ des cases = lettre / digramme cible. */
  const targetCount = Math.max(4, Math.min(size - cols, Math.round(size * 0.24)))
  const isDigraph = bank.letterLower.length > 1
  const cells: string[] = []
  for (let i = 0; i < targetCount; i++) {
    cells.push(pick(rng, [bank.letterUpper, bank.letterLower]))
  }
  const digraphDistractors = ['ch', 'ph', 'ou', 'oi', 'an', 'in', 'on', 'au', 'gn', 'ill', 'qu', 'eu']
  while (cells.length < size) {
    if (isDigraph) {
      let d = pick(rng, digraphDistractors)
      while (d.toLowerCase() === bank.letterLower.toLowerCase()) {
        d = pick(rng, digraphDistractors)
      }
      // Mélanger maj / min
      cells.push(int(rng, 0, 1) === 0 ? d.toLocaleUpperCase('fr-FR') : d)
    } else {
      let d = pick(rng, DISTRACTOR_LETTERS)
      while (d.toLowerCase() === bank.letterLower) d = pick(rng, DISTRACTOR_LETTERS)
      cells.push(d)
    }
  }
  return {
    layout: 'letter-grid',
    prompt: `Entourez les lettres ${bank.letterUpper} ${bank.letterLower}.`,
    options: shuffle(rng, cells),
    answer: `${bank.letterUpper}${bank.letterLower}`,
    labels: [bank.letterLower],
    letterGridCols: cols,
    letterGridVariant: 'table',
  }
}

/** Type 12 : compte le phonème simple (Alpha), pas la lettre dans an/au/eau… */
export function countSoundInPhrase(phrase: string, bank: SoutienVowelBank): number {
  return countLessonPhonemeInText(phrase, bank)
}

/** Consonnes simples (pas de digrammes CH/GN/PH/QU). */
export const SYLLABLE_CONS = ['b', 'c', 'd', 'f', 'g', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z'] as const

/** Lignes par bloc pour le type 3 (script + Playwrite, même contenu). */
export function syllableBlockRows(rowCount: number): number {
  return Math.max(1, Math.min(10, Math.round(rowCount) || 3))
}

export const SYLLABLE_VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'] as const

/**
 * Syllabes type 3 :
 * - Voyelle : moitié CV (consonne + voyelle) + doubles sans nasal.
 * - Consonne / digramme : moitié grapheme+V + doubles autour du graphème.
 */
export function buildSyllableReadingList(rng: Rng, bank: SoutienVowelBank, total: number): string[] {
  const half = Math.floor(total / 2)
  const seen = new Set<string>()
  const simple: string[] = []
  const doubles: string[] = []

  const tryAdd = (bucket: string[], value: string): boolean => {
    if (seen.has(value)) return false
    seen.add(value)
    bucket.push(value)
    return true
  }

  const isVowelLesson = /^[aeiouy]$/.test(bank.id)
  if (isVowelLesson) {
    const v = bank.letterLower
    let guard = 0
    while (simple.length < half && guard < half * 40) {
      guard += 1
      const s = `${pick(rng, [...SYLLABLE_CONS])}${v}`
      if (!tryAdd(simple, s) && simple.length > 0 && guard > half * 20) {
        simple.push(s)
      }
    }
    while (simple.length < half) {
      simple.push(`${pick(rng, [...SYLLABLE_CONS])}${v}`)
    }

    guard = 0
    while (doubles.length < half && guard < half * 50) {
      guard += 1
      const kind = int(rng, 0, 2)
      let s: string
      if (kind === 0) {
        s = `${v}${pick(rng, [...SYLLABLE_CONS])}${v}`
      } else if (kind === 1) {
        const c1 = pick(rng, [...SYLLABLE_CONS])
        const c2 = pick(rng, [...SYLLABLE_CONS])
        s = /[nm]/i.test(c2) ? `${c1}${v}${c2}${v}` : `${c1}${v}${c2}`
      } else {
        const c1 = pick(rng, [...SYLLABLE_CONS])
        const c2 = pick(rng, [...SYLLABLE_CONS])
        s = `${c1}${v}${c2}${v}`
      }
      if (!tryAdd(doubles, s) && doubles.length > 0 && guard > half * 25) {
        doubles.push(s)
      }
    }
    while (doubles.length < half) {
      const c1 = pick(rng, [...SYLLABLE_CONS])
      const c2 = pick(rng, [...SYLLABLE_CONS])
      doubles.push(/[nm]/i.test(c2) ? `${c1}${v}${c2}${v}` : `${c1}${v}${c2}`)
    }
  } else {
    const g = bank.letterLower
    let guard = 0
    while (simple.length < half && guard < half * 40) {
      guard += 1
      const v = pick(rng, [...SYLLABLE_VOWELS])
      const s = `${g}${v}`
      if (!tryAdd(simple, s) && simple.length > 0 && guard > half * 20) {
        simple.push(s)
      }
    }
    while (simple.length < half) {
      simple.push(`${g}${pick(rng, [...SYLLABLE_VOWELS])}`)
    }
    guard = 0
    while (doubles.length < half && guard < half * 50) {
      guard += 1
      const v1 = pick(rng, [...SYLLABLE_VOWELS])
      const v2 = pick(rng, [...SYLLABLE_VOWELS])
      const kind = int(rng, 0, 2)
      const s =
        kind === 0 ? `${v1}${g}${v2}` : kind === 1 ? `${g}${v1}${g}` : `${g}${v1}${g}${v2}`
      if (!tryAdd(doubles, s) && doubles.length > 0 && guard > half * 25) {
        doubles.push(s)
      }
    }
    while (doubles.length < half) {
      const v = pick(rng, [...SYLLABLE_VOWELS])
      doubles.push(`${g}${v}${g}`)
    }
  }

  return shuffle(rng, [...simple.slice(0, half), ...doubles.slice(0, half)])
}

/** Assemble les jetons (apostrophe collée, ponctuation déjà sur le mot). */
export function joinSoutienOrder(tokens: PhraseToken[]): string {
  let out = ''
  for (const token of tokens) {
    if (!out) {
      out = token.text
      continue
    }
    if (out.endsWith("'") || out.endsWith('’')) out += token.text
    else if (token.text === '?' || token.text === '!') out += token.text
    else out += ` ${token.text}`
  }
  return out
}

