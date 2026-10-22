import { buildAllConjBanks } from '../pools'
import { pdfBankMap } from './pdf-seed'
import type { GramBankItem } from '../types'

const CONJ = buildAllConjBanks()
const PDF = pdfBankMap()

/** Banques fusionnées (conjugaison + PDF) ; clés = typeId `gram-ex-…`. */
export const GRAM_EXERCISE_BANKS: Record<string, GramBankItem[]> = { ...CONJ }

for (const [typeId, items] of Object.entries(PDF)) {
  const existing = GRAM_EXERCISE_BANKS[typeId]
  if (existing) {
    // Dédupliquer par prompt
    const seen = new Set(existing.map((i) => i.prompt))
    for (const item of items) {
      if (!seen.has(item.prompt)) {
        existing.push(item)
        seen.add(item.prompt)
      }
    }
  } else {
    GRAM_EXERCISE_BANKS[typeId] = items
  }
}

export function bankForType(typeId: string): GramBankItem[] {
  return GRAM_EXERCISE_BANKS[typeId] ?? []
}

export function bankSize(typeId: string): number {
  return bankForType(typeId).length
}
