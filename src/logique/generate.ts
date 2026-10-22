import { createRng, shuffle, type Rng } from '@/math/rng'
import type { MathItem, PageConfig } from '@/math/types'
import bankJson from './bank.json' with { type: 'json' }
import { isLogiqueType, LOGIQUE_LAYOUT, type LogiqueMode, type LogiquePuzzle } from './types'

type BankEntry = {
  id: string
  stem: string[]
  choices: string[]
  correctIndex: number
  answerLine: boolean
}

const BANK = bankJson as Record<string, BankEntry[]>

function modeOf(typeId: string): LogiqueMode {
  if (typeId === 'logique-intrus') return 'intrus'
  if (typeId === 'logique-rotation') return 'rotation'
  if (typeId === 'logique-matrice') return 'matrice'
  if (typeId === 'logique-assemblage') return 'assemblage'
  if (typeId === 'logique-superposition') return 'superposition'
  if (typeId === 'logique-cube') return 'cube'
  return 'suite'
}

function labelOf(i: number): string {
  return String.fromCharCode(65 + i)
}

/** Mélange les images-réponses et recalcule l’index du bon choix. */
function toItem(entry: BankEntry, mode: LogiqueMode, rng: Rng): MathItem {
  const rawChoices = entry.choices ?? []
  const answerLine = entry.answerLine || rawChoices.length === 0
  const correctSrc =
    rawChoices.length > 0
      ? rawChoices[Math.max(0, Math.min(entry.correctIndex ?? 0, rawChoices.length - 1))]
      : undefined
  const choices = rawChoices.length > 1 ? shuffle(rng, [...rawChoices]) : [...rawChoices]
  const labels = choices.map((_, i) => labelOf(i))
  const correctIndex =
    answerLine || correctSrc == null
      ? undefined
      : Math.max(0, choices.indexOf(correctSrc))
  const puzzle: LogiquePuzzle = {
    mode,
    stem: entry.stem ?? [],
    choices,
    choiceLabels: labels,
    correctIndex,
    answerLine,
  }
  return {
    layout: LOGIQUE_LAYOUT,
    prompt: '',
    answer: answerLine ? '…' : labels[correctIndex ?? 0] ?? 'A',
    logique: puzzle,
  }
}

const DEFAULT_COUNT: Record<string, number> = {
  'logique-suite-graphique': 6,
  'logique-suite-logique': 4,
  'logique-suite-formes': 2,
  'logique-intrus': 6,
  'logique-rotation': 5,
  'logique-matrice': 4,
  'logique-assemblage': 4,
  'logique-superposition': 5,
  'logique-cube': 6,
}

const INSTRUCTION: Record<string, string> = {
  'logique-suite-graphique': 'Cochez la forme qui continue la suite.',
  'logique-suite-logique': 'Complétez ou cochez la suite logique.',
  'logique-suite-formes': 'Cochez la forme qui continue la suite.',
  'logique-intrus': 'Cochez l’intrus.',
  'logique-rotation': 'Cochez la forme identique au modèle (même après rotation).',
  'logique-matrice': 'Cochez la forme qui complète la grille.',
  'logique-assemblage': 'Cochez l’assemblage correct.',
  'logique-superposition': 'Cochez la bonne figure.',
  'logique-cube': 'Répondez à chaque question sur les cubes.',
}

export function tryGenerateLogiqueBlock(
  config: PageConfig,
  seed: number,
): { instruction: string; items: MathItem[] } | null {
  if (!isLogiqueType(config.exerciseType)) return null
  const pool = BANK[config.exerciseType] ?? []
  if (!pool.length) {
    return {
      instruction: INSTRUCTION[config.exerciseType] ?? 'Répondez aux exercices.',
      items: [],
    }
  }
  const rng = createRng(seed)
  const max = Math.min(pool.length, 12)
  const n = Math.max(1, Math.min(config.count || DEFAULT_COUNT[config.exerciseType] || 5, max))
  const picked = shuffle(rng, [...pool]).slice(0, n)
  const mode = modeOf(config.exerciseType)
  return {
    instruction: INSTRUCTION[config.exerciseType] ?? 'Répondez aux exercices.',
    items: picked.map((entry) => toItem(entry, mode, rng)),
  }
}
