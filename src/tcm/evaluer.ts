/**
 * TCM ex. 33 — évaluer des expressions (3 inconnues).
 * Q1 : sans puissance ni fraction (≥ 6 termes).
 * Q2 : avec puissances et fractions empilées (dont binômes / binômes),
 *      ≥ 6 termes dont ≥ 2 hors de la fraction, reliés par + − ×.
 * 50 modèles par question.
 */
import { fmt } from '@/math/column-arith'
import { int, pick, shuffle, type Rng } from '@/math/rng'
import type { AlgebraGiven, MathItem } from '@/math/types'

export type TcmEvaluerBatch = {
  items: MathItem[]
  givens: AlgebraGiven[]
  instruction: string
}

const LETTERS = ['a', 'b', 'c', 'm', 'n', 'p', 't', 'v', 'x', 'y'] as const

export const TCM_EVALUER_Q1_COUNT = 50
export const TCM_EVALUER_Q2_COUNT = 50

type Template = { id: string; pattern: string }

/**
 * Placeholders :
 *   {U}{V}{W} — les 3 lettres (valeurs données)
 *   {a}…{j}  — coefficients entiers 2–9
 *   {U}² / {V}³ — puissances (Q2 uniquement)
 * Fractions composées : ({…})/({…}) → rendu empilé horizontal.
 */

/** Q1 : pas de / ni de puissance ; ≥ 6 termes (+ − × et parenthèses). */
const Q1_TEMPLATES: Template[] = [
  { id: 'q1-01', pattern: '{a}{U} + {b}{V} − {c}{W} + {d} + {e}{U} − {f}{V}' },
  { id: 'q1-02', pattern: '{a}{U} − {b}{V} + {c}{W} − {d} + {e}{V} + {f}{W}' },
  { id: 'q1-03', pattern: '{a}({U} + {V}) − {b}{W} + {c} + {d}{U} − {e}' },
  { id: 'q1-04', pattern: '{a}{U} + {b}({V} − {W}) + {c} − {d}{V} + {e}' },
  { id: 'q1-05', pattern: '{a}({U} − {V} + {W}) + {b} + {c}{U} − {d}{W}' },
  { id: 'q1-06', pattern: '{a}{U} · {b} + {c}{V} − {d}{W} + {e} − {f}' },
  { id: 'q1-07', pattern: '{a}{U} · {b} − {c}{V} + {d}{W} + {e}{U} − {f}' },
  { id: 'q1-08', pattern: '{a}{V} · {b} + {c}{U} − {d} + {e}{W} − {f}{U}' },
  { id: 'q1-09', pattern: '{a}({U} + {b}) − {c}{V} + {d}{W} − {e} + {f}' },
  { id: 'q1-10', pattern: '{a}({V} − {b}) + {c}{U} − {d}{W} + {e} + {f}{V}' },
  { id: 'q1-11', pattern: '{a}{U} + {b}{V} + {c}{W} − {d}{U} − {e}{V} + {f}' },
  { id: 'q1-12', pattern: '{a}{U} − {b} − {c}{V} + {d}{W} + {e}{U} − {f}{W}' },
  { id: 'q1-13', pattern: '{a}{W} + {b}({U} − {V}) − {c} + {d}{U} + {e}' },
  { id: 'q1-14', pattern: '{a}{U} · {b} + ({c} + {d}) − {e}{V} + {f}{W}' },
  { id: 'q1-15', pattern: '{a}({U} + {V} − {W}) − {b} + {c}{V} + {d}' },
  { id: 'q1-16', pattern: '{a}{U} − {b}{V} · {c} + {d}{W} + {e} − {f}' },
  { id: 'q1-17', pattern: '{a}{V} − {b}{U} · {c} + {d} + {e}{W} − {f}{V}' },
  { id: 'q1-18', pattern: '{a} + {b}{U} − {c}{V} + {d}{W} − {e} + {f}{U}' },
  { id: 'q1-19', pattern: '{a}{U} + {b} − {c}({V} + {W}) + {d}{V} − {e}' },
  { id: 'q1-20', pattern: '{a}({W} + {U}) − {b}{V} − {c} + {d}{W} + {e}' },
  { id: 'q1-21', pattern: '{a}{U} · {b} − {c} + {d}{V} − {e}{W} + {f}' },
  { id: 'q1-22', pattern: '{a}{V} · {b} − {c}{U} + {d} − {e}{W} + {f}{U}' },
  { id: 'q1-23', pattern: '{a}{W} · {b} + {c}{U} − {d}{V} − {e} + {f}' },
  { id: 'q1-24', pattern: '{a}({U} − {b}) + {c}({V} + {d}) − {e}{W}' },
  { id: 'q1-25', pattern: '{a}({V} + {b}) − {c}({W} − {d}) + {e}{U}' },
  { id: 'q1-26', pattern: '{a}{U} + {b}{V} − {c} − {d}{W} + {e}{U} · {f}' },
  { id: 'q1-27', pattern: '{a} − {b}{U} + {c}{V} − {d}{W} + {e}{V} − {f}' },
  { id: 'q1-28', pattern: '{a}{U} − {b}({V} − {W}) − {c} + {d}{W} + {e}' },
  { id: 'q1-29', pattern: '{a}{V} + {b}({U} + {W}) − {c}{U} − {d} + {e}' },
  { id: 'q1-30', pattern: '{a}{W} − {b}({U} + {V}) + {c} + {d}{U} − {e}' },
  { id: 'q1-31', pattern: '{a}{U} + {b}{V} · {c} − {d}{W} + {e} − {f}{U}' },
  { id: 'q1-32', pattern: '{a}{U} · {b} + {c}{V} · {d} − {e}{W} − {f}' },
  { id: 'q1-33', pattern: '{a}({U} + {V}) + {b}({W} − {c}) − {d} + {e}' },
  { id: 'q1-34', pattern: '{a}({U} − {V}) − {b}({W} + {c}) + {d}{V} + {e}' },
  { id: 'q1-35', pattern: '{a}{U} − {b} + {c}{V} − {d} + {e}{W} − {f}{V}' },
  { id: 'q1-36', pattern: '{a} + {b} − {c}{U} + {d}{V} − {e}{W} + {f}{U}' },
  { id: 'q1-37', pattern: '{a}{U} · {b} − ({c} + {d}) + {e}{V} − {f}{W}' },
  { id: 'q1-38', pattern: '{a}{V} · {b} + ({c} − {d}) − {e}{U} + {f}{W}' },
  { id: 'q1-39', pattern: '{a}({U} + {b} − {V}) + {c}{W} − {d} + {e}' },
  { id: 'q1-40', pattern: '{a}({V} − {b} + {W}) − {c}{U} + {d} − {e}' },
  { id: 'q1-41', pattern: '{a}{U} + {b}{W} − {c}{V} · {d} + {e} − {f}' },
  { id: 'q1-42', pattern: '{a}{W} − {b}{U} · {c} + {d}{V} + {e} − {f}' },
  { id: 'q1-43', pattern: '{a}{U} − {b}{V} + {c} − {d}{W} · {e} + {f}' },
  { id: 'q1-44', pattern: '{a}({U} + {W}) − {b} − {c}{V} + {d}{U} − {e}' },
  { id: 'q1-45', pattern: '{a}({V} + {W}) + {b} − {c}{U} − {d}{W} + {e}' },
  { id: 'q1-46', pattern: '{a}{U} · {b} + {c} − {d}{V} + {e}{W} − {f}{U}' },
  { id: 'q1-47', pattern: '{a}{V} · {b} − {c} + {d}{U} − {e}{W} + {f}' },
  { id: 'q1-48', pattern: '{a}{W} · {b} − {c}{U} + {d}{V} − {e} − {f}' },
  { id: 'q1-49', pattern: '{a} + {b}{U} − {c}({V} − {W}) − {d} + {e}{V}' },
  { id: 'q1-50', pattern: '{a} − {b}{V} + {c}({U} + {W}) − {d}{W} + {e}' },
]

/**
 * Q2 : fraction (souvent binôme/binôme) + au moins une puissance ; ≥ 6 termes ;
 * au moins 2 termes hors fraction (reliés par + − ×).
 */
const Q2_TEMPLATES: Template[] = [
  { id: 'q2-01', pattern: '({a}{U}² + {b}{V})/({c} − {d}{W}) + {e}{U} × {f}' },
  { id: 'q2-02', pattern: '({a}{U}² + {b}{V})/({c}{W} − {d}) − {e} + {f}{V}' },
  { id: 'q2-03', pattern: '({a}{V}² + {b})/({c} + {d}{U}) × {e} − {f}{W}' },
  { id: 'q2-04', pattern: '{a}{U}² + ({b}{V} − {c})/({d} − {e}{W}) − {f}' },
  { id: 'q2-05', pattern: '({a}{U} − {b}{W})/({c}{V} + {d}) + {e}{U}² − {f}' },
  { id: 'q2-06', pattern: '({a} + {b}{U}²)/({c} − {d}{V}) × {e} + {f}{W}' },
  { id: 'q2-07', pattern: '({a}{V}² + {b}{W})/({c} + {d}{U}) − {e}{V} × {f}' },
  { id: 'q2-08', pattern: '{a}{U}² × {b} + ({c}{V} + {d})/({e} − {f}{W})' },
  { id: 'q2-09', pattern: '({a}{U}² − {b})/({c}{W} + {d}) + {e}{V} − {f}' },
  { id: 'q2-10', pattern: '({a}{W} + {b}{U}²)/({c} − {d}{V}) × {e} − {f}' },
  { id: 'q2-11', pattern: '{a}{V}² − ({b}{U} + {c})/({d}{W} − {e}) + {f}' },
  { id: 'q2-12', pattern: '({a}{U} + {b}{V}²)/({c} − {d}) − {e}{W} × {f}' },
  { id: 'q2-13', pattern: '({a} − {b}{U})/({c}{V} − {d}{W}) + {e}{U}² + {f}' },
  { id: 'q2-14', pattern: '{a}{U}² × {b} + ({c}{V} − {d}{W})/({e} + {f})' },
  { id: 'q2-15', pattern: '({a}{V} − {b}{W})/({c}{U}² + {d}) + {e} − {f}{V}' },
  { id: 'q2-16', pattern: '({a}{U}² + {b}{W})/({c}{V} − {d}) × {e} − {f}' },
  { id: 'q2-17', pattern: '{a} + {b}{U}² − ({c}{V} + {d})/({e} − {f}{W})' },
  { id: 'q2-18', pattern: '({a}{W}² + {b}{U})/({c} − {d}{V}) − {e} × {f}' },
  { id: 'q2-19', pattern: '({a}{U} + {b})/({c} − {d}{W}) + {e}{V}² − {f}{U}' },
  { id: 'q2-20', pattern: '{a}{V} × {b} − ({c}{U}² + {d})/({e}{W} − {f})' },
  { id: 'q2-21', pattern: '({a}{U} − {b}{V})/({c} + {d}{W}) × {e} + {f}{U}²' },
  { id: 'q2-22', pattern: '({a}{V}² − {b}{U})/({c}{W} + {d}) + {e}{W} − {f}' },
  { id: 'q2-23', pattern: '{a}{W}² + ({b}{U} − {c}{V})/({d} − {e}) − {f}' },
  { id: 'q2-24', pattern: '({a} + {b}{V}²)/({c}{U} − {d}{W}) − {e} × {f}' },
  { id: 'q2-25', pattern: '({a}{U}² + {b}{V} − {c})/({d}{W} + {e}) + {f}' },
  { id: 'q2-26', pattern: '({a}{U}² + {b}{V} − {c})/({d} − {e}{W}) × {f}' },
  { id: 'q2-27', pattern: '{a}{U}² − {b} + ({c}{V} + {d}{W})/({e} − {f})' },
  { id: 'q2-28', pattern: '({a}{W} − {b})/({c} + {d}{U}²) + {e}{V} × {f}' },
  { id: 'q2-29', pattern: '({a}{U}² − {b}{V})/({c} − {d}{W}) + {e} × {f}' },
  { id: 'q2-30', pattern: '{a} × {b}{V}² + ({c}{U} − {d})/({e}{W} + {f})' },
  { id: 'q2-31', pattern: '({a}{V} + {b}{W})/({c}{U} − {d}) − {e}{U}² + {f}' },
  { id: 'q2-32', pattern: '({a} − {b}{W})/({c}{V}² + {d}) × {e}{U} − {f}' },
  { id: 'q2-33', pattern: '{a}{U} + ({b}{V}² − {c})/({d}{W} − {e}) − {f}' },
  { id: 'q2-34', pattern: '({a}{U}² + {b})/({c}{V} − {d}{W}) + {e} − {f}{V}' },
  { id: 'q2-35', pattern: '({a}{W} + {b}{V}²)/({c} − {d}{U}) × {e} − {f}' },
  { id: 'q2-36', pattern: '{a}{W} × {b} + ({c}{U}² − {d}{V})/({e} + {f})' },
  { id: 'q2-37', pattern: '({a}{U} − {b})/({c} − {d}{V}) + {e}{W}² − {f}{U}' },
  { id: 'q2-38', pattern: '({a}{V} − {b}{U}²)/({c}{W} + {d}) − {e} + {f}{W}' },
  { id: 'q2-39', pattern: '{a} − {b}{U}² + ({c}{V} − {d}{W})/({e} + {f})' },
  { id: 'q2-40', pattern: '({a}{U} + {b}{W})/({c}{V}² − {d}) × {e} + {f}' },
  { id: 'q2-41', pattern: '({a}{U}² − {b}{W})/({c} + {d}{V}) + {e}{V} × {f}' },
  { id: 'q2-42', pattern: '{a}{V}² × {b} − ({c} + {d}{U})/({e}{W} − {f})' },
  { id: 'q2-43', pattern: '({a} + {b}{W})/({c}{U}² − {d}) − {e}{V} + {f}' },
  { id: 'q2-44', pattern: '({a}{U} + {b}{V})/({c} − {d}) + {e}{W}² × {f}' },
  { id: 'q2-45', pattern: '({a}{V}² + {b}{U} − {c})/({d} − {e}{W}) + {f}' },
  { id: 'q2-46', pattern: '{a}{U}² + {b}{V} − ({c}{W} + {d})/({e} − {f})' },
  { id: 'q2-47', pattern: '({a}{W}² − {b}{V})/({c}{U} + {d}) × {e} − {f}' },
  { id: 'q2-48', pattern: '({a}{U}² − {b}{V} + {c})/({d}{W} − {e}) − {f}' },
  { id: 'q2-49', pattern: '{a} × ({b}{U}² + {c})/({d} − {e}{V}) − {f}{W}' },
  { id: 'q2-50', pattern: '({a}{V} + {b}{W} − {c})/({d}{U}² + {e}) + {f}' },
]

function coef(rng: Rng): number {
  return int(rng, 2, 9)
}

function nonzeroValue(rng: Rng): number {
  let n = 0
  while (n === 0) n = int(rng, -6, 6)
  return n
}

function formatAnswer(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 1e-8) return String(Math.round(value))
  const rounded = Math.round(value * 100) / 100
  if (Math.abs(rounded - value) < 1e-8) return String(rounded).replace('.', ',')
  return String(Math.round(value * 1000) / 1000).replace('.', ',')
}

/** Évalue une expression scolaire en substituant les 3 lettres. */
export function evalEvaluerExpression(expr: string, vars: Record<string, number>): number {
  let js = expr
  // Puissances de lettres avant les lettres nues.
  for (const [letter, value] of Object.entries(vars)) {
    const re2 = new RegExp(`${letter}²`, 'g')
    const re3 = new RegExp(`${letter}³`, 'g')
    const re1 = new RegExp(letter, 'g')
    js = js.replace(re2, `(${value}*${value})`)
    js = js.replace(re3, `(${value}*${value}*${value})`)
    js = js.replace(re1, `(${value})`)
  }
  js = js
    .replace(/×/g, '*')
    .replace(/·/g, '*')
    .replace(/−/g, '-')
    .replace(/(\d+)\(/g, '$1*(')
    .replace(/\)\(/g, ')*(')
  // eslint-disable-next-line no-new-func -- évaluation déterministe de modèles contrôlés
  return Function(`"use strict"; return (${js});`)() as number
}

function fmtSigned(n: number): string {
  return fmt(n).replace('-', '−')
}

/** Remplace les lettres (et puissances) par leurs valeurs numériques. */
function substituteEvaluerPrompt(prompt: string, vars: Record<string, number>): string {
  let out = prompt
  // Plus longues d’abord (² / ³ avant lettre nue).
  const letters = Object.keys(vars).sort((a, b) => b.length - a.length)
  for (const letter of letters) {
    const value = vars[letter]!
    const v = fmtSigned(value)
    const wrapped = value < 0 ? `(${v})` : v
    out = out.replace(new RegExp(`${letter}³`, 'g'), `${wrapped}³`)
    out = out.replace(new RegExp(`${letter}²`, 'g'), `${wrapped}²`)
    // Coeff collé : 2a → 2×(valeur) ; lettre seule → valeur.
    out = out.replace(new RegExp(`(\\d)${letter}\\b`, 'g'), `$1×${wrapped}`)
    out = out.replace(new RegExp(`\\b${letter}\\b`, 'g'), wrapped)
  }
  return out
}

function developEvaluerSteps(
  prompt: string,
  answer: string,
  vars: Record<string, number>,
): string[] {
  const substituted = substituteEvaluerPrompt(prompt, vars)
  const steps = [prompt]
  if (substituted !== prompt) steps.push(substituted)
  if (answer !== steps[steps.length - 1]) steps.push(answer)
  return steps
}

export type EvaluerFilled = {
  prompt: string
  answer: string
  development: string[]
  /** Coefficients a–j du modèle + valeurs des 3 lettres. */
  vars: Record<string, number>
  letters: [string, string, string]
}

/** Clés de coefficients présentes dans le motif. */
export function evaluerCoefKeysInPattern(pattern: string): string[] {
  const found = new Set<string>()
  for (const m of pattern.matchAll(/\{([a-j])\}/g)) found.add(m[1]!)
  return [...found].sort()
}

function renderEvaluerPattern(
  pattern: string,
  letters: [string, string, string],
  coefs: Record<string, number>,
): string {
  const [U, V, W] = letters
  let prompt = pattern
  prompt = prompt.replace(/\{U\}²/g, `${U}²`)
  prompt = prompt.replace(/\{V\}²/g, `${V}²`)
  prompt = prompt.replace(/\{W\}²/g, `${W}²`)
  prompt = prompt.replace(/\{U\}³/g, `${U}³`)
  prompt = prompt.replace(/\{V\}³/g, `${V}³`)
  prompt = prompt.replace(/\{W\}³/g, `${W}³`)
  prompt = prompt.replace(/\{U\}/g, U)
  prompt = prompt.replace(/\{V\}/g, V)
  prompt = prompt.replace(/\{W\}/g, W)
  prompt = prompt.replace(/\{([a-j])\}/g, (_, key: string) => String(coefs[key] ?? 2))
  return prompt
}

/**
 * Remplit un modèle avec coefficients / lettres imposés (édition libre).
 * `vars` mélange coeffs a–j et valeurs des lettres (clés = lettres choisies).
 */
export function fillEvaluerTemplateWithVars(
  template: Template,
  letters: [string, string, string],
  vars: Record<string, number>,
  preferInteger = false,
): EvaluerFilled | null {
  const coefKeys = evaluerCoefKeysInPattern(template.pattern)
  const coefs: Record<string, number> = {}
  for (const k of coefKeys) {
    const n = vars[k]
    coefs[k] = n == null ? 2 : Math.max(1, Math.min(9, Math.round(n)))
  }
  const letterVars: Record<string, number> = {}
  for (const letter of letters) {
    let n = vars[letter]
    if (n == null || n === 0) n = 2
    n = Math.max(-9, Math.min(9, Math.round(n)))
    if (n === 0) n = 2
    letterVars[letter] = n
  }
  const prompt = renderEvaluerPattern(template.pattern, letters, coefs)
  let value: number
  try {
    value = evalEvaluerExpression(prompt, letterVars)
  } catch {
    return null
  }
  if (!Number.isFinite(value) || Math.abs(value) > 800) return null
  if (preferInteger && Math.abs(value - Math.round(value)) > 1e-8) return null
  if (!preferInteger && Math.abs(value - Math.round(value * 100) / 100) > 1e-8) return null
  const answer = formatAnswer(value)
  return {
    prompt,
    answer,
    development: developEvaluerSteps(prompt, answer, letterVars),
    vars: { ...coefs, ...letterVars },
    letters,
  }
}

function fillTemplate(
  template: Template,
  letters: [string, string, string],
  values: [number, number, number],
  rng: Rng,
  preferInteger: boolean,
): EvaluerFilled | null {
  const baseVars: Record<string, number> = {
    [letters[0]]: values[0],
    [letters[1]]: values[1],
    [letters[2]]: values[2],
  }
  for (let attempt = 0; attempt < 80; attempt++) {
    const vals: Record<string, number> = { ...baseVars }
    for (const ch of 'abcdefghij') vals[ch] = coef(rng)
    const filled = fillEvaluerTemplateWithVars(template, letters, vals, preferInteger)
    if (filled) return filled
  }
  return null
}

function makeEvaluerItem(
  template: Template,
  filled: EvaluerFilled,
  kind: 'q1' | 'q2',
): MathItem {
  const coefKeys = evaluerCoefKeysInPattern(template.pattern)
  const letterKeys = [...filled.letters]
  const keys = [...coefKeys, ...letterKeys]
  return {
    layout: 'algebra',
    prompt: filled.prompt,
    answer: filled.answer,
    development: filled.development,
    calcAnswer: filled.development.join('\n'),
    problemTemplateId: template.id,
    problemVars: Object.fromEntries(keys.map((k) => [k, filled.vars[k] ?? 2])),
    problemVarDefs: keys.map((k) => ({
      key: k,
      label: letterKeys.includes(k) ? `Valeur ${k}` : `Coeff. ${k}`,
      editOn: 'both' as const,
    })),
    unknowns: letterKeys,
    labels: ['evaluer', kind],
  }
}

export const TCM_EVALUER_Q1 = Q1_TEMPLATES
export const TCM_EVALUER_Q2 = Q2_TEMPLATES

export function evaluerTemplateById(id: string): Template | undefined {
  return Q1_TEMPLATES.find((t) => t.id === id) ?? Q2_TEMPLATES.find((t) => t.id === id)
}

export function evaluerKindForTemplate(id: string): 'q1' | 'q2' {
  return id.startsWith('q2') ? 'q2' : 'q1'
}

/** Lot TCM ex. 33 : 2 questions, 3 inconnues communes, 50 modèles/question. */
export function generateTcmEvaluerBatch(rng: Rng): TcmEvaluerBatch {
  const picked = shuffle(rng, [...LETTERS]).slice(0, 3) as [string, string, string]
  const values: [number, number, number] = [
    nonzeroValue(rng),
    nonzeroValue(rng),
    nonzeroValue(rng),
  ]
  if (values[1] === values[0]) values[1] = values[0] === 3 ? 4 : 3
  if (values[2] === values[0] || values[2] === values[1]) {
    values[2] = [-5, -4, -3, -2, 2, 3, 4, 5].find((n) => n !== values[0] && n !== values[1]) ?? 2
  }

  const q1Preferred = pick(rng, Q1_TEMPLATES)
  const q2Preferred = pick(rng, Q2_TEMPLATES)

  const letterVars: Record<string, number> = {
    [picked[0]]: values[0],
    [picked[1]]: values[1],
    [picked[2]]: values[2],
  }

  const q1FallbackPrompt = `${2}${picked[0]} + ${3}${picked[1]} − ${4}${picked[2]} + 5 + ${2}${picked[0]} − ${picked[1]}`
  const q1FallbackAnswer = formatAnswer(
    2 * values[0] + 3 * values[1] - 4 * values[2] + 5 + 2 * values[0] - values[1],
  )
  const q2FallbackPrompt = `(${2}${picked[0]}² + ${3}${picked[1]})/(${5} − ${1}${picked[2]}) + ${2}${picked[0]} × ${3}`
  const q2FallbackAnswer = formatAnswer(
    (2 * values[0] * values[0] + 3 * values[1]) / (5 - values[2]) + 2 * values[0] * 3,
  )

  const q1Fallback: EvaluerFilled = {
    prompt: q1FallbackPrompt,
    answer: q1FallbackAnswer,
    development: developEvaluerSteps(q1FallbackPrompt, q1FallbackAnswer, letterVars),
    vars: { a: 2, b: 3, c: 4, d: 5, e: 2, f: 1, ...letterVars },
    letters: picked,
  }
  const q2Fallback: EvaluerFilled = {
    prompt: q2FallbackPrompt,
    answer: q2FallbackAnswer,
    development: developEvaluerSteps(q2FallbackPrompt, q2FallbackAnswer, letterVars),
    vars: { a: 2, b: 3, c: 5, d: 1, e: 2, f: 3, ...letterVars },
    letters: picked,
  }

  const q1 = attachTemplate(q1Preferred, picked, values, rng, true, Q1_TEMPLATES, 'q1', q1Fallback)
  const q2 = attachTemplate(q2Preferred, picked, values, rng, true, Q2_TEMPLATES, 'q2', q2Fallback)

  const givens: AlgebraGiven[] = [
    { letter: picked[0], value: values[0] },
    { letter: picked[1], value: values[1] },
    { letter: picked[2], value: values[2] },
  ]

  return {
    items: [q1, q2],
    givens,
    instruction:
      'Évaluez chaque expression avec les trois valeurs indiquées. Les deux questions utilisent les mêmes valeurs.',
  }
}

function attachTemplate(
  preferred: Template,
  letters: [string, string, string],
  values: [number, number, number],
  rng: Rng,
  preferInteger: boolean,
  pool: Template[],
  kind: 'q1' | 'q2',
  fallback: EvaluerFilled,
): MathItem {
  const direct = fillTemplate(preferred, letters, values, rng, preferInteger)
  if (direct) return makeEvaluerItem(preferred, direct, kind)
  const order = shuffle(rng, [...pool])
  for (const tpl of order) {
    const filled = fillTemplate(tpl, letters, values, rng, preferInteger)
    if (filled) return makeEvaluerItem(tpl, filled, kind)
  }
  if (preferInteger) {
    for (const tpl of order) {
      const filled = fillTemplate(tpl, letters, values, rng, false)
      if (filled) return makeEvaluerItem(tpl, filled, kind)
    }
  }
  return makeEvaluerItem(preferred, fallback, kind)
}

/** Exposé pour tests / catalogue. */
export function tcmEvaluerTemplateCounts(): { q1: number; q2: number } {
  return { q1: Q1_TEMPLATES.length, q2: Q2_TEMPLATES.length }
}
