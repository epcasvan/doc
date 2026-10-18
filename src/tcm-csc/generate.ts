import type { MathItem, PageConfig } from '@/math/types'
import { generateTpmInformations } from '@/tpm/informations'
import { isTcmCscConsignesType } from './test'
import { isTcmCscType } from './types'

/** Placeholder déterministe (pas de tirage). */
export function tryGenerateTcmCscBlock(
  config: PageConfig,
): { instruction: string; items: MathItem[] } | null {
  if (!isTcmCscType(config.exerciseType)) return null
  if (isTcmCscConsignesType(config.exerciseType)) {
    return {
      instruction: 'Lisez les consignes avant de commencer le test.',
      items: generateTpmInformations('tcm-csc', 0),
    }
  }
  return {
    instruction: 'Contenu pédagogique à venir.',
    items: [
      {
        layout: 'text',
        prompt: 'Le domaine TCM CSC sera bientôt disponible.',
        answer: '',
      },
    ],
  }
}
