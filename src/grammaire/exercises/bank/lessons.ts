import type { GramLesson } from '../types'
import { GRAM_LESSONS_CORE } from './lessons-core'
import { GRAM_LESSONS_REST } from './lessons-rest'
import { GRAM_LESSONS_WORD_DECRIRE } from './lessons-word-decrire'
import { GRAM_LESSONS_WORD_HEURES } from './lessons-word-heures'
import { GRAM_LESSONS_WORD_JOURS } from './lessons-word-jours'
import { GRAM_LESSONS_WORD_MOIS } from './lessons-word-mois'
import { GRAM_LESSONS_WORD_PRESENTER } from './lessons-word-presenter'
import { GRAM_LESSONS_WORD_SUITE } from './lessons-word-suite'
import { GRAM_LESSONS_WORD_A1 } from './word-a1'
import { GRAM_LESSONS_WORD_A2 } from './word-a2'

/** Sous-thèmes déjà repris mot à mot (banques relues). On n’empile pas l’extraction brute. */
const CURATED_SUB_IDS = new Set([
  'a1',
  'a2',
  'a6',
  'a7',
  'identite',
  'famille',
  'situation-familiale',
  'description-physique',
])

function extraWordLessons(rows: GramLesson[]): GramLesson[] {
  return rows
    .filter((row) => !CURATED_SUB_IDS.has(row.subId))
    .map((row) => ({
      ...row,
      items: row.items.filter((item) => {
        const answer = item.answer.trim()
        return answer.length > 0 && answer !== '…' && answer !== '...'
      }),
    }))
    .filter((row) => row.items.length > 0)
}

/** Word relu d’abord ; ClairFLE complète ; extraction brute des deux manuels ensuite. */
export const GRAM_LESSONS: GramLesson[] = [
  ...GRAM_LESSONS_WORD_PRESENTER,
  ...GRAM_LESSONS_WORD_DECRIRE,
  ...GRAM_LESSONS_WORD_SUITE,
  ...GRAM_LESSONS_WORD_JOURS,
  ...GRAM_LESSONS_WORD_MOIS,
  ...GRAM_LESSONS_WORD_HEURES,
  ...GRAM_LESSONS_CORE,
  ...GRAM_LESSONS_REST,
  ...extraWordLessons(GRAM_LESSONS_WORD_A1),
  ...extraWordLessons(GRAM_LESSONS_WORD_A2),
]
