import { createRng, int, pick, shuffle, type Rng } from '@/math/rng'
import type { MathItem, PageConfig } from '@/math/types'
import {
  isLogiqueType,
  LOGIQUE_LAYOUT,
  type LogiqueCell,
  type LogiqueFill,
  type LogiquePuzzle,
  type LogiqueRot,
  type LogiqueShapeKind,
} from './types'

const SHAPES: LogiqueShapeKind[] = ['circle', 'square', 'triangle', 'diamond', 'plus', 'arrow']
const FILLS: LogiqueFill[] = ['empty', 'solid', 'hatched']
const ROTS: LogiqueRot[] = [0, 90, 180, 270]

function cell(
  kind: LogiqueShapeKind,
  fill: LogiqueFill = 'solid',
  rot: LogiqueRot = 0,
): LogiqueCell {
  return { kind, fill, rot }
}

function sameCell(a: LogiqueCell, b: LogiqueCell): boolean {
  return a.kind === b.kind && (a.fill ?? 'solid') === (b.fill ?? 'solid') && (a.rot ?? 0) === (b.rot ?? 0)
}

function labelOf(i: number): string {
  return String.fromCharCode(65 + i)
}

function item(prompt: string, puzzle: LogiquePuzzle, answer: string): MathItem {
  return {
    layout: LOGIQUE_LAYOUT,
    prompt,
    answer,
    logique: puzzle,
  }
}

function distractors(rng: Rng, correct: LogiqueCell, n: number): LogiqueCell[] {
  const out: LogiqueCell[] = []
  let guard = 0
  while (out.length < n && guard < 80) {
    guard += 1
    const c = cell(pick(rng, SHAPES), pick(rng, FILLS), pick(rng, ROTS))
    if (sameCell(c, correct)) continue
    if (out.some((x) => sameCell(x, c))) continue
    out.push(c)
  }
  while (out.length < n) out.push(cell('circle', 'empty', 0))
  return out
}

function withChoices(rng: Rng, correct: LogiqueCell, count = 3): {
  choices: LogiqueCell[]
  labels: string[]
  correctIndex: number
  answer: string
} {
  const others = distractors(rng, correct, count - 1)
  const mixed = shuffle(rng, [correct, ...others])
  const correctIndex = mixed.findIndex((c) => sameCell(c, correct))
  const labels = mixed.map((_, i) => labelOf(i))
  return { choices: mixed, labels, correctIndex, answer: labels[correctIndex]! }
}

function genSuite(rng: Rng): MathItem {
  const kind = pick(rng, ['rotate', 'fill', 'shape'] as const)
  const stem: LogiqueCell[] = []
  let correct: LogiqueCell
  if (kind === 'rotate') {
    const base = pick(rng, SHAPES.filter((s) => s !== 'circle'))
    const fill = pick(rng, FILLS)
    const start = pick(rng, ROTS)
    for (let i = 0; i < 4; i++) {
      stem.push(cell(base, fill, ((start + i * 90) % 360) as LogiqueRot))
    }
    correct = cell(base, fill, ((start + 4 * 90) % 360) as LogiqueRot)
  } else if (kind === 'fill') {
    const base = pick(rng, SHAPES)
    const cycle = shuffle(rng, [...FILLS]).slice(0, 3)
    for (let i = 0; i < 4; i++) stem.push(cell(base, cycle[i % cycle.length]!))
    correct = cell(base, cycle[4 % cycle.length]!)
  } else {
    const cycle = shuffle(rng, [...SHAPES]).slice(0, 3)
    const fill = pick(rng, FILLS)
    for (let i = 0; i < 4; i++) stem.push(cell(cycle[i % cycle.length]!, fill))
    correct = cell(cycle[4 % cycle.length]!, fill)
  }
  const q = withChoices(rng, correct)
  return item('Quelle forme continue la suite ?', {
    mode: 'suite',
    stem,
    choices: q.choices,
    choiceLabels: q.labels,
    correctIndex: q.correctIndex,
  }, q.answer)
}

function genIntrus(rng: Rng): MathItem {
  const rule = pick(rng, ['fill', 'rot', 'kind'] as const)
  const stem: LogiqueCell[] = []
  let oddIndex = 0
  if (rule === 'fill') {
    const kind = pick(rng, SHAPES)
    const fill = pick(rng, FILLS)
    const oddFill = pick(rng, FILLS.filter((f) => f !== fill))
    oddIndex = int(rng, 0, 4)
    for (let i = 0; i < 5; i++) {
      stem.push(cell(kind, i === oddIndex ? oddFill : fill, pick(rng, [0, 90] as LogiqueRot[])))
    }
  } else if (rule === 'rot') {
    const kind = pick(rng, SHAPES.filter((s) => s === 'arrow' || s === 'triangle' || s === 'plus'))
    const fill = pick(rng, FILLS)
    const rot = pick(rng, ROTS)
    const oddRot = pick(rng, ROTS.filter((r) => r !== rot))
    oddIndex = int(rng, 0, 4)
    for (let i = 0; i < 5; i++) stem.push(cell(kind, fill, i === oddIndex ? oddRot : rot))
  } else {
    const fill = pick(rng, FILLS)
    const kind = pick(rng, SHAPES)
    const oddKind = pick(rng, SHAPES.filter((s) => s !== kind))
    oddIndex = int(rng, 0, 4)
    for (let i = 0; i < 5; i++) stem.push(cell(i === oddIndex ? oddKind : kind, fill))
  }
  return item('Coloriez l’intrus.', {
    mode: 'intrus',
    stem,
    correctIndex: oddIndex,
  }, String(oddIndex + 1))
}

function genRotation(rng: Rng): MathItem {
  const kind = pick(rng, SHAPES.filter((s) => s !== 'circle'))
  const fill = pick(rng, FILLS)
  const model = cell(kind, fill, pick(rng, ROTS))
  const forced = cell(kind, fill, pick(rng, ROTS))
  const others = distractors(rng, forced, 3).map((c) =>
    c.kind === kind && (c.fill ?? 'solid') === fill
      ? cell(pick(rng, SHAPES.filter((s) => s !== kind)), fill, c.rot ?? 0)
      : c,
  )
  const mixed = shuffle(rng, [forced, ...others])
  const correctIndex = mixed.findIndex((c) => c.kind === kind && (c.fill ?? 'solid') === fill)
  const labels = mixed.map((_, i) => labelOf(i))
  return item('Coloriez la même forme que le modèle.', {
    mode: 'rotation',
    stem: [model],
    choices: mixed,
    choiceLabels: labels,
    correctIndex,
  }, labels[correctIndex]!)
}

function genMatrice(rng: Rng): MathItem {
  const size = pick(rng, [2, 3] as const)
  const rowKinds = shuffle(rng, [...SHAPES]).slice(0, size)
  const colFills = shuffle(rng, [...FILLS]).slice(0, size)
  const stem: LogiqueCell[] = []
  const missing = { r: int(rng, 0, size - 1), c: int(rng, 0, size - 1) }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r === missing.r && c === missing.c) {
        stem.push({ kind: 'square', blank: true })
      } else {
        stem.push(cell(rowKinds[r]!, colFills[c]!))
      }
    }
  }
  const correct = cell(rowKinds[missing.r]!, colFills[missing.c]!)
  const q = withChoices(rng, correct, 4)
  return item('Quelle forme complète la grille ?', {
    mode: 'matrice',
    stem,
    stemCols: size,
    choices: q.choices,
    choiceLabels: q.labels,
    correctIndex: q.correctIndex,
  }, q.answer)
}

function genAssemblage(rng: Rng): MathItem {
  // Two pieces side by side → target is both kinds; choices are pairs of stacked icons via compound cells
  const a = cell(pick(rng, SHAPES), pick(rng, FILLS))
  let b = cell(pick(rng, SHAPES), pick(rng, FILLS))
  while (sameCell(a, b)) b = cell(pick(rng, SHAPES), pick(rng, FILLS))
  const stem = [a, b]
  // Correct "assemblage" shown as a diamond+label style: we encode as a cell that matches first kind with second fill (simple rule)
  const correct = cell(a.kind, b.fill ?? 'solid', 0)
  const wrong1 = cell(b.kind, a.fill ?? 'solid', 0)
  const wrong2 = cell(a.kind, a.fill ?? 'solid', 90)
  const wrong3 = cell(b.kind, b.fill ?? 'solid', 180)
  const mixed = shuffle(rng, [correct, wrong1, wrong2, wrong3])
  const correctIndex = mixed.findIndex((c) => sameCell(c, correct))
  const labels = mixed.map((_, i) => labelOf(i))
  return item('Entourez l’assemblage qui correspond aux deux pièces.', {
    mode: 'assemblage',
    stem,
    stemCols: 2,
    choices: mixed,
    choiceLabels: labels,
    correctIndex,
  }, labels[correctIndex]!)
}

function genSuperposition(rng: Rng): MathItem {
  const top = cell(pick(rng, ['circle', 'square', 'diamond'] as LogiqueShapeKind[]), 'empty')
  const bottom = cell(pick(rng, ['triangle', 'plus', 'arrow'] as LogiqueShapeKind[]), 'solid')
  // Result convention: keep bottom kind, empty fill (outline of both → hatched as "merged")
  const correct = cell(bottom.kind, 'hatched', 0)
  const q = withChoices(rng, correct, 4)
  return item('Quelle figure obtient-on en superposant les deux formes ?', {
    mode: 'superposition',
    stem: [top, bottom],
    stemCols: 2,
    choices: q.choices,
    choiceLabels: q.labels,
    correctIndex: q.correctIndex,
  }, q.answer)
}

function genCube(rng: Rng, difficulty: PageConfig['difficulty']): MathItem {
  const n = difficulty === 'facile' ? int(rng, 2, 3) : difficulty === 'avance' ? int(rng, 3, 5) : int(rng, 2, 4)
  const stacks: number[] = []
  for (let i = 0; i < n; i++) stacks.push(int(rng, 1, difficulty === 'facile' ? 3 : 5))
  const total = stacks.reduce((s, h) => s + h, 0)
  const mode = pick(rng, ['count', 'missing', 'remove'] as const)
  if (mode === 'count') {
    return item('Combien faut-il de cubes pour faire cette forme ?', {
      mode: 'cube',
      stem: [],
      cubeStacks: stacks,
      cubePrompt: 'count',
    }, String(total))
  }
  if (mode === 'remove') {
    const removed = int(rng, 1, Math.max(1, total - 1))
    return item(`On enlève ${removed} cube${removed > 1 ? 's' : ''}. Combien en reste-t-il ?`, {
      mode: 'cube',
      stem: [],
      cubeStacks: stacks,
      cubePrompt: 'remove',
    }, String(total - removed))
  }
  const target = total + int(rng, 2, difficulty === 'facile' ? 4 : 8)
  return item(`Combien de cubes faut-il ajouter pour arriver à ${target} cubes ?`, {
    mode: 'cube',
    stem: [],
    cubeStacks: stacks,
    cubePrompt: 'missing',
  }, String(target - total))
}

function buildOne(rng: Rng, typeId: string, difficulty: PageConfig['difficulty']): MathItem {
  switch (typeId) {
    case 'logique-suite-graphique':
      return genSuite(rng)
    case 'logique-intrus':
      return genIntrus(rng)
    case 'logique-rotation':
      return genRotation(rng)
    case 'logique-matrice':
      return genMatrice(rng)
    case 'logique-assemblage':
      return genAssemblage(rng)
    case 'logique-superposition':
      return genSuperposition(rng)
    case 'logique-cube':
      return genCube(rng, difficulty)
    default:
      return genSuite(rng)
  }
}

const DEFAULT_COUNT: Record<string, number> = {
  'logique-suite-graphique': 6,
  'logique-intrus': 6,
  'logique-rotation': 5,
  'logique-matrice': 4,
  'logique-assemblage': 4,
  'logique-superposition': 5,
  'logique-cube': 6,
}

export function tryGenerateLogiqueBlock(
  config: PageConfig,
  seed: number,
): { instruction: string; items: MathItem[] } | null {
  if (!isLogiqueType(config.exerciseType)) return null
  const rng = createRng(seed)
  const n = Math.max(1, Math.min(config.count || DEFAULT_COUNT[config.exerciseType] || 5, 10))
  const items = Array.from({ length: n }, () => buildOne(rng, config.exerciseType, config.difficulty))
  const instructionByType: Record<string, string> = {
    'logique-suite-graphique': 'Entourez la forme qui continue la suite.',
    'logique-intrus': 'Coloriez l’intrus.',
    'logique-rotation': 'Coloriez la forme identique au modèle (même après rotation).',
    'logique-matrice': 'Entourez la forme qui complète la grille.',
    'logique-assemblage': 'Entourez l’assemblage correct.',
    'logique-superposition': 'Entourez la bonne figure.',
    'logique-cube': 'Répondez à chaque question sur les cubes.',
  }
  return {
    instruction: instructionByType[config.exerciseType] ?? 'Répondez aux exercices.',
    items,
  }
}
