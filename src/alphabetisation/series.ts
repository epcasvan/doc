/**
 * Séries Alphabétisation — Générer prépare toutes les fiches du son / de la leçon.
 */
import type { ExerciseBlock, PageConfig } from '@/math/types'
import type { AlphaKindId } from './kinds'
import { alphaThemeById } from './themes'

const DOMAIN = 'alphabetisation' as const

function block(
  bankId: string,
  themeId: string,
  kind: AlphaKindId,
  count: number,
  columns = 1,
): ExerciseBlock {
  return {
    topic: themeId,
    exerciseType: `alpha-${bankId}-${kind}`,
    difficulty: 'moyen',
    count,
    columns,
  }
}

function page(
  bankId: string,
  themeId: string,
  kind: AlphaKindId,
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

/** Fiche lettre / son — 9 pages (types 1 à 15). */
export function buildAlphaLetterSeriesPages(bankId: string, themeId: string): PageConfig[] {
  const b = (kind: AlphaKindId, count: number, columns = 1) =>
    block(bankId, themeId, kind, count, columns)
  return [
    page(bankId, themeId, 'mots', 6, 3),
    page(bankId, themeId, 'lettres-maj', 5, 1, [b('lettres-min', 5)]),
    page(bankId, themeId, 'souligner-maj', 10, 1, [b('souligner-min', 10)]),
    page(bankId, themeId, 'ecouter', 9, 3, [b('ecouter-image', 15, 5)]),
    page(bankId, themeId, 'syllabe-son-qr', 18, 3),
    page(bankId, themeId, 'syllabe-son', 18, 3),
    page(bankId, themeId, 'syllabes-cv', 5, 5, [b('syllabes-long', 5, 5)]),
    page(bankId, themeId, 'syllabes-prononcer', 7, 1, [b('associer-syllabe', 2)]),
    page(bankId, themeId, 'associer-audio', 2, 1, [b('associer-image', 2)]),
  ]
}

export function buildAlphaSyllableSeriesPages(bankId: string, themeId: string): PageConfig[] {
  return [
    page(bankId, themeId, 'lire-grille', 4),
    page(bankId, themeId, 'lire-cursive', 4),
    page(bankId, themeId, 'entourer', 5),
    page(bankId, themeId, 'former', 8),
    page(bankId, themeId, 'dictee-mots', 8),
  ]
}

export function buildAlphaMotsSeriesPages(bankId: string, themeId: string): PageConfig[] {
  return [
    page(bankId, themeId, 'lire-grille', 4),
    page(bankId, themeId, 'lire-cursive', 4),
    page(bankId, themeId, 'entourer', 6),
    page(bankId, themeId, 'classer', 8),
    page(bankId, themeId, 'former', 8),
    page(bankId, themeId, 'dictee-mots', 8),
  ]
}

export function buildAlphaPhrasesSeriesPages(bankId: string, themeId: string): PageConfig[] {
  return [
    page(bankId, themeId, 'lire-phrases', 1),
    page(bankId, themeId, 'ordre-phrases', 5),
    page(bankId, themeId, 'entourer', 6),
    page(bankId, themeId, 'dictee-mots', 6),
  ]
}

export function buildAlphaAlphabetSeriesPages(themeId: string): PageConfig[] {
  const bankId = 'alphabet'
  return [
    page(bankId, themeId, 'alphabet-ordre', 6),
    page(bankId, themeId, 'alphabet-suivant', 8),
    page(bankId, themeId, 'alphabet-initiale', 6),
  ]
}

/** Choisit la série selon le thème / bankId. */
export function buildAlphaSeriesPages(bankId: string, themeId: string): PageConfig[] {
  const theme = alphaThemeById(themeId)
  if (!theme) return buildAlphaLetterSeriesPages(bankId, themeId)
  if (theme.id === 'alpha-alphabet' || bankId === 'alphabet') {
    return buildAlphaAlphabetSeriesPages(themeId)
  }
  if (theme.id === 'alpha-syllabes' || bankId.startsWith('syll-')) {
    return buildAlphaSyllableSeriesPages(bankId, themeId)
  }
  if (theme.id === 'alpha-mots' || bankId.startsWith('mots-')) {
    return buildAlphaMotsSeriesPages(bankId, themeId)
  }
  if (theme.id === 'alpha-phrases' || bankId.startsWith('phrase-')) {
    return buildAlphaPhrasesSeriesPages(bankId, themeId)
  }
  return buildAlphaLetterSeriesPages(bankId, themeId)
}
