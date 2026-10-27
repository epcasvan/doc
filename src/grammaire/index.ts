/** Domaine Grammaire (théorie FALC SCAI) — hors `src/math/` et `src/francais/`. */
export { GRAMMAIRE_DOMAIN, GRAMMAIRE_TOPICS, GRAMMAIRE_EXERCISE_TYPES } from './catalog'
export { tryGenerateGrammaireBlock } from './generate'
export { isGrammaireTheoryType, isGrammaireType, isGrammaireExerciseType } from './types'
export type { GrammaireTheoryDoc } from './types'
export { GRAMMAIRE_THEORY_DOCS, theoryDocByTypeId } from './theory'
export {
  ALL_GRAM_SUBTHEMES,
  resolveGramSubthemeAll,
  subthemesForTopicAll,
  parseGramExerciseType,
  gramExerciseTypeId,
} from './exercises'
