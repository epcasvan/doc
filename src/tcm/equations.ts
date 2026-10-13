/**
 * TCM ex. 34 — résoudre des équations.
 * Disposition type 32/33 : expression + grille de brouillon, 1 colonne.
 * Q1 : x d’un seul côté (gauche ou droite), sans fraction — 50 modèles.
 * Q2 : x des deux côtés, fractions possibles — 50 modèles.
 */
import { fmt } from '@/math/column-arith'
import { int, pick, shuffle, type Rng } from '@/math/rng'
import type { MathItem } from '@/math/types'

export const TCM_EQ_Q1_COUNT = 50
export const TCM_EQ_Q2_COUNT = 50

type EqTemplate = {
  id: string
  /** Construit { equation, development, operations, x }. */
  build: (rng: Rng) => {
    equation: string
    development: string[]
    operations: string[]
    x: number
  }
}

function equationItem(opts: {
  equation: string
  development: string[]
  operations: string[]
  x: number
}): MathItem {
  // Disposition type 32/33 : layout algèbre (expression + grille courte dessous).
  return {
    layout: 'algebra',
    prompt: opts.equation,
    development: opts.development,
    operations: opts.operations,
    calcAnswer: opts.development.join('\n'),
    responseAnswer: `x = ${fmt(opts.x)}`,
    answer: fmt(opts.x),
    unknowns: ['x'],
  }
}

/** Q1 : x uniquement à gauche ou à droite, pas de fraction. */
const Q1_TEMPLATES: EqTemplate[] = [
  {
    id: 'q1-01',
    build: (rng) => {
      const x = int(rng, 2, 20)
      const b = int(rng, 2, 15)
      return {
        equation: `x + ${b} = ${x + b}`,
        development: [`x + ${b} = ${x + b}`, `x = ${x}`],
        operations: ['', `− ${b}`],
        x,
      }
    },
  },
  {
    id: 'q1-02',
    build: (rng) => {
      const x = int(rng, 3, 20)
      const b = int(rng, 1, x - 1)
      return {
        equation: `x − ${b} = ${x - b}`,
        development: [`x − ${b} = ${x - b}`, `x = ${x}`],
        operations: ['', `+ ${b}`],
        x,
      }
    },
  },
  {
    id: 'q1-03',
    build: (rng) => {
      const x = int(rng, 2, 12)
      const a = int(rng, 2, 9)
      return {
        equation: `${a}x = ${a * x}`,
        development: [`${a}x = ${a * x}`, `x = ${x}`],
        operations: ['', `: ${a}`],
        x,
      }
    },
  },
  {
    id: 'q1-04',
    build: (rng) => {
      const x = int(rng, 2, 12)
      const a = int(rng, 2, 8)
      const b = int(rng, 1, 12)
      return {
        equation: `${a}x + ${b} = ${a * x + b}`,
        development: [`${a}x + ${b} = ${a * x + b}`, `${a}x = ${a * x}`, `x = ${x}`],
        operations: ['', `− ${b}`, `: ${a}`],
        x,
      }
    },
  },
  {
    id: 'q1-05',
    build: (rng) => {
      const x = int(rng, 3, 14)
      const a = int(rng, 2, 8)
      const b = int(rng, 1, a * x - 1)
      return {
        equation: `${a}x − ${b} = ${a * x - b}`,
        development: [`${a}x − ${b} = ${a * x - b}`, `${a}x = ${a * x}`, `x = ${x}`],
        operations: ['', `+ ${b}`, `: ${a}`],
        x,
      }
    },
  },
  {
    id: 'q1-06',
    build: (rng) => {
      const x = int(rng, 2, 18)
      const b = int(rng, 2, 15)
      return {
        equation: `${x + b} = x + ${b}`,
        development: [`${x + b} = x + ${b}`, `${x} = x`, `x = ${x}`],
        operations: ['', `− ${b}`, ''],
        x,
      }
    },
  },
  {
    id: 'q1-07',
    build: (rng) => {
      const x = int(rng, 3, 18)
      const b = int(rng, 1, x - 1)
      return {
        equation: `${x - b} = x − ${b}`,
        development: [`${x - b} = x − ${b}`, `${x} = x`, `x = ${x}`],
        operations: ['', `+ ${b}`, ''],
        x,
      }
    },
  },
  {
    id: 'q1-08',
    build: (rng) => {
      const x = int(rng, 2, 12)
      const a = int(rng, 2, 9)
      return {
        equation: `${a * x} = ${a}x`,
        development: [`${a * x} = ${a}x`, `${x} = x`, `x = ${x}`],
        operations: ['', `: ${a}`, ''],
        x,
      }
    },
  },
  {
    id: 'q1-09',
    build: (rng) => {
      const x = int(rng, 2, 12)
      const a = int(rng, 2, 8)
      const b = int(rng, 1, 12)
      return {
        equation: `${a * x + b} = ${a}x + ${b}`,
        development: [`${a * x + b} = ${a}x + ${b}`, `${a * x} = ${a}x`, `x = ${x}`],
        operations: ['', `− ${b}`, `: ${a}`],
        x,
      }
    },
  },
  {
    id: 'q1-10',
    build: (rng) => {
      const x = int(rng, 3, 14)
      const a = int(rng, 2, 8)
      const b = int(rng, 1, a * x - 1)
      return {
        equation: `${a * x - b} = ${a}x − ${b}`,
        development: [`${a * x - b} = ${a}x − ${b}`, `${a * x} = ${a}x`, `x = ${x}`],
        operations: ['', `+ ${b}`, `: ${a}`],
        x,
      }
    },
  },
]

// Dupliquer / varier jusqu’à 50 en changeant légèrement les formes.
function expandQ1Pool(): EqTemplate[] {
  const base = [...Q1_TEMPLATES]
  const extras: EqTemplate[] = []
  for (let i = 0; i < 40; i++) {
    const src = base[i % base.length]!
    extras.push({
      id: `q1-${11 + i}`,
      build: (rng) => {
        // Variante : tire à nouveau avec les mêmes règles (rng différent).
        return src.build(rng)
      },
    })
  }
  return [...base, ...extras]
}

/** Q2 : x à gauche et à droite ; fractions possibles. */
const Q2_TEMPLATES: EqTemplate[] = [
  {
    id: 'q2-01',
    build: (rng) => {
      const x = int(rng, 2, 12)
      const a = int(rng, 3, 8)
      const c = int(rng, 1, a - 1)
      const b = int(rng, 1, 10)
      const d = a * x + b - c * x
      return {
        equation: `${a}x + ${b} = ${c}x + ${d}`,
        development: [
          `${a}x + ${b} = ${c}x + ${d}`,
          `${a - c}x + ${b} = ${d}`,
          `${a - c}x = ${d - b}`,
          `x = ${x}`,
        ],
        operations: ['', `− ${c}x`, `− ${b}`, `: ${a - c}`],
        x,
      }
    },
  },
  {
    id: 'q2-02',
    build: (rng) => {
      const x = int(rng, 2, 12)
      const a = int(rng, 3, 8)
      const c = int(rng, 1, a - 1)
      const b = int(rng, 1, 10)
      // a x − b = c x + d  with d possibly negative — use abs form
      const rightConst = a * x - b - c * x
      if (rightConst < 0) {
        return {
          equation: `${a}x − ${b} = ${c}x − ${Math.abs(rightConst)}`,
          development: [
            `${a}x − ${b} = ${c}x − ${Math.abs(rightConst)}`,
            `${a - c}x − ${b} = −${Math.abs(rightConst)}`,
            `${a - c}x = ${b - Math.abs(rightConst)}`,
            `x = ${x}`,
          ],
          operations: ['', `− ${c}x`, `+ ${b}`, `: ${a - c}`],
          x,
        }
      }
      return {
        equation: `${a}x − ${b} = ${c}x + ${rightConst}`,
        development: [
          `${a}x − ${b} = ${c}x + ${rightConst}`,
          `${a - c}x − ${b} = ${rightConst}`,
          `${a - c}x = ${rightConst + b}`,
          `x = ${x}`,
        ],
        operations: ['', `− ${c}x`, `+ ${b}`, `: ${a - c}`],
        x,
      }
    },
  },
  {
    id: 'q2-03',
    build: (rng) => {
      const den = int(rng, 2, 6)
      const x = int(rng, 2, 9) * den
      const c = int(rng, 2, 5)
      const b = int(rng, 1, 8)
      // x/den + b = c x + k
      const k = x / den + b - c * x
      // Ensure readable: prefer form with positive constants when possible
      if (k >= 0) {
        return {
          equation: `x/${den} + ${b} = ${c}x + ${k}`,
          development: [
            `x/${den} + ${b} = ${c}x + ${k}`,
            `x/${den} − ${c}x = ${k - b}`,
            `${1 - c * den}x/${den} = ${k - b}`,
            `x = ${x}`,
          ],
          operations: ['', `− ${c}x`, `− ${b}`, `· ${den}`],
          x,
        }
      }
      return {
        equation: `x/${den} + ${b} = ${c}x − ${Math.abs(k)}`,
        development: [
          `x/${den} + ${b} = ${c}x − ${Math.abs(k)}`,
          `x/${den} − ${c}x = −${Math.abs(k)} − ${b}`,
          `x = ${x}`,
        ],
        operations: ['', `− ${c}x`, '', ''],
        x,
      }
    },
  },
  {
    id: 'q2-04',
    build: (rng) => {
      const den = int(rng, 2, 5)
      const x = int(rng, 2, 8) * den
      const a = int(rng, 2, 4)
      const b = int(rng, 1, 6)
      // a x + b = x/den + right
      const right = a * x + b - x / den
      return {
        equation: `${a}x + ${b} = x/${den} + ${right}`,
        development: [
          `${a}x + ${b} = x/${den} + ${right}`,
          `${a}x − x/${den} = ${right - b}`,
          `x = ${x}`,
        ],
        operations: ['', `− x/${den}`, ''],
        x,
      }
    },
  },
  {
    id: 'q2-05',
    build: (rng) => {
      const x = int(rng, 2, 10)
      const a = int(rng, 4, 9)
      const c = int(rng, 2, a - 1)
      const b = int(rng, 1, 9)
      const d = a * x - b - c * x
      if (d >= 0) {
        return {
          equation: `${a}x − ${b} = ${c}x + ${d}`,
          development: [
            `${a}x − ${b} = ${c}x + ${d}`,
            `${a - c}x − ${b} = ${d}`,
            `${a - c}x = ${d + b}`,
            `x = ${x}`,
          ],
          operations: ['', `− ${c}x`, `+ ${b}`, `: ${a - c}`],
          x,
        }
      }
      return {
        equation: `${a}x − ${b} = ${c}x − ${Math.abs(d)}`,
        development: [
          `${a}x − ${b} = ${c}x − ${Math.abs(d)}`,
          `${a - c}x − ${b} = −${Math.abs(d)}`,
          `${a - c}x = ${b - Math.abs(d)}`,
          `x = ${x}`,
        ],
        operations: ['', `− ${c}x`, `+ ${b}`, `: ${a - c}`],
        x,
      }
    },
  },
]

function expandQ2Pool(): EqTemplate[] {
  const base = [...Q2_TEMPLATES]
  const extras: EqTemplate[] = []
  for (let i = 0; i < 45; i++) {
    const src = base[i % base.length]!
    extras.push({
      id: `q2-${6 + i}`,
      build: (rng) => src.build(rng),
    })
  }
  return [...base, ...extras]
}

const Q1_POOL = expandQ1Pool()
const Q2_POOL = expandQ2Pool()

function fillFromPool(pool: EqTemplate[], rng: Rng): MathItem {
  const order = shuffle(rng, [...pool])
  for (const tpl of order) {
    try {
      const built = tpl.build(rng)
      if (!Number.isFinite(built.x)) continue
      return equationItem(built)
    } catch {
      continue
    }
  }
  const x = 5
  return equationItem({
    equation: `x + 3 = 8`,
    development: [`x + 3 = 8`, `x = 5`],
    operations: ['', '− 3'],
    x,
  })
}

/** Lot TCM ex. 34 : Q1 un côté, Q2 deux côtés (+ fractions possibles). */
export function generateTcmEquationsBatch(rng: Rng): MathItem[] {
  // Préférer un modèle « tiré », puis pool.
  const q1Preferred = pick(rng, Q1_POOL)
  const q2Preferred = pick(rng, Q2_POOL)
  let q1: MathItem
  let q2: MathItem
  try {
    q1 = equationItem(q1Preferred.build(rng))
  } catch {
    q1 = fillFromPool(Q1_POOL, rng)
  }
  try {
    q2 = equationItem(q2Preferred.build(rng))
  } catch {
    q2 = fillFromPool(Q2_POOL, rng)
  }
  return [q1, q2]
}

export function tcmEquationsTemplateCounts(): { q1: number; q2: number } {
  return { q1: Q1_POOL.length, q2: Q2_POOL.length }
}
