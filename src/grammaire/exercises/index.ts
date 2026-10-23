export { GRAM_EXERCISE_KINDS, gramKindById, type GramExerciseKindId } from './kinds'
export {
  GRAM_SUBTHEMES,
  gramExerciseTypeId,
  parseGramExerciseType,
  resolveGramSubtheme,
  subthemeById,
  subthemesForTopic,
  theorySubthemeId,
} from './subthemes'
export {
  ALL_GRAM_SUBTHEMES,
  buildGrammairePracticeTypes,
  resolveGramSubthemeAll,
  subthemesForTopicAll,
} from './catalog-exercises'
export { tryGenerateGrammaireExerciseBlock } from './generate'
export {
  bankForType,
  bankSize,
  GRAM_EXERCISE_BANKS,
  GRAM_LESSONS,
  lessonForType,
} from './bank'
export { isGrammaireExerciseType } from './types'
export type { GramBankItem, GramLesson } from './types'
