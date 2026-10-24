import type { GramLesson } from '../types'
import { GRAM_LESSONS_CORE } from './lessons-core'
import { GRAM_LESSONS_REST } from './lessons-rest'
import { GRAM_LESSONS_SOUTIEN } from './lessons-soutien'
import { GRAM_LESSONS_WORD_DECRIRE } from './lessons-word-decrire'
import { GRAM_LESSONS_WORD_EVAL03 } from './lessons-word-eval03'
import { GRAM_LESSONS_WORD_HEURES } from './lessons-word-heures'
import { GRAM_LESSONS_WORD_LOGEMENT } from './lessons-word-logement'
import { GRAM_LESSONS_WORD_MAISON } from './lessons-word-maison'
import { GRAM_LESSONS_WORD_INVITATION } from './lessons-word-invitation'
import { GRAM_LESSONS_WORD_JOURS } from './lessons-word-jours'
import { GRAM_LESSONS_WORD_NEGATION } from './lessons-word-negation'
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
  'famille',
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

/** Word relu d’abord ; ClairFLE complète ; extraction brute ; banques soutien-scolaire en dernier. */
export const GRAM_LESSONS: GramLesson[] = [
  ...GRAM_LESSONS_WORD_PRESENTER,
  ...GRAM_LESSONS_WORD_DECRIRE,
  ...GRAM_LESSONS_WORD_SUITE,
  ...GRAM_LESSONS_WORD_JOURS,
  ...GRAM_LESSONS_WORD_MOIS,
  ...GRAM_LESSONS_WORD_HEURES,
  ...GRAM_LESSONS_WORD_INVITATION,
  ...GRAM_LESSONS_WORD_NEGATION,
  ...GRAM_LESSONS_WORD_EVAL03,
  ...GRAM_LESSONS_WORD_LOGEMENT,
  ...GRAM_LESSONS_WORD_MAISON,
  ...GRAM_LESSONS_CORE,
  ...GRAM_LESSONS_REST,
  ...extraWordLessons(GRAM_LESSONS_WORD_A1),
  ...extraWordLessons(GRAM_LESSONS_WORD_A2),
  ...GRAM_LESSONS_SOUTIEN,
]
