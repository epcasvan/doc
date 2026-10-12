import type { ExerciseType, Topic } from '@/math/types'

export const ACM_DOMAIN = 'acm' as const

export const ACM_TOPICS: Topic[] = [
  { id: 'acm-a-venir', label: 'ACM — à venir', domain: 'acm' },
]

/** Squelette — activités créatives et manuelles à ajouter ensuite. */
export const ACM_EXERCISE_TYPES: ExerciseType[] = [
  {
    id: 'acm-placeholder',
    topic: 'acm-a-venir',
    label: 'Contenu à venir',
    description: 'Domaine ACM — fiches à venir.',
    instruction: 'Contenu pédagogique à venir.',
    visual: 'texte',
    preferredColumns: 1,
  },
]
