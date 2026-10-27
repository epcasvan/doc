import { createRng, int, shuffle } from '@/math/rng'
import type { MathItem, PageConfig } from '@/math/types'
import { tcfExerciseItems } from '@/tcf/generate'
import { gramKindById } from './kinds'
import {
  instructionForSingleVerb,
  normalizeGramBank,
  stripParenVerb,
  uniqueSampleVerb,
} from './normalize-items'
import { parseGramExerciseType } from './subthemes'
import { bankForType, lessonForType } from './bank'
import { gramItemsToTcfExercise } from './to-tcf'
import { isGrammaireExerciseType } from './types'

/** Génère un bloc d’exercices grammaire (déterministe), rendu TCF. */
export function tryGenerateGrammaireExerciseBlock(
  config: PageConfig,
  seed: number,
): { instruction: string; items: MathItem[]; bankQuestionCap?: number } | null {
  const typeId = config.exerciseType
  if (!isGrammaireExerciseType(typeId)) return null
  const parsed = parseGramExerciseType(typeId)
  if (!parsed) return null
  const kind = gramKindById(parsed.kindId)
  if (!kind) return null

  const rng = createRng(seed)
  if (config.tcfExercise) {
    const ex = config.tcfExercise
    return {
      instruction: ex.consigne?.trim() || kind.instruction,
      items: tcfExerciseItems(ex, rng, config.tcfFormModes).map((item) => ({
        ...item,
        tcfExerciseId: ex.id,
      })),
      bankQuestionCap: Math.max(ex.questions.length, 1),
    }
  }

  const rawBank = bankForType(typeId)
  const bank = normalizeGramBank(rawBank)
  if (!bank.length) {
    return {
      instruction: kind.instruction,
      items: [
        {
          layout: 'text',
          prompt: 'Banque d’exercices à compléter pour ce type.',
          answer: '',
        },
      ],
      bankQuestionCap: 0,
    }
  }

  const count = Math.min(Math.max(1, config.count), bank.length)
  const order = shuffle(
    rng,
    bank.map((_, i) => i),
  ).slice(0, count)
  const sampled = order.map((index) => bank[index]!)

  const lesson = lessonForType(typeId)
  let instruction = lesson?.instruction ?? kind.instruction
  const singleVerb = uniqueSampleVerb(sampled)
  const items = singleVerb
    ? sampled.map((item) => ({ ...item, prompt: stripParenVerb(item.prompt) }))
    : sampled
  if (singleVerb) instruction = instructionForSingleVerb(instruction, singleVerb)

  const exercise = gramItemsToTcfExercise({
    typeId,
    instruction,
    items,
    kindId: parsed.kindId,
  })

  return {
    instruction,
    items: tcfExerciseItems(exercise, rng, config.tcfFormModes).map((item) => ({
      ...item,
      tcfExerciseId: exercise.id,
    })),
    bankQuestionCap: bank.length,
  }
}

/** Tirage déterministe d’un index de banque (tests / debug). */
export function sampleBankIndex(seed: number, size: number): number {
  if (size <= 0) return 0
  return int(createRng(seed), 0, size - 1)
}
