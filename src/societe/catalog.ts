import type { ExerciseType, Topic } from '@/math/types'
import { SUISSE_EXERCISE_TYPES, SUISSE_TOPIC_ID } from './suisse'

export const SOCIETE_DOMAIN = 'société' as const

export const SOCIETE_TOPICS: Topic[] = [
  { id: SUISSE_TOPIC_ID, label: 'La Suisse', domain: 'société' },
]

export const SOCIETE_EXERCISE_TYPES: ExerciseType[] = SUISSE_EXERCISE_TYPES
