import { createRng, int, shuffle } from '@/math/rng'
import type { MathItem, PageConfig } from '@/math/types'
import { gramKindById } from './kinds'
import { parseGramExerciseType } from './subthemes'
import { bankForType, lessonForType } from './bank'
import { isGrammaireExerciseType } from './types'

function toItem(
  kindLayout: 'qcm' | 'fill' | 'write',
  prompt: string,
  answer: string,
  options: string[] | undefined,
  seed: number,
  audioSrc?: string,
): MathItem {
  const audio = audioSrc ? { audioSrc } : {}
  if (kindLayout === 'qcm' && options?.length) {
    const rng = createRng(seed)
    const correct = answer
    const shuffled = shuffle(rng, [...options])
    // Garantir que la bonne réponse est dans les options
    if (!shuffled.includes(correct)) shuffled[0] = correct
    return {
      layout: 'select',
      selectVariant: 'oral',
      prompt,
      answer: correct,
      options: shuffled,
      labels: [correct],
      ...audio,
    }
  }
  return {
    layout: 'text',
    prompt,
    answer,
    ...audio,
  }
}

/** Génère un bloc d’exercices grammaire (déterministe). */
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

  const bank = bankForType(typeId)
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

  const rng = createRng(seed)
  const count = Math.min(Math.max(1, config.count), bank.length)
  const order = shuffle(
    rng,
    bank.map((_, i) => i),
  ).slice(0, count)

  const items = order.map((bi, qi) => {
    const row = bank[bi]!
    return toItem(
      kind.layout,
      row.prompt,
      row.answer,
      row.options,
      (seed + qi * 17 + bi) >>> 0,
      row.audioSrc,
    )
  })

  return {
    instruction: lessonForType(typeId)?.instruction ?? kind.instruction,
    items,
    bankQuestionCap: bank.length,
  }
}

/** Tirage déterministe d’un index de banque (tests / debug). */
export function sampleBankIndex(seed: number, size: number): number {
  if (size <= 0) return 0
  return int(createRng(seed), 0, size - 1)
}
