import type { Layout } from '@/math/types'

export const LOGIQUE_DOMAIN = 'logique' as const

export function isLogiqueType(typeId: string): boolean {
  return typeId.startsWith('logique-')
}

export type LogiqueShapeKind = 'circle' | 'square' | 'triangle' | 'diamond' | 'plus' | 'arrow'
export type LogiqueFill = 'empty' | 'solid' | 'hatched'
export type LogiqueRot = 0 | 90 | 180 | 270

/** Une case / forme d’un puzzle logique (SVG). */
export type LogiqueCell = {
  kind: LogiqueShapeKind
  fill?: LogiqueFill
  rot?: LogiqueRot
  /** Case vide (matrice à compléter). */
  blank?: boolean
}

export type LogiqueMode =
  | 'suite'
  | 'intrus'
  | 'rotation'
  | 'matrice'
  | 'assemblage'
  | 'superposition'
  | 'cube'

/** Données de rendu d’un exercice logique. */
export type LogiquePuzzle = {
  mode: LogiqueMode
  /** Suite, modèle, cases de matrice (ligne par ligne), ou pièces. */
  stem: LogiqueCell[]
  /** Nombre de colonnes pour la grille stem (matrice, assemblage). */
  stemCols?: number
  /** Choix à entourer / colorier (A, B, C…). */
  choices?: LogiqueCell[]
  choiceLabels?: string[]
  /** Index du bon choix (0-based), si QCM. */
  correctIndex?: number
  /**
   * Cube : hauteur de chaque pile vue de face (gauche → droite),
   * ou nombre total pour le corrigé numérique.
   */
  cubeStacks?: number[]
  cubePrompt?: 'count' | 'missing' | 'remove'
}

export const LOGIQUE_LAYOUT: Layout = 'logique'
