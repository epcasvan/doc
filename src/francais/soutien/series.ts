/**
 * Série complète Soutien FR (comme un test TCF) :
 * Générer prépare les 12 fiches du son sélectionné.
 */
import type { ExerciseBlock, PageConfig } from '@/math/types'
import type { SoutienKindId } from './kinds'
import { soutienExerciseTypeId, type SoutienLetterOption } from './themes'

const DOMAIN = 'soutien-fr' as const

function block(
  bankId: string,
  themeId: string,
  kind: SoutienKindId,
  count: number,
  columns = 1,
): ExerciseBlock {
  return {
    topic: themeId,
    exerciseType: soutienExerciseTypeId(bankId, kind),
    difficulty: 'moyen',
    count,
    columns,
  }
}

function page(
  bankId: string,
  themeId: string,
  kind: SoutienKindId,
  count: number,
  columns = 1,
  extra?: ExerciseBlock[],
): PageConfig {
  const first = block(bankId, themeId, kind, count, columns)
  return {
    domain: DOMAIN,
    ...first,
    extraBlocks: extra?.length ? extra : undefined,
  }
}

/** Titre de fiche : « Lettre A et le son /a/ » ou « Lettre C et les sons /s/ et /k/ ». */
export function soutienFicheTitle(letter: SoutienLetterOption): string {
  const sounds = letter.sounds.map((s) => s.label)
  if (sounds.length <= 1) {
    return `Lettre ${letter.letterUpper} et le son ${sounds[0] ?? ''}`
  }
  if (sounds.length === 2) {
    return `Lettre ${letter.letterUpper} et les sons ${sounds[0]} et ${sounds[1]}`
  }
  const head = sounds.slice(0, -1).join(', ')
  return `Lettre ${letter.letterUpper} et les sons ${head} et ${sounds[sounds.length - 1]}`
}

/**
 * 12 pages A4 pour un son (bankId) :
 * 1 mots · 2 lettres+syllabes · 3 relier+compléter · 4 écouter+images ·
 * 5 syllabe-son · 6 phrases · 7 déterminants+dictée · 8 compter ·
 * 9 ordre · 10 lire · 11 classer mots×2 + images×1 · 12 mots mêlés.
 */
export function buildSoutienSeriesPages(bankId: string, themeId: string): PageConfig[] {
  const b = (kind: SoutienKindId, count: number, columns = 1) =>
    block(bankId, themeId, kind, count, columns)

  return [
    page(bankId, themeId, 'mots', 16),
    page(bankId, themeId, 'lettres', 5, 1, [b('syllabes', 3)]),
    page(bankId, themeId, 'relier', 12, 2, [b('completer', 12, 2)]),
    page(bankId, themeId, 'ecouter', 9, 3, [b('ecouter-image', 15, 5)]),
    page(bankId, themeId, 'syllabe-son', 18, 3),
    page(bankId, themeId, 'lettres-phrase', 9),
    page(bankId, themeId, 'determinants', 9, 1, [b('dictee', 8)]),
    page(bankId, themeId, 'compter', 8),
    page(bankId, themeId, 'ordre', 9),
    page(bankId, themeId, 'lire', 20),
    page(bankId, themeId, 'associer-audio', 2, 1, [b('associer-image', 1)]),
    page(bankId, themeId, 'mots-meles', 12),
  ]
}
