import { fmt } from './column-arith'
import type { NumberRange } from './difficulty'
import { int, type Rng } from './rng'
import type { DecomposeCalc, DecomposeTerm, Difficulty, MathItem } from './types'

function chain(terms: DecomposeTerm[]): string {
  return terms
    .map((term, index) => (index === 0 ? fmt(term.value) : `${term.op ?? '+'} ${fmt(term.value)}`))
    .join(' ')
}

export function decomposeAnswer(calc: DecomposeCalc): string {
  return `${chain(calc.parts)} = ${chain(calc.partials)} = ${fmt(calc.result)}`
}

export function decomposeError(calc: DecomposeCalc): string | undefined {
  if (calc.op === '−' && calc.a < calc.b) {
    return 'Pour une soustraction, le premier nombre doit être plus grand que le second.'
  }
  return undefined
}

/** Découpe en dizaines et unités, puis regroupe. */
export function buildDecompose(op: '+' | '−', a: number, b: number): DecomposeCalc {
  const left = Math.round(a)
  const right = Math.round(b)
  const tensA = Math.trunc(left / 10) * 10
  const unitsA = left - tensA
  const tensB = Math.trunc(right / 10) * 10
  const unitsB = right - tensB
  if (op === '+') {
    const tensSum = tensA + tensB
    const unitsSum = unitsA + unitsB
    return {
      op,
      a: left,
      b: right,
      parts: [{ value: tensA }, { op: '+', value: tensB }, { op: '+', value: unitsA }, { op: '+', value: unitsB }],
      partials: [{ value: tensSum }, { op: '+', value: unitsSum }],
      result: left + right,
    }
  }
  const tensSum = tensA - tensB
  const unitsDelta = unitsA - unitsB
  const unitsOp: '+' | '−' = unitsDelta < 0 ? '−' : '+'
  return {
    op,
    a: left,
    b: right,
    parts: [{ value: tensA }, { op: '−', value: tensB }, { op: '+', value: unitsA }, { op: '−', value: unitsB }],
    partials: [{ value: tensSum }, { op: unitsOp, value: Math.abs(unitsDelta) }],
    result: left - right,
  }
}

function pickOperand(rng: Rng, difficulty: Difficulty, range?: NumberRange): number {
  if (range && range.max >= range.min) {
    return int(rng, Math.max(0, Math.round(range.min)), Math.max(0, Math.round(range.max)))
  }
  const [lo, hi] = difficulty === 'facile' ? [12, 49] : difficulty === 'moyen' ? [18, 79] : [24, 99]
  return int(rng, lo, hi)
}

export function generateDecomposeItem(
  op: '+' | '−',
  rng: Rng,
  difficulty: Difficulty,
  range?: NumberRange,
): MathItem {
  let a = pickOperand(rng, difficulty, range)
  let b = pickOperand(rng, difficulty, range)
  if (op === '−') {
    for (let i = 0; i < 16 && a <= b; i++) {
      a = pickOperand(rng, difficulty, range)
      b = pickOperand(rng, difficulty, range)
      if (b > a) [a, b] = [b, a]
    }
    if (a <= b) a = b + 12
  }
  const decompose = buildDecompose(op, a, b)
  return {
    layout: 'decompose',
    op,
    a: decompose.a,
    b: decompose.b,
    result: decompose.result,
    decompose,
    answer: decomposeAnswer(decompose),
  }
}

/** Exemples fixes, indépendants du tirage. */
export function decomposeExample(op: '+' | '−'): DecomposeCalc {
  return op === '−' ? buildDecompose('−', 73, 28) : buildDecompose('+', 47, 36)
}
