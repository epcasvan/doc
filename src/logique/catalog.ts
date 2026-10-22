import type { ExerciseType, Topic } from '@/math/types'
import { LOGIQUE_DOMAIN } from './types'

export { LOGIQUE_DOMAIN }

export const LOGIQUE_TOPICS: Topic[] = [
  { id: 'logique-simple', label: 'Logique simple', domain: 'logique' },
  { id: 'logique-complexe', label: 'Logique complexe', domain: 'logique' },
]

function t(
  id: string,
  topic: string,
  label: string,
  description: string,
  instruction: string,
  preferredColumns = 1,
): ExerciseType {
  return {
    id,
    topic,
    label,
    description,
    instruction,
    visual: 'geo',
    preferredColumns,
  }
}

export const LOGIQUE_EXERCISE_TYPES: ExerciseType[] = [
  t(
    'logique-suite-graphique',
    'logique-simple',
    'Suite graphique',
    'Compléter une suite de formes selon une règle visuelle.',
    'Cochez la forme qui continue la suite.',
  ),
  t(
    'logique-suite-logique',
    'logique-simple',
    'Suite logique',
    'Compléter une suite selon une règle (nombres, symboles, figures).',
    'Complétez ou cochez la suite logique.',
  ),
  t(
    'logique-suite-formes',
    'logique-simple',
    'Suite de formes',
    'Continuer une suite de formes géométriques.',
    'Cochez la forme qui continue la suite.',
  ),
  t(
    'logique-intrus',
    'logique-simple',
    'Trouver l’intrus',
    'Repérer la forme qui ne suit pas la même règle que les autres.',
    'Cochez l’intrus.',
  ),
  t(
    'logique-rotation',
    'logique-simple',
    'Rotation',
    'Retrouver la même forme après une rotation.',
    'Cochez la forme identique au modèle (même après rotation).',
  ),
  t(
    'logique-matrice',
    'logique-complexe',
    'Matrice',
    'Compléter une case manquante dans une grille selon les lignes et colonnes.',
    'Cochez la forme qui complète la grille.',
  ),
  t(
    'logique-assemblage',
    'logique-complexe',
    'Assemblage',
    'Choisir l’assemblage qui correspond aux pièces données.',
    'Cochez l’assemblage correct.',
  ),
  t(
    'logique-superposition',
    'logique-complexe',
    'Superposition',
    'Imaginer le résultat de deux formes superposées, ou la pièce manquante.',
    'Cochez la bonne figure.',
  ),
  t(
    'logique-cube',
    'logique-complexe',
    'Cube',
    'Compter des cubes empilés, ou calculer combien il en manque.',
    'Répondez à chaque question sur les cubes.',
  ),
]
