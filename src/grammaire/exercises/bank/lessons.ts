import type { GramLesson } from '../types'
import { GRAM_LESSONS_CORE } from './lessons-core'
import { GRAM_LESSONS_REST } from './lessons-rest'

export const GRAM_LESSONS: GramLesson[] = [...GRAM_LESSONS_CORE, ...GRAM_LESSONS_REST]
