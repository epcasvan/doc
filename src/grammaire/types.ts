import type { GrammarTheoryBlock } from '@/francais/grammar-theory'

export type GrammaireTheoryDoc = {
  id: string
  typeId: string
  /** Index dans le thème (1-based). */
  index: number
  title: string
  topic: string
  public: string
  objectif: string
  blocks: GrammarTheoryBlock[]
}

/** Type d’exercice théorie du domaine grammaire. */
export function isGrammaireTheoryType(typeId: string): boolean {
  return /^gram-[a-z0-9]+-theorie$/.test(typeId)
}

/** Type d’exercice (théorie ou pratique) du domaine. */
export function isGrammaireType(typeId: string): boolean {
  return typeId.startsWith('gram-')
}

export { isGrammaireExerciseType } from './exercises/types'
