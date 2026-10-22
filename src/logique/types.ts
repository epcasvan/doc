import type { Layout } from '@/math/types'

export const LOGIQUE_DOMAIN = 'logique' as const

export function isLogiqueType(typeId: string): boolean {
  return typeId.startsWith('logique-')
}

export type LogiqueMode =
  | 'suite'
  | 'intrus'
  | 'rotation'
  | 'matrice'
  | 'assemblage'
  | 'superposition'
  | 'cube'

/** Données de rendu d’un exercice logique (images de la banque Word). */
export type LogiquePuzzle = {
  mode: LogiqueMode
  /** Images de l’énoncé (suite, modèle, grille…). */
  stem: string[]
  /** Options à cocher (chemins publics). */
  choices: string[]
  choiceLabels?: string[]
  /** Index du bon choix (0-based), si connu. */
  correctIndex?: number
  /** Pas de QCM : ligne de réponse. */
  answerLine?: boolean
}

export const LOGIQUE_LAYOUT: Layout = 'logique'
