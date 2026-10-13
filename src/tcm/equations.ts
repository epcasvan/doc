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

export type EqBuilt = {
  equation: string
  development: string[]
  operations: string[]
  x: number
  vars: Record<string, number>
}

export type EqTemplate = {
  id: string
  /** Construit l’équation ; `override` impose les paramètres (édition libre). */
  build: (rng: Rng, override?: Record<string, number>) => EqBuilt
}

function v(override: Record<string, number> | undefined, key: string, fallback: number): number {
  const n = override?.[key]
  if (n == null || !Number.isFinite(n)) return fallback
  return Math.round(n)
}

function equationItem(opts: EqBuilt, templateId: string, kind: 'q1' | 'q2'): MathItem {
  const keys = Object.keys(opts.vars).sort((a, b) => a.localeCompare(b))
  return {
    layout: 'algebra',
    prompt: opts.equation,
    development: opts.development,
    operations: opts.operations,
    calcAnswer: opts.development.join('\n'),
    responseAnswer: `x = ${fmt(opts.x)}`,
    answer: fmt(opts.x),
    unknowns: ['x'],
    problemTemplateId: templateId,
    problemVars: { ...opts.vars },
    problemVarDefs: keys.map((k) => ({
      key: k,
      label: k === 'x' ? 'Solution x' : `Paramètre ${k}`,
      editOn: 'both' as const,
    })),
    labels: ['equations', kind],
  }
}

/** Q1 : x uniquement à gauche ou à droite, pas de fraction. */
const Q1_TEMPLATES: EqTemplate[] = [
  {
    id: 'q1-01',
    build: (rng, o) => {
      const x = v(o, 'x', int(rng, 2, 20))
      const b = v(o, 'b', int(rng, 2, 15))
      return {
        equation: `x + ${b} = ${x + b}`,
        development: [`x + ${b} = ${x + b}`, `x = ${x}`],
        operations: ['', `− ${b}`],
        x,
        vars: { x, b },
      }
    },
  },
  {
    id: 'q1-02',
    build: (rng, o) => {
      let x = v(o, 'x', int(rng, 3, 20))
      if (x < 3) x = 3
      const b = Math.max(1, Math.min(x - 1, v(o, 'b', int(rng, 1, x - 1))))
      return {
        equation: `x − ${b} = ${x - b}`,
        development: [`x − ${b} = ${x - b}`, `x = ${x}`],
        operations: ['', `+ ${b}`],
        x,
        vars: { x, b },
      }
    },
  },
  {
    id: 'q1-03',
    build: (rng, o) => {
      const x = v(o, 'x', int(rng, 2, 12))
      const a = Math.max(2, v(o, 'a', int(rng, 2, 9)))
      return {
        equation: `${a}x = ${a * x}`,
        development: [`${a}x = ${a * x}`, `x = ${x}`],
        operations: ['', `: ${a}`],
        x,
        vars: { x, a },
      }
    },
  },
  {
    id: 'q1-04',
    build: (rng, o) => {
      const x = v(o, 'x', int(rng, 2, 12))
      const a = Math.max(2, v(o, 'a', int(rng, 2, 8)))
      const b = Math.max(1, v(o, 'b', int(rng, 1, 12)))
      return {
        equation: `${a}x + ${b} = ${a * x + b}`,
        development: [`${a}x + ${b} = ${a * x + b}`, `${a}x = ${a * x}`, `x = ${x}`],
        operations: ['', `− ${b}`, `: ${a}`],
        x,
        vars: { x, a, b },
      }
    },
  },
  {
    id: 'q1-05',
    build: (rng, o) => {
      let x = v(o, 'x', int(rng, 3, 14))
      if (x < 3) x = 3
      const a = Math.max(2, v(o, 'a', int(rng, 2, 8)))
      const b = Math.max(1, Math.min(a * x - 1, v(o, 'b', int(rng, 1, a * x - 1))))
      return {
        equation: `${a}x − ${b} = ${a * x - b}`,
        development: [`${a}x − ${b} = ${a * x - b}`, `${a}x = ${a * x}`, `x = ${x}`],
        operations: ['', `+ ${b}`, `: ${a}`],
        x,
        vars: { x, a, b },
      }
    },
  },
  {
    id: 'q1-06',
    build: (rng, o) => {
      const x = v(o, 'x', int(rng, 2, 18))
      const b = Math.max(2, v(o, 'b', int(rng, 2, 15)))
      return {
        equation: `${x + b} = x + ${b}`,
        development: [`${x + b} = x + ${b}`, `${x} = x`, `x = ${x}`],
        operations: ['', `− ${b}`, ''],
        x,
        vars: { x, b },
      }
    },
  },
  {
    id: 'q1-07',
    build: (rng, o) => {
      let x = v(o, 'x', int(rng, 3, 18))
      if (x < 3) x = 3
      const b = Math.max(1, Math.min(x - 1, v(o, 'b', int(rng, 1, x - 1))))
      return {
        equation: `${x - b} = x − ${b}`,
        development: [`${x - b} = x − ${b}`, `${x} = x`, `x = ${x}`],
        operations: ['', `+ ${b}`, ''],
        x,
        vars: { x, b },
      }
    },
  },
  {
    id: 'q1-08',
    build: (rng, o) => {
      const x = v(o, 'x', int(rng, 2, 12))
      const a = Math.max(2, v(o, 'a', int(rng, 2, 9)))
      return {
        equation: `${a * x} = ${a}x`,
        development: [`${a * x} = ${a}x`, `${x} = x`, `x = ${x}`],
        operations: ['', `: ${a}`, ''],
        x,
        vars: { x, a },
      }
    },
  },
  {
    id: 'q1-09',
    build: (rng, o) => {
      const x = v(o, 'x', int(rng, 2, 12))
      const a = Math.max(2, v(o, 'a', int(rng, 2, 8)))
      const b = Math.max(1, v(o, 'b', int(rng, 1, 12)))
      return {
        equation: `${a * x + b} = ${a}x + ${b}`,
        development: [`${a * x + b} = ${a}x + ${b}`, `${a * x} = ${a}x`, `x = ${x}`],
        operations: ['', `− ${b}`, `: ${a}`],
        x,
        vars: { x, a, b },
      }
    },
  },
  {
    id: 'q1-10',
    build: (rng, o) => {
      let x = v(o, 'x', int(rng, 3, 14))
      if (x < 3) x = 3
      const a = Math.max(2, v(o, 'a', int(rng, 2, 8)))
      const b = Math.max(1, Math.min(a * x - 1, v(o, 'b', int(rng, 1, a * x - 1))))
      return {
        equation: `${a * x - b} = ${a}x − ${b}`,
        development: [`${a * x - b} = ${a}x − ${b}`, `${a * x} = ${a}x`, `x = ${x}`],
        operations: ['', `+ ${b}`, `: ${a}`],
        x,
        vars: { x, a, b },
      }
    },
  },
]

function expandQ1Pool(): EqTemplate[] {
  const base = [...Q1_TEMPLATES]
  const extras: EqTemplate[] = []
  for (let i = 0; i < 40; i++) {
    const src = base[i % base.length]!
    extras.push({
      id: `q1-${11 + i}`,
      build: (rng, o) => src.build(rng, o),
    })
  }
  return [...base, ...extras]
}

/** Q2 : x à gauche et à droite ; fractions possibles. */
const Q2_TEMPLATES: EqTemplate[] = [
  {
    id: 'q2-01',
    build: (rng, o) => {
      const x = v(o, 'x', int(rng, 2, 12))
      const a = Math.max(3, v(o, 'a', int(rng, 3, 8)))
      const c = Math.max(1, Math.min(a - 1, v(o, 'c', int(rng, 1, a - 1))))
      const b = Math.max(1, v(o, 'b', int(rng, 1, 10)))
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
        vars: { x, a, b, c },
      }
    },
  },
  {
    id: 'q2-02',
    build: (rng, o) => {
      const x = v(o, 'x', int(rng, 2, 12))
      const a = Math.max(3, v(o, 'a', int(rng, 3, 8)))
      const c = Math.max(1, Math.min(a - 1, v(o, 'c', int(rng, 1, a - 1))))
      const b = Math.max(1, v(o, 'b', int(rng, 1, 10)))
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
          vars: { x, a, b, c },
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
        vars: { x, a, b, c },
      }
    },
  },
  {
    id: 'q2-03',
    build: (rng, o) => {
      const den = Math.max(2, v(o, 'den', int(rng, 2, 6)))
      let x = v(o, 'x', int(rng, 2, 9) * den)
      if (x % den !== 0) x = Math.max(den, Math.round(x / den) * den)
      const c = Math.max(2, v(o, 'c', int(rng, 2, 5)))
      const b = Math.max(1, v(o, 'b', int(rng, 1, 8)))
      const k = x / den + b - c * x
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
          vars: { x, den, b, c },
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
        vars: { x, den, b, c },
      }
    },
  },
  {
    id: 'q2-04',
    build: (rng, o) => {
      const den = Math.max(2, v(o, 'den', int(rng, 2, 5)))
      let x = v(o, 'x', int(rng, 2, 8) * den)
      if (x % den !== 0) x = Math.max(den, Math.round(x / den) * den)
      const a = Math.max(2, v(o, 'a', int(rng, 2, 4)))
      const b = Math.max(1, v(o, 'b', int(rng, 1, 6)))
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
        vars: { x, a, b, den },
      }
    },
  },
  {
    id: 'q2-05',
    build: (rng, o) => {
      const x = v(o, 'x', int(rng, 2, 10))
      const a = Math.max(4, v(o, 'a', int(rng, 4, 9)))
      const c = Math.max(2, Math.min(a - 1, v(o, 'c', int(rng, 2, a - 1))))
      const b = Math.max(1, v(o, 'b', int(rng, 1, 9)))
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
          vars: { x, a, b, c },
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
        vars: { x, a, b, c },
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
      build: (rng, o) => src.build(rng, o),
    })
  }
  return [...base, ...extras]
}

const Q1_POOL = expandQ1Pool()
const Q2_POOL = expandQ2Pool()

export const TCM_EQUATIONS_Q1 = Q1_POOL
export const TCM_EQUATIONS_Q2 = Q2_POOL

export function equationTemplateById(id: string): EqTemplate | undefined {
  return Q1_POOL.find((t) => t.id === id) ?? Q2_POOL.find((t) => t.id === id)
}

export function equationKindForTemplate(id: string): 'q1' | 'q2' {
  return id.startsWith('q2') ? 'q2' : 'q1'
}

/** Remplit un modèle avec des paramètres imposés (édition libre). */
export function fillEquationTemplateWithVars(
  template: EqTemplate,
  vars: Record<string, number>,
): EqBuilt | null {
  try {
    const built = template.build(() => 0.5, vars)
    if (!Number.isFinite(built.x)) return null
    return built
  } catch {
    return null
  }
}

function fillFromPool(pool: EqTemplate[], rng: Rng, kind: 'q1' | 'q2'): MathItem {
  const order = shuffle(rng, [...pool])
  for (const tpl of order) {
    try {
      const built = tpl.build(rng)
      if (!Number.isFinite(built.x)) continue
      return equationItem(built, tpl.id, kind)
    } catch {
      continue
    }
  }
  const x = 5
  return equationItem(
    {
      equation: `x + 3 = 8`,
      development: [`x + 3 = 8`, `x = 5`],
      operations: ['', '− 3'],
      x,
      vars: { x, b: 3 },
    },
    'q1-01',
    'q1',
  )
}

/** Lot TCM ex. 34 : Q1 un côté, Q2 deux côtés (+ fractions possibles). */
export function generateTcmEquationsBatch(rng: Rng): MathItem[] {
  const q1Preferred = pick(rng, Q1_POOL)
  const q2Preferred = pick(rng, Q2_POOL)
  let q1: MathItem
  let q2: MathItem
  try {
    q1 = equationItem(q1Preferred.build(rng), q1Preferred.id, 'q1')
  } catch {
    q1 = fillFromPool(Q1_POOL, rng, 'q1')
  }
  try {
    q2 = equationItem(q2Preferred.build(rng), q2Preferred.id, 'q2')
  } catch {
    q2 = fillFromPool(Q2_POOL, rng, 'q2')
  }
  return [q1, q2]
}

export function tcmEquationsTemplateCounts(): { q1: number; q2: number } {
  return { q1: Q1_POOL.length, q2: Q2_POOL.length }
}
