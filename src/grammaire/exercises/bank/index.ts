import { gramExerciseTypeId } from '../subthemes'
import type { GramBankItem, GramLesson } from '../types'
import { GRAM_LESSONS } from './lessons'

export { GRAM_LESSONS }

function mergeLessons(rows: GramLesson[]): GramLesson[] {
  const map = new Map<string, GramLesson>()
  for (const row of rows) {
    const key = `${row.subId}|${row.kindId}`
    const prev = map.get(key)
    if (!prev) {
      map.set(key, { ...row, items: [...row.items] })
      continue
    }
    const seen = new Set(prev.items.map((item) => item.prompt))
    for (const item of row.items) {
      if (seen.has(item.prompt)) continue
      prev.items.push(item)
      seen.add(item.prompt)
    }
  }
  return [...map.values()]
}

const MERGED = mergeLessons(GRAM_LESSONS)

export const GRAM_LESSON_BY_TYPE: Record<string, GramLesson> = Object.fromEntries(
  MERGED.map((row) => [gramExerciseTypeId(row.subId, row.kindId), row]),
)

export function lessonForType(typeId: string): GramLesson | undefined {
  return GRAM_LESSON_BY_TYPE[typeId]
}

export function bankForType(typeId: string): GramBankItem[] {
  return lessonForType(typeId)?.items ?? []
}

export function bankSize(typeId: string): number {
  return bankForType(typeId).length
}

/** Accès plat typeId → items (compatibilité). */
export const GRAM_EXERCISE_BANKS: Record<string, GramBankItem[]> = Object.fromEntries(
  Object.entries(GRAM_LESSON_BY_TYPE).map(([id, row]) => [id, row.items]),
)
