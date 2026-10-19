import type { MathItem, PageConfig } from '@/math/types'
import { tryGenerateSuisseBlock } from './suisse'
import { isSocieteType } from './types'

/** Fiches Société. La Suisse est un contenu fixe (pas de tirage). */
export function tryGenerateSocieteBlock(
  config: PageConfig,
): { instruction: string; items: MathItem[] } | null {
  if (!isSocieteType(config.exerciseType)) return null
  const built = tryGenerateSuisseBlock(config.exerciseType)
  if (!built) return null
  return { instruction: built.instruction, items: built.items }
}
