import type { ExerciseType, Topic } from '@/math/types'
import { LOGIQUE_DOMAIN } from './types'

export { LOGIQUE_DOMAIN }

type LogiqueKind = {
  id: string
  label: string
  description: string
  instruction: string
  preferredColumns?: number
}

const KINDS: LogiqueKind[] = [
  {
    id: 'logique-suite-graphique',
    label: 'Suite graphique',
    description: 'Compléter une suite de formes selon une règle visuelle.',
    instruction: 'Cochez la forme qui continue la suite.',
  },
  {
    id: 'logique-suite-logique',
    label: 'Suite logique',
    description: 'Compléter une suite selon une règle (nombres, symboles, figures).',
    instruction: 'Complétez ou cochez la suite logique.',
  },
  {
    id: 'logique-suite-formes',
    label: 'Suite de formes',
    description: 'Continuer une suite de formes géométriques.',
    instruction: 'Cochez la forme qui continue la suite.',
  },
  {
    id: 'logique-intrus',
    label: 'Trouver l’intrus',
    description: 'Repérer la forme qui ne suit pas la même règle que les autres.',
    instruction: 'Cochez l’intrus.',
  },
  {
    id: 'logique-rotation',
    label: 'Rotation',
    description: 'Retrouver la même forme après une rotation.',
    instruction: 'Cochez la forme identique au modèle (même après rotation).',
  },
  {
    id: 'logique-matrice',
    label: 'Matrice',
    description: 'Compléter une case manquante dans une grille selon les lignes et colonnes.',
    instruction: 'Cochez la forme qui complète la grille.',
  },
  {
    id: 'logique-assemblage',
    label: 'Assemblage',
    description: 'Choisir l’assemblage qui correspond aux pièces données.',
    instruction: 'Cochez l’assemblage correct.',
  },
  {
    id: 'logique-superposition',
    label: 'Superposition',
    description: 'Imaginer le résultat de deux formes superposées, ou la pièce manquante.',
    instruction: 'Cochez la bonne figure.',
  },
  {
    id: 'logique-cube',
    label: 'Cube',
    description: 'Compter des cubes empilés, ou calculer combien il en manque.',
    instruction: 'Répondez à chaque question sur les cubes.',
  },
]

/** Un thème = un type d’exercice (pas de distinction simple / complexe). */
export const LOGIQUE_TOPICS: Topic[] = KINDS.map((k) => ({
  id: k.id,
  label: k.label,
  domain: 'logique' as const,
}))

export const LOGIQUE_EXERCISE_TYPES: ExerciseType[] = KINDS.map((k) => ({
  id: k.id,
  topic: k.id,
  label: k.label,
  description: k.description,
  instruction: k.instruction,
  visual: 'geo' as const,
  preferredColumns: k.preferredColumns ?? 1,
}))
