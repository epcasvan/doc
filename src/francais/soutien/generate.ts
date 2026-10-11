import { type Rng } from '@/math/rng'
import type { Difficulty } from '@/math/types'
import { soutienBankById } from './banks'
import { parseSoutienType } from './kinds'
import { genKind } from './gen-kind'
import type { SoutienBatch, SoutienGenerateOptions } from './generate-options'

export type {
  SoutienBatch,
  SoutienCompleterEntry,
  SoutienGenerateOptions,
} from './generate-options'
export { type1WordPool, type1Words } from './type1-words'

export function tryGenerateSoutienBatch(
  exerciseType: string,
  count: number,
  rng: Rng,
  difficulty: Difficulty = 'moyen',
  options?: SoutienGenerateOptions,
): SoutienBatch | null {
  const parsed = parseSoutienType(exerciseType)
  if (!parsed) return null
  const bank = soutienBankById(parsed.bankId)
  if (!bank) return null
  const batch = genKind(parsed.kind, bank, count, rng, difficulty, options)
  // Consigne une seule fois (en-tête d’exercice) — pas de prompt sous chaque item.
  return {
    ...batch,
    items: batch.items.map((item) => ({ ...item, prompt: undefined })),
  }
}
