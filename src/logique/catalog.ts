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
    id: 'logique-intrus',
    label: 'Trouver l’intrus',
    description: 'Repérer la forme qui ne suit pas la même règle que les autres.',
    instruction: 'Cochez l’intrus.',
    preferredColumns: 1,
  },
  {
    id: 'logique-rotation',
    label: 'Rotation',
    description: 'Retrouver la même forme après une rotation.',
    instruction: 'Cochez la forme identique au modèle (même après rotation).',
    preferredColumns: 1,
  },
  {
    id: 'logique-matrice',
    label: 'Matrice',
    description: 'Compléter une case manquante dans une grille selon les lignes et colonnes.',
    instruction: 'Cochez la forme qui complète la grille.',
    preferredColumns: 1,
  },
  {
    id: 'logique-assemblage',
    label: 'Assemblage',
    description: 'Choisir l’assemblage qui correspond aux pièces données.',
    instruction: 'Cochez l’assemblage correct.',
    preferredColumns: 1,
  },
  {
    id: 'logique-case-manquante',
    label: 'Case manquante',
    description: 'Retrouver la case manquante d’une grille de superposition.',
    instruction: 'Cochez la figure qui complète la grille.',
    preferredColumns: 1,
  },
  {
    id: 'logique-case-intrus',
    label: 'Case intrus',
    description: 'Repérer la case qui ne suit pas la règle de superposition.',
    instruction: 'Coloriez la case intrus.',
    preferredColumns: 1,
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
