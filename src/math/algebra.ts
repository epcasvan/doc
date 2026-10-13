import { fmt } from './column-arith'
import { int, pick, shuffle, type Rng } from './rng'
import { generateTcmEvaluerBatch } from '@/tcm/evaluer'
import type { AlgebraGiven, Difficulty, MathItem } from './types'

export type { AlgebraGiven }

export type AlgebraBatch = {
  items: MathItem[]
  givens?: AlgebraGiven[]
  instruction?: string
  preferredColumns?: number
}

const SUPER: Record<number, string> = { 1: '', 2: '²', 3: '³', 4: '⁴' }
const SYMBOLS = ['a', 'b', 'c', 'm', 'n', 'p', 'x', 'y'] as const
const SQRT_CHOICES = [4, 9, 16, 25, 36, 49, 64, 81] as const

function signed(n: number): string {
  return n < 0 ? ` − ${Math.abs(n)}` : ` + ${n}`
}

function compactSigned(n: number): string {
  return n < 0 ? ` - ${Math.abs(n)}` : ` + ${n}`
}

function nonzero(rng: Rng, min: number, max: number): number {
  let n = 0
  while (n === 0) n = int(rng, min, max)
  return n
}

function algebraExpr(expression: string, answer: string | number): MathItem {
  return {
    layout: 'algebra',
    prompt: expression,
    answer: typeof answer === 'number' ? fmt(answer) : answer,
  }
}

function cl(letter: string, a: number): string {
  return a === 1 ? letter : `${a}${letter}`
}

function cl2(letter: string, a: number): string {
  return a === 1 ? `${letter}²` : `${a}${letter}²`
}

/** Une variable partagée : comme genAlgebraGroupStep (soutien). */
export function generateEvalOneVar(rng: Rng, count: number): AlgebraBatch {
  const letter = pick(rng, ['n', 'x', 'y', 'k', 'm', 'p', 't'] as const)
  const value = int(rng, 2, 9)
  const l = letter
  const v = value

  const easy = [
    () => {
      const a = int(rng, 2, 9)
      return { expr: cl(l, a), answer: a * v }
    },
    () => {
      const a = int(rng, 2, 6)
      const b = int(rng, 1, 9)
      return { expr: `${cl(l, a)} + ${b}`, answer: a * v + b }
    },
    () => {
      const a = int(rng, 2, 6)
      const b = int(rng, 2, 9)
      return { expr: `${b} + ${cl(l, a)}`, answer: b + a * v }
    },
    () => {
      const b = int(rng, 2, 9)
      return { expr: `${l} + ${b}`, answer: v + b }
    },
    () => {
      const a = int(rng, 1, 5)
      const b = int(rng, 1, 5)
      return { expr: `(${a} + ${b})${l}`, answer: (a + b) * v }
    },
    () => {
      const a = int(rng, 2, 5)
      const b = int(rng, 1, 6)
      return { expr: `${a}(${l} + ${b})`, answer: a * (v + b) }
    },
    () => {
      const a = int(rng, 2, 5)
      const b = int(rng, 1, 3)
      return { expr: `${a}(${l} − ${b})`, answer: a * (v - b) }
    },
  ]

  const medium = [
    () => {
      const a = int(rng, 2, 5)
      const b = int(rng, 2, 4)
      const c = int(rng, 1, 8)
      return { expr: `${cl(l, a)} + ${cl(l, b)} − ${c}`, answer: (a + b) * v - c }
    },
    () => {
      const a = int(rng, 2, 4)
      const b = int(rng, 2, 4)
      const c = int(rng, 1, 5)
      return { expr: `${cl(l, a)} + ${b}(${l} + ${c})`, answer: a * v + b * (v + c) }
    },
    () => {
      const a = int(rng, 4, 8)
      const b = int(rng, 1, 3)
      const c = int(rng, 1, 8)
      return { expr: `${cl(l, a)} − ${cl(l, b)} + ${c}`, answer: (a - b) * v + c }
    },
    () => {
      const a = int(rng, 1, 2)
      const b = int(rng, 2, 5)
      const c = int(rng, 1, 6)
      return { expr: `${cl2(l, a)} + ${cl(l, b)} − ${c}`, answer: a * v * v + b * v - c }
    },
    () => {
      const a = int(rng, 2, 3)
      const b = int(rng, 1, 6)
      return { expr: `${a}(${l}² + ${b})`, answer: a * (v * v + b) }
    },
    () => {
      const a = int(rng, 2, 6)
      return { expr: `${l}³ + ${cl(l, a)}`, answer: v * v * v + a * v }
    },
  ]

  const pool = shuffle(rng, [...easy, ...medium])
  const items: MathItem[] = []
  for (let i = 0; i < count; i++) {
    const make = pool[i % pool.length]!
    let picked = make()
    for (let t = 0; t < 12 && (picked.answer <= 0 || picked.answer >= 500); t++) picked = make()
    items.push(algebraExpr(picked.expr, picked.answer))
  }

  return {
    items,
    givens: [{ letter, value }],
    instruction: 'Calculez le résultat.',
  }
}

/** 2 ou 3 variables / puissances — genEvalExpressionGroupStep (soutien). */
export function generateEvalMultiVar(
  rng: Rng,
  count: number,
  variant: 'two' | 'three' | 'advanced',
): AlgebraBatch {
  const vars = shuffle(rng, [...SYMBOLS])
  const varCount = variant === 'two' ? 2 : 3
  const letters = vars.slice(0, varCount)
  const values = letters.map(() => nonzero(rng, -9, 9))
  const [u, v, w] = letters
  const [uv, vv, wv] = values

  type Maker = () => { expression: string; result: number }

  const makers2: Maker[] = [
    () => {
      const a = int(rng, 2, 9)
      const b = int(rng, 2, 9)
      const c = int(rng, -12, 12)
      return { expression: `${a}${u} + ${b}${v}${compactSigned(c)}`, result: a * uv! + b * vv! + c }
    },
    () => {
      const a = int(rng, 2, 9)
      const c = int(rng, -12, 12)
      return { expression: `${a}(${u} + ${v})${compactSigned(c)}`, result: a * (uv! + vv!) + c }
    },
    () => {
      const a = int(rng, 2, 9)
      const b = int(rng, 2, 9)
      const inner = Math.abs(int(rng, -12, 12)) || 1
      return { expression: `${a}${u} - ${b}(${v}${compactSigned(inner)})`, result: a * uv! - b * (vv! + inner) }
    },
    () => {
      const a = int(rng, 2, 9)
      const b = int(rng, 2, 9)
      return { expression: `${a}(${u} - ${v}) + ${b}${u}`, result: a * (uv! - vv!) + b * uv! }
    },
    () => {
      const a = int(rng, 2, 9)
      const b = int(rng, 2, 9)
      const c = int(rng, -12, 12)
      return { expression: `${a}${u} · ${b} - ${v}${compactSigned(c)}`, result: a * uv! * b - vv! + c }
    },
  ]

  const makers3: Maker[] = [
    () => {
      const a = int(rng, 2, 7)
      const b = int(rng, 2, 7)
      const c = int(rng, 2, 7)
      return { expression: `${a}${u} + ${b}${v} - ${c}${w}`, result: a * uv! + b * vv! - c * wv! }
    },
    () => {
      const a = int(rng, 2, 7)
      const c = int(rng, 2, 7)
      return { expression: `${a}(${u} + ${v}) - ${c}${w}`, result: a * (uv! + vv!) - c * wv! }
    },
    () => {
      const a = int(rng, 2, 7)
      const b = int(rng, 2, 7)
      return { expression: `${a}${u} - ${b}(${v} - ${w})`, result: a * uv! - b * (vv! - wv!) }
    },
    () => {
      const a = int(rng, 2, 7)
      const b = int(rng, 2, 7)
      const c = int(rng, 2, 7)
      return { expression: `${a}${u} · ${b} + ${v} - ${c}${w}`, result: a * uv! * b + vv! - c * wv! }
    },
    () => {
      const a = int(rng, 2, 7)
      return { expression: `${a}(${u} - ${v} + ${w})`, result: a * (uv! - vv! + wv!) }
    },
  ]

  const makersAdv: Maker[] = [
    () => {
      const a = int(rng, 2, 5)
      const sq = pick(rng, SQRT_CHOICES)
      const root = Math.sqrt(sq)
      return { expression: `${u}² + ${a}${v} − √${sq}`, result: uv! * uv! + a * vv! - root }
    },
    () => {
      const a = int(rng, 2, 5)
      const b = int(rng, 2, 5)
      return { expression: `${a}${u}² − ${b}${v} + ${w}`, result: a * uv! * uv! - b * vv! + wv! }
    },
    () => {
      const a = int(rng, 2, 5)
      const sq = pick(rng, SQRT_CHOICES)
      const root = Math.sqrt(sq)
      return {
        expression: `√${sq} + ${a}(${u} − ${v}) + ${w}²`,
        result: root + a * (uv! - vv!) + wv! * wv!,
      }
    },
    () => {
      const a = int(rng, 2, 5)
      const b = int(rng, 2, 5)
      return { expression: `${a}${u}² + ${b}${v}² − ${w}`, result: a * uv! * uv! + b * vv! * vv! - wv! }
    },
    () => {
      const a = int(rng, 2, 5)
      const sq = pick(rng, SQRT_CHOICES)
      const root = Math.sqrt(sq)
      return {
        expression: `${a}(${u} + ${v})² − √${sq} − ${w}`,
        result: a * (uv! + vv!) * (uv! + vv!) - root - wv!,
      }
    },
    () => {
      const a = int(rng, 2, 4)
      const sq = pick(rng, SQRT_CHOICES)
      const root = Math.sqrt(sq)
      return { expression: `${u}³ + ${a}${v} − √${sq}`, result: uv! * uv! * uv! + a * vv! - root }
    },
    () => {
      const a = int(rng, 2, 5)
      const b = int(rng, 2, 5)
      return { expression: `${a}${u}² − ${b}${w}² + ${v}`, result: a * uv! * uv! - b * wv! * wv! + vv! }
    },
    () => {
      const sq = pick(rng, SQRT_CHOICES)
      const root = Math.sqrt(sq)
      const a = int(rng, 2, 5)
      return { expression: `√${sq} · ${a} + ${u}² − ${v}`, result: root * a + uv! * uv! - vv! }
    },
  ]

  const source = variant === 'two' ? makers2 : variant === 'three' ? makers3 : makersAdv
  const picked = shuffle(rng, [...source])
  const items = Array.from({ length: count }, (_, i) => {
    const { expression, result } = picked[i % picked.length]!()
    return algebraExpr(expression, result)
  })

  const instruction =
    variant === 'two'
      ? 'Évaluez les expressions avec deux variables. Les expressions utilisent les mêmes valeurs.'
      : variant === 'three'
        ? 'Évaluez les expressions avec trois variables. Les expressions utilisent les mêmes valeurs.'
        : 'Évaluez les expressions avec puissances et racines. Les expressions utilisent les mêmes valeurs.'

  return {
    items,
    givens: letters.map((letter, i) => ({ letter, value: values[i]! })),
    instruction,
  }
}

function literalText(powers: Record<string, number>): string {
  return Object.keys(powers)
    .sort()
    .map((letter) => `${letter}${SUPER[powers[letter]!] ?? `^${powers[letter]}`}`)
    .join('')
}

function monomialText(coefficient: number, literal: string): string {
  if (!literal) return String(coefficient)
  if (coefficient === 1) return literal
  if (coefficient === -1) return `−${literal}`
  return `${coefficient < 0 ? '−' : ''}${Math.abs(coefficient)}${literal}`
}

function polynomialText(terms: Array<{ coefficient: number; literal: string }>): string {
  const grouped = new Map<string, number>()
  terms.forEach(({ coefficient, literal }) =>
    grouped.set(literal, (grouped.get(literal) ?? 0) + coefficient),
  )
  const entries = [...grouped.entries()]
    .filter(([, coefficient]) => coefficient !== 0)
    .sort(([left], [right]) => right.length - left.length || left.localeCompare(right))
  if (entries.length === 0) return '0'
  return entries
    .map(([literal, coefficient], index) => {
      const term = monomialText(Math.abs(coefficient), literal)
      if (index === 0) return coefficient < 0 ? `−${term}` : term
      return `${coefficient < 0 ? '−' : '+'} ${term}`
    })
    .join(' ')
}

/** Simplifiez les produits — generateProductQuestion (soutien). */
export function generateSimplifyProducts(rng: Rng, count: number): AlgebraBatch {
  const items: MathItem[] = []
  for (let i = 0; i < count; i++) {
    const seed = int(rng, 0, 200) + i * 7
    const factorCount = 3 + (seed % 4)
    const powers: Record<string, number> = {}
    let coefficient = 1
    const factors: string[] = []
    for (let index = 0; index < factorCount; index++) {
      const numeric = (seed + index) % 3 === 0
      if (numeric) {
        const value = 2 + ((seed * 3 + index) % 7)
        coefficient *= value
        factors.push(String(value))
      } else {
        const letter = SYMBOLS[(seed + index * 2) % SYMBOLS.length]!
        const exponent = (seed + index) % 5 === 0 ? 2 : 1
        powers[letter] = (powers[letter] ?? 0) + exponent
        factors.push(`${letter}${SUPER[exponent]}`)
      }
    }
    items.push(algebraExpr(factors.join(' · '), monomialText(coefficient, literalText(powers))))
  }
  return {
    items,
    instruction: 'Simplifiez les produits.',
  }
}

/** Réduction d’expressions — generateReductionQuestion (soutien). */
export function generateReduce(rng: Rng, count: number): AlgebraBatch {
  const items: MathItem[] = []
  for (let i = 0; i < count; i++) {
    const templateIndex = int(rng, 0, 40) + i
    const termCount = 4 + (templateIndex % 4)
    const literals = [
      SYMBOLS[templateIndex % SYMBOLS.length]!,
      SYMBOLS[(templateIndex + 3) % SYMBOLS.length]!,
    ]
    const terms: Array<{ coefficient: number; literal: string }> = []
    for (let index = 0; index < termCount; index++) {
      const isConstant = (templateIndex + index) % 6 === 0
      const letter = isConstant ? '' : literals[(templateIndex + index) % literals.length]!
      const exponent = !letter || (templateIndex + index) % 5 !== 0 ? 1 : 2
      const literal = letter ? `${letter}${SUPER[exponent]}` : ''
      const magnitude = 1 + ((templateIndex * 2 + index * 3) % 9)
      const coefficient = (templateIndex + index) % 4 === 0 ? -magnitude : magnitude
      terms.push({ coefficient, literal })
    }
    const display = terms
      .map(({ coefficient, literal }, index) => {
        const body = monomialText(Math.abs(coefficient), literal)
        if (index === 0) return coefficient < 0 ? `−${body}` : body
        return `${coefficient < 0 ? '−' : '+'} ${body}`
      })
      .join(' ')
    items.push(algebraExpr(display, polynomialText(terms)))
  }
  return {
    items,
    instruction: 'Réduisez chaque expression.',
  }
}

export function generateDevelop(rng: Rng, count: number): AlgebraBatch {
  const items: MathItem[] = []
  for (let i = 0; i < count; i++) {
    const mode = int(rng, 0, 2)
    const sym = pick(rng, ['x', 'a', 'n', 'y'] as const)
    if (mode === 0) {
      const k = int(rng, 2, 9)
      const p = int(rng, 1, 9)
      const minus = rng() < 0.5
      items.push(
        algebraExpr(
          `${k}(${sym} ${minus ? '−' : '+'} ${p})`,
          polynomialText([
            { coefficient: k, literal: sym },
            { coefficient: k * p * (minus ? -1 : 1), literal: '' },
          ]),
        ),
      )
    } else if (mode === 1) {
      const a = int(rng, 1, 4)
      const b = int(rng, 1, 6)
      const aS = a === 1 ? '' : String(a)
      items.push(
        algebraExpr(
          `(${aS}${sym} + ${b})²`,
          polynomialText([
            { coefficient: a * a, literal: `${sym}²` },
            { coefficient: 2 * a * b, literal: sym },
            { coefficient: b * b, literal: '' },
          ]),
        ),
      )
    } else {
      const a = int(rng, 2, 6)
      const p = int(rng, 1, 6)
      const c = int(rng, 2, 5)
      const q = int(rng, 1, 6)
      const s1 = rng() < 0.5 ? -1 : 1
      const s2 = rng() < 0.5 ? -1 : 1
      const outer = rng() < 0.5 ? -1 : 1
      items.push(
        algebraExpr(
          `${a}(${sym} ${s1 < 0 ? '−' : '+'} ${p}) ${outer < 0 ? '−' : '+'} ${c}(${sym} ${s2 < 0 ? '−' : '+'} ${q})`,
          polynomialText([
            { coefficient: a, literal: sym },
            { coefficient: a * p * s1, literal: '' },
            { coefficient: outer * c, literal: sym },
            { coefficient: outer * c * q * s2, literal: '' },
          ]),
        ),
      )
    }
  }
  return {
    items,
    instruction: 'Développez, puis réduisez si besoin.',
  }
}

export function generateFactor(rng: Rng, count: number): AlgebraBatch {
  const items: MathItem[] = []
  for (let i = 0; i < count; i++) {
    const factor = int(rng, 2, 9)
    const innerCoef = int(rng, 1, 9)
    const innerConst = int(rng, 1, 9)
    const minus = rng() < 0.5
    const sym = pick(rng, ['x', 'a', 'n', 'y'] as const)
    const left = factor * innerCoef
    const right = factor * innerConst
    items.push(
      algebraExpr(
        `${left}${sym} ${minus ? '−' : '+'} ${right}`,
        `${factor}(${innerCoef}${sym} ${minus ? '−' : '+'} ${innerConst})`,
      ),
    )
  }
  return {
    items,
    instruction: 'Factorisez les expressions.',
  }
}

/** Item équation : énoncé + développement / opérations (corrigé) + lignes x = / y =. */
function equationItem(opts: {
  equation: string
  development: string[]
  operations?: string[]
  x: number
  y?: number
  systemBrace?: boolean
}): MathItem {
  const { equation, development, x, y, systemBrace } = opts
  const operations = alignOps(development, opts.operations ?? [])
  const unknowns = y === undefined ? ['x'] : ['x', 'y']
  const responseAnswer =
    y === undefined ? `x = ${fmt(x)}` : `x = ${fmt(x)} ; y = ${fmt(y)}`
  return {
    layout: 'equation',
    prompt: equation,
    development,
    operations,
    calcAnswer: development.join('\n'),
    responseAnswer,
    answer: responseAnswer,
    unknowns,
    systemBrace,
  }
}

function alignOps(dev: string[], ops: string[]): string[] {
  if (ops.length === dev.length) return ops
  if (ops.length > dev.length) return ops.slice(0, dev.length)
  return [...ops, ...Array.from({ length: dev.length - ops.length }, () => '')]
}

function opAdd(n: number): string {
  if (n === 0) return ''
  return n < 0 ? `− ${Math.abs(n)}` : `+ ${n}`
}

function opSub(n: number): string {
  return `− ${Math.abs(n)}`
}

function stepsXPlusB(b: number, right: number, x: number): { development: string[]; operations: string[] } {
  const development = [`x + ${b} = ${right}`, `x = ${x}`]
  return { development, operations: alignOps(development, ['', opSub(b)]) }
}

function stepsAX(a: number, right: number, x: number): { development: string[]; operations: string[] } {
  const development = [`${a}x = ${right}`, `x = ${x}`]
  return { development, operations: alignOps(development, ['', `: ${a}`]) }
}

function stepsAXMinusB(a: number, b: number, right: number, x: number): { development: string[]; operations: string[] } {
  const mid = a * x
  const development = [`${a}x − ${b} = ${right}`, `${a}x = ${mid}`, `x = ${x}`]
  return { development, operations: alignOps(development, ['', `+ ${b}`, `: ${a}`]) }
}

function stepsTwoSides(a: number, b: number, c: number, d: number, x: number): {
  development: string[]
  operations: string[]
} {
  const coef = a - c
  const development = [
    `${a}x${signed(b)} = ${c}x${signed(d)}`,
    `${coef}x${signed(b)} = ${d}`,
    `${coef}x = ${coef * x}`,
    `x = ${x}`,
  ]
  return {
    development,
    operations: alignOps(development, ['', `− ${c}x`, opSub(b), `: ${coef}`]),
  }
}

function stepsFraction(den: number, constant: number, result: number, x: number): {
  development: string[]
  operations: string[]
} {
  const mid = x / den
  if (constant === 0) {
    const development = [`x/${den} = ${result}`, `x = ${x}`]
    return { development, operations: alignOps(development, ['', `· ${den}`]) }
  }
  const development = [
    `x/${den}${signed(constant)} = ${result}`,
    `x/${den} = ${mid}`,
    `x = ${x}`,
  ]
  return {
    development,
    operations: alignOps(development, ['', opAdd(-constant), `· ${den}`]),
  }
}

/** Équations adaptées au niveau : simple → fractions → fractions + puissances / racines. */
export function generateEquations(
  rng: Rng,
  count: number,
  kind: 'simple' | 'two-sides' | 'fraction',
  difficulty: Difficulty = 'moyen',
): AlgebraBatch {
  const items: MathItem[] = Array.from({ length: count }, () => oneEquation(rng, kind, difficulty))
  return {
    items,
    instruction:
      difficulty === 'avance'
        ? 'Résolvez l’équation. Écrivez le développement, puis la valeur de x (fractions, puissances ou racines).'
        : 'Résolvez l’équation. Écrivez le développement, puis la valeur de x.',
  }
}

function oneEquation(
  rng: Rng,
  kind: 'simple' | 'two-sides' | 'fraction',
  difficulty: Difficulty,
): MathItem {
  if (difficulty === 'avance') {
    const mode = int(rng, 0, 3)
    if (mode === 0) {
      const den = int(rng, 2, 7)
      const x = int(rng, 2, 8) * den
      const k = int(rng, 1, 5)
      const k2 = k * k
      const mid = x / den
      const right = mid + k2
      const development = [
        `x/${den} + ${k}² = ${right}`,
        `x/${den} + ${k2} = ${right}`,
        `x/${den} = ${mid}`,
        `x = ${x}`,
      ]
      return equationItem({
        equation: development[0]!,
        development,
        operations: ['', 'effectuer', opSub(k2), `· ${den}`],
        x,
      })
    }
    if (mode === 1) {
      const root = pick(rng, [4, 9, 16, 25, 36] as const)
      const sqrt = Math.sqrt(root)
      const x = int(rng, 2, 15)
      const a = int(rng, 2, 5)
      const mid = a * x
      const right = mid + sqrt
      const development = [
        `${a}x + √${root} = ${right}`,
        `${a}x + ${sqrt} = ${right}`,
        `${a}x = ${mid}`,
        `x = ${x}`,
      ]
      return equationItem({
        equation: development[0]!,
        development,
        operations: ['', 'effectuer', opSub(sqrt), `: ${a}`],
        x,
      })
    }
    if (mode === 2) {
      const x = int(rng, 2, 10)
      const a = int(rng, 2, 4)
      const constTerm = a * x * x - x
      const mid = a * x * x
      const development = [
        `${a}x² − ${constTerm} = ${x}`,
        `${a}x² = ${mid}`,
        `x² = ${x * x}`,
        `x = ${x}`,
      ]
      return equationItem({
        equation: development[0]!,
        development,
        operations: ['', `+ ${constTerm}`, `: ${a}`, ''],
        x,
      })
    }
    const den = int(rng, 2, 6)
    const x = int(rng, 2, 9) * den
    const mid = x / den
    const right = mid - 2
    const development = [
      `x/${den} − √4 = ${right}`,
      `x/${den} − 2 = ${right}`,
      `x/${den} = ${mid}`,
      `x = ${x}`,
    ]
    return equationItem({
      equation: development[0]!,
      development,
      operations: ['', 'effectuer', `+ 2`, `· ${den}`],
      x,
    })
  }

  if (difficulty === 'moyen' && (kind === 'fraction' || (kind === 'simple' && rng() < 0.35))) {
    const den = int(rng, 2, 9)
    const x = int(rng, -8, 12) * den
    if (x === 0) return oneEquation(rng, kind, difficulty)
    const constant = nonzero(rng, -5, 8)
    const result = x / den + constant
    const { development, operations } = stepsFraction(den, constant, result, x)
    return equationItem({
      equation: `x/${den}${signed(constant)} = ${result}`,
      development,
      operations,
      x,
    })
  }

  if (kind === 'two-sides' || (difficulty === 'moyen' && kind === 'simple' && rng() < 0.5)) {
    const x = int(rng, 2, 12)
    const a = int(rng, 3, 8)
    const c = int(rng, 1, a - 1)
    const b = int(rng, 1, 10)
    const d = a * x + b - c * x
    const { development, operations } = stepsTwoSides(a, b, c, d, x)
    return equationItem({
      equation: `${a}x${signed(b)} = ${c}x${signed(d)}`,
      development,
      operations,
      x,
    })
  }

  if (kind === 'fraction') {
    const den = int(rng, 2, difficulty === 'facile' ? 5 : 9)
    const x = int(rng, 2, 12) * den
    const constant = int(rng, 0, 8)
    const result = x / den + constant
    const { development, operations } = stepsFraction(den, constant, result, x)
    return equationItem({
      equation: constant === 0 ? `x/${den} = ${result}` : `x/${den}${signed(constant)} = ${result}`,
      development,
      operations,
      x,
    })
  }

  const x = int(rng, 2, difficulty === 'facile' ? 12 : 20)
  const a = int(rng, 2, difficulty === 'facile' ? 5 : 7)
  const b = int(rng, 1, difficulty === 'facile' ? 9 : 12)
  const mode = int(rng, 0, 2)
  if (mode === 0) {
    const right = x + b
    const { development, operations } = stepsXPlusB(b, right, x)
    return equationItem({ equation: `x + ${b} = ${right}`, development, operations, x })
  }
  if (mode === 1) {
    const right = a * x
    const { development, operations } = stepsAX(a, right, x)
    return equationItem({ equation: `${a}x = ${right}`, development, operations, x })
  }
  const right = a * x - b
  const { development, operations } = stepsAXMinusB(a, b, right, x)
  return equationItem({ equation: `${a}x − ${b} = ${right}`, development, operations, x })
}

const PHASE_ISOLATE = 'Isoler une inconnue'
const PHASE_SUBSTITUTE = 'Substituer sa valeur'
const PHASE_OTHER = "Chercher l'autre inconnue"

function fmtLin(a: number, b: number, c: number): string {
  const parts: string[] = []
  if (a !== 0) parts.push(a === 1 ? 'x' : a === -1 ? '−x' : `${a}x`)
  if (b !== 0) {
    const abs = Math.abs(b)
    const term = abs === 1 ? 'y' : `${abs}y`
    parts.push(b > 0 ? `+ ${term}` : `− ${term}`)
  }
  return `${parts.join(' ').replace(/^\+ /, '')} = ${c}`
}

/** Système par substitution (style A10.3 soutien-scolaire). */
export function generateSystemSubstitution(rng: Rng): MathItem {
  const x = int(rng, 1, 8)
  const y = int(rng, 1, 8)
  const a = int(rng, 2, 5)
  const c = a * x + y
  const d = int(rng, 3, 8)
  const e = int(rng, 2, 6)
  const f2 = d * x - e * y
  const development = [
    PHASE_ISOLATE,
    fmtLin(a, 1, c),
    `y = ${c} − ${a}x`,
    PHASE_SUBSTITUTE,
    `${d}x − ${e}(${c} − ${a}x) = ${f2}`,
    `${d}x − ${e * c} + ${e * a}x = ${f2}`,
    `${d + e * a}x − ${e * c} = ${f2}`,
    `${d + e * a}x = ${f2 + e * c}`,
    `x = ${x}`,
    PHASE_OTHER,
    `y = ${c} − ${a}x`,
    `y = ${y}`,
  ]
  return equationItem({
    equation: `${fmtLin(a, 1, c)}\n${fmtLin(d, -e, f2)}`,
    development,
    operations: [
      '',
      '',
      `− ${a}x`,
      '',
      '',
      'effectuer',
      'réduire',
      `+ ${e * c}`,
      `: ${d + e * a}`,
      '',
      '',
      '',
    ],
    x,
    y,
    systemBrace: true,
  })
}

/** Système par addition / combinaison linéaire (style A10.4). */
export function generateSystemAddition(rng: Rng): MathItem {
  const x = int(rng, 1, 8)
  const y = int(rng, 1, 8)
  const a = int(rng, 2, 5)
  const b = int(rng, 2, 5)
  const d = a
  const e = -b
  const c1 = a * x + b * y
  const c2 = d * x + e * y
  const development = [
    'I',
    fmtLin(a, b, c1),
    'II',
    fmtLin(d, e, c2),
    `${2 * a}x = ${c1 + c2}`,
    `x = ${x}`,
    'dans I',
    fmtLin(a, b, c1),
    `${a} · ${x} + ${b}y = ${c1}`,
    `${a * x} + ${b}y = ${c1}`,
    `${b}y = ${c1 - a * x}`,
    `y = ${y}`,
  ]
  return equationItem({
    equation: `${fmtLin(a, b, c1)}\n${fmtLin(d, e, c2)}`,
    development,
    operations: ['', '', '', '', '', `: ${2 * a}`, '', '', 'effectuer', '', `− ${a * x}`, `: ${b}`],
    x,
    y,
    systemBrace: true,
  })
}

export function tryGenerateAlgebraBatch(
  exerciseType: string,
  count: number,
  rng: Rng,
  difficulty: Difficulty = 'moyen',
): AlgebraBatch | null {
  switch (exerciseType) {
    case 'tcm-expressions-evaluer':
      return generateTcmEvaluerBatch(rng)
    case 'expressions-substituer':
      return generateEvalOneVar(rng, count)
    case 'expressions-evaluer-2var':
      return generateEvalMultiVar(rng, count, 'two')
    case 'expressions-evaluer-3var':
      return generateEvalMultiVar(rng, count, difficulty === 'facile' ? 'two' : 'three')
    case 'expressions-evaluer-avances':
      // Toujours des puissances / racines (pas de repli vers two/three selon le niveau).
      return generateEvalMultiVar(rng, count, 'advanced')
    case 'expressions-produits':
      return generateSimplifyProducts(rng, count)
    case 'expressions-reduire':
      return generateReduce(rng, count)
    case 'expressions-developper':
      return generateDevelop(rng, count)
    case 'expressions-factoriser':
      return generateFactor(rng, count)
    case 'equations-simple':
      return generateEquations(rng, count, 'simple', difficulty)
    case 'equations-deux-cotes':
      return generateEquations(rng, count, 'two-sides', difficulty)
    case 'equations-fractions':
      return generateEquations(rng, count, 'fraction', difficulty)
    default:
      return null
  }
}
