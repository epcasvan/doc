/**
 * Recalcule les réponses des items TCM / TCM CFR après édition libre.
 * Appelé à la validation (bouton ✓ à côté du téléchargement).
 */
import { fmt, sanitizeFrNumberNoise } from '@/math/column-arith'
import type { ArithOp, Figure, MathItem } from '@/math/types'
import { mulAudioParts, numberAudioParts } from '@/tcm-cfr/audio-nombres'
import { clampFracShapeCfr } from '@/math/fraction-shapes'
import { rebuildCountIconsItem } from '@/math/count-icons'
import {
  convertValue,
  formatConvertNumber,
  inferConvertFamily,
} from '@/tcm/convert-units'
import { fractionPartsFromItem, fractionTermFr } from '@/tcm/fraction-words'
import {
  equationKindForTemplate,
  equationTemplateById,
  fillEquationTemplateWithVars,
} from '@/tcm/equations'
import {
  evaluerKindForTemplate,
  evaluerTemplateById,
  fillEvaluerTemplateWithVars,
} from '@/tcm/evaluer'
import {
  fillPrioriteTemplate,
  fillPrioriteTemplateWithVars,
  prioriteKeysInPattern,
  prioriteTemplateById,
} from '@/tcm/priorite'
import { createRng } from '@/math/rng'
import {
  fillReduireQ1WithVars,
  fillReduireQ2WithVars,
  reduireTemplateById,
} from '@/tcm/reduire'
import { TCM_PROPORTION_KG_TEMPLATES } from '@/tcm/proportion-kg'
import {
  columnItem,
  divisionColumnItem,
  withFixedColumnWidth,
  withFixedDivisionWidth,
  withFixedDivisionWorkRows,
} from '@/tcm/items'
import { isCfrProblemExercise, rebuildProblemItems } from '@/tcm-cfr/problems'
import {
  parseFrInt,
  parseFrNumber,
  parseOrderSequence,
  parseRelatifNumber,
  parseRelatifPrompt,
} from './libre-parse'

const NAMED_FIGS: Record<
  string,
  { figure: Figure; name: string; props: [string, string]; dims?: MathItem['dims'] }
> = {
  square: { figure: 'square', name: 'carré', props: ['4 côtés égaux', '4 angles droits'], dims: { bare: true } },
  rectangle: {
    figure: 'rectangle',
    name: 'rectangle',
    props: ['côtés opposés égaux', '4 angles droits'],
    dims: { bare: true },
  },
  rhombus: {
    figure: 'rhombus',
    name: 'losange',
    props: ['4 côtés égaux', 'angles opposés égaux'],
    dims: { bare: true },
  },
  parallelogram: {
    figure: 'parallelogram',
    name: 'parallélogramme',
    props: ['côtés opposés parallèles', 'côtés opposés égaux'],
    dims: { bare: true },
  },
  'triangle-right': {
    figure: 'triangle',
    name: 'triangle rectangle',
    props: ['un angle droit', '3 côtés'],
    dims: { bare: true, triangleKind: 'right' },
  },
  'triangle-equilateral': {
    figure: 'triangle',
    name: 'triangle équilatéral',
    props: ['3 côtés égaux', '3 angles égaux'],
    dims: { bare: true, triangleKind: 'equilateral' },
  },
  'triangle-isosceles': {
    figure: 'triangle',
    name: 'triangle isocèle',
    props: ['2 côtés égaux', '2 angles égaux'],
    dims: { bare: true, triangleKind: 'isosceles' },
  },
  circle: {
    figure: 'circle',
    name: 'cercle',
    props: ['tous les points à égale distance du centre', 'pas de côté'],
    dims: { bare: true },
  },
  trapezoid: {
    figure: 'trapezoid',
    name: 'trapèze',
    props: ['une paire de côtés parallèles', '4 côtés'],
    dims: { bare: true, trapezoidKind: 'isosceles' },
  },
  pentagon: {
    figure: 'pentagon',
    name: 'pentagone',
    props: ['5 côtés', '5 sommets'],
    dims: { bare: true },
  },
}

export function namedFigureKey(item: MathItem): string {
  if (item.figure === 'triangle') {
    const kind = item.dims?.triangleKind
    if (kind === 'right') return 'triangle-right'
    if (kind === 'equilateral') return 'triangle-equilateral'
    if (kind === 'isosceles') return 'triangle-isosceles'
    return 'triangle-isosceles'
  }
  return item.figure ?? 'square'
}

export function applyNamedFigure(item: MathItem, key: string, withProps: boolean): MathItem {
  const fig = NAMED_FIGS[key]
  if (!fig) return item
  const lines = withProps
    ? [
        { label: 'Nom', answer: fig.name },
        { label: 'Propriété 1', answer: fig.props[0] },
        { label: 'Propriété 2', answer: fig.props[1] },
      ]
    : [{ label: 'Nom', answer: fig.name }]
  return {
    ...item,
    figure: fig.figure,
    dims: fig.dims,
    propertyLines: lines,
    answer: withProps ? `${fig.name} ; ${fig.props[0]} ; ${fig.props[1]}` : fig.name,
  }
}

export const NAMED_FIGURE_OPTIONS = Object.entries(NAMED_FIGS).map(([key, fig]) => ({
  key,
  label: fig.name,
}))

function computeOp(op: string, a: number, b: number): number | null {
  if (op === '+') return a + b
  if (op === '−' || op === '-') return a - b
  if (op === '×' || op === '*') return a * b
  if (op === '÷' || op === '/') {
    if (b === 0) return null
    return a / b
  }
  return null
}

function isCfrColSeven(exerciseType: string): boolean {
  return (
    exerciseType.includes('ex07') ||
    exerciseType.includes('ex08') ||
    exerciseType.includes('ex09') ||
    exerciseType.includes('ex10')
  )
}

/** TCM CFR 7–8 ou TCM normal 17 : soustraction avec a > b obligatoire. */
function requiresSubAgtB(exerciseType: string): boolean {
  return (
    exerciseType.includes('ex07') ||
    exerciseType.includes('ex08') ||
    exerciseType === 'tcm-dec-add-sub'
  )
}

/** TCM CFR 9–10 ou TCM normal 18 : multiplicateur plafonné à 99. */
function capsMulBAt99(exerciseType: string): boolean {
  return (
    exerciseType.includes('ex09') ||
    exerciseType.includes('ex10') ||
    exerciseType === 'tcm-mul-mixte'
  )
}

/** TCM CFR 9–10 ou TCM normal 19 : division à largeurs 4/4 + 8 lignes de travail. */
function needsFixedDivisionGrid(exerciseType: string): boolean {
  return (
    exerciseType.includes('ex09') ||
    exerciseType.includes('ex10') ||
    exerciseType === 'tcm-div-mixte' ||
    exerciseType === 'tcm-mul-div-col'
  )
}

/** Largeur de grille imposée après édition libre (+ / − / ×). */
function fixedColumnWidth(exerciseType: string): number | null {
  if (isCfrColSeven(exerciseType)) return 7
  if (exerciseType === 'tcm-add-sub-col-3') return 4
  if (exerciseType === 'tcm-add-sub-col-4') return 5
  // TCM ex. 17 / 18 : grille vide 6 col.
  if (exerciseType === 'tcm-dec-add-sub' || exerciseType === 'tcm-mul-mixte') return 6
  return null
}

function recalcColumn(item: MathItem, exerciseType = ''): MathItem {
  const aRaw =
    typeof item.a === 'number'
      ? item.a
      : typeof item.dividend === 'number'
        ? item.dividend
        : parseFrNumber(String(item.a ?? item.dividend ?? ''))
  let bRaw =
    typeof item.b === 'number'
      ? item.b
      : typeof item.divisor === 'number'
        ? item.divisor
        : parseFrNumber(String(item.b ?? item.divisor ?? ''))
  const op = (item.op ?? '+') as ArithOp
  if (aRaw == null || bRaw == null) return { ...item, libreError: undefined }
  let a = aRaw
  let b = bRaw
  // Soustraction — le 1er nombre doit être strictement plus grand (CFR 7–8, TCM 17).
  if (requiresSubAgtB(exerciseType) && op === '−' && a <= b) {
    return {
      ...item,
      a,
      b,
      op,
      libreError: 'Pour une soustraction, le premier nombre doit être plus grand que le second.',
    }
  }
  // × : le multiplicateur (2ᵉ nombre) ne dépasse pas 99 (CFR 9–10, TCM 18).
  if (capsMulBAt99(exerciseType) && op === '×' && b > 99) {
    b = 99
  }
  const result = computeOp(op, a, b)
  if (result == null || !Number.isFinite(result)) return item
  const empty = Boolean(item.blankOperands) || item.layout === 'column-empty'
  if (op === '÷') {
    let built = divisionColumnItem(a, b, empty)
    if (needsFixedDivisionGrid(exerciseType)) {
      built = withFixedDivisionWorkRows(withFixedDivisionWidth(built, 4, 4))
    }
    return { ...item, ...built, layout: 'division-column', libreError: undefined }
  }
  const built = columnItem(op, a, b, result, empty)
  let next: MathItem = {
    ...item,
    ...built,
    layout: item.layout === 'column-empty' || empty ? built.layout : item.layout,
    // Force l’effacement des produits partiels si × 1 chiffre (évite 2 lignes fantômes).
    digitsPartials: built.digitsPartials,
    libreError: undefined,
  }
  const width = fixedColumnWidth(exerciseType)
  if (width != null) {
    next = withFixedColumnWidth(next, width)
  }
  return next
}

function recalcOrder(item: MathItem): MathItem {
  const nums = item.sequence?.length
    ? item.sequence.map((s) => parseFrNumber(s)).filter((n): n is number => n != null)
    : parseOrderSequence(item.prompt ?? '')
  if (nums.length < 2) {
    // Si l’utilisateur a seulement corrigé la réponse, synchroniser placeParts.
    const fromAns = parseOrderSequence(item.answer ?? '')
    if (fromAns.length >= 2) {
      const ascending = (item.orderOp ?? '<') === '<'
      const unordered = item.sequence ?? fromAns.map(fmt)
      return {
        ...item,
        sequence: unordered,
        placeParts: fromAns.map(fmt),
        answer: fromAns.map(fmt).join(ascending ? ' < ' : ' > '),
      }
    }
    return { ...item, answer: item.answer ? String(item.answer).replace(/0{5,}\d*/g, '') : item.answer }
  }
  const ascending = (item.orderOp ?? '<') === '<'
  const ordered = [...nums].sort((x, y) => (ascending ? x - y : y - x))
  const seq = (item.sequence?.length ? item.sequence : nums.map(fmt)).map((s) => {
    const n = parseFrNumber(s)
    return n == null ? s : fmt(n)
  })
  return {
    ...item,
    sequence: seq,
    placeParts: ordered.map(fmt),
    answer: ordered.map(fmt).join(ascending ? ' < ' : ' > '),
  }
}

function recalcCompare(item: MathItem): MathItem {
  const left = parseFrNumber(item.left ?? item.prompt ?? '')
  const right = parseFrNumber(item.right ?? '')
  if (left == null || right == null) return item
  const answer = left < right ? '<' : left > right ? '>' : '='
  return {
    ...item,
    left: fmt(left),
    right: fmt(right),
    prompt: fmt(left),
    answer,
  }
}

function recalcConvert(item: MathItem): MathItem {
  const from = item.convert?.from ?? 'm'
  const to = item.convert?.to ?? 'cm'
  const family =
    item.convert?.family ??
    inferConvertFamily(from, to)
  const value = parseFrNumber(item.convert?.value ?? '')
  if (value == null) return item
  const result = convertValue(value, from, to, family)
  if (result == null) return item
  const clean = Math.round(result * 1_000_000) / 1_000_000
  return {
    ...item,
    convert: {
      value: formatConvertNumber(value),
      from,
      to,
      family,
    },
    prompt: `${formatConvertNumber(value)} ${from} =`,
    answer: `${formatConvertNumber(clean)} ${to}`,
  }
}

function gcdFr(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

function formatFracSigned(n: number, d: number): string {
  if (d < 0) {
    n = -n
    d = -d
  }
  if (d === 1) return n < 0 ? `−${Math.abs(n)}` : String(n)
  return n < 0 ? `−${Math.abs(n)}/${d}` : `${n}/${d}`
}

/** TCM ex. 30 : reduce-partial, reduce, frac-op. */
function recalcFractionsMixte(item: MathItem): MathItem {
  const kind =
    item.labels?.find((l) => l.startsWith('frac-')) ??
    (/□/.test(item.prompt ?? '')
      ? 'frac-reduce-partial'
      : item.op
        ? 'frac-op'
        : 'frac-reduce')

  if (kind === 'frac-op') {
    const op = (item.op ?? '+') as ArithOp
    const n1 = typeof item.a === 'number' ? item.a : parseFrNumber(String(item.a ?? '')) ?? 1
    const n2 = typeof item.b === 'number' ? item.b : parseFrNumber(String(item.b ?? '')) ?? 1
    const d1 = parseFrNumber(item.left ?? '') ?? 2
    const d2 = parseFrNumber(item.right ?? '') ?? 2
    const safeD1 = Math.max(1, Math.round(d1))
    const safeD2 = Math.max(1, Math.round(d2))
    let rn = 0
    let rd = 1
    if (op === '+') {
      rn = n1 * safeD2 + n2 * safeD1
      rd = safeD1 * safeD2
    } else if (op === '−') {
      rn = n1 * safeD2 - n2 * safeD1
      rd = safeD1 * safeD2
    } else if (op === '×') {
      rn = n1 * n2
      rd = safeD1 * safeD2
    } else {
      rn = n1 * safeD2
      rd = safeD1 * (n2 === 0 ? 1 : n2)
    }
    if (rd < 0) {
      rn = -rn
      rd = -rd
    }
    const g = gcdFr(rn, rd)
    const sn = rn / g
    const sd = rd / g
    const show = (num: number, den: number) => formatFracSigned(num, den)
    return {
      ...item,
      op,
      a: n1,
      b: n2,
      left: String(safeD1),
      right: String(safeD2),
      labels: ['frac-op'],
      prompt: `${show(n1, safeD1)} ${op} ${show(n2, safeD2)} =`,
      answer: sd === 1 ? (sn < 0 ? `−${Math.abs(sn)}` : String(sn)) : show(sn, sd),
    }
  }

  const n = typeof item.a === 'number' ? item.a : parseFrNumber(String(item.a ?? '')) ?? 2
  const d = Math.max(
    1,
    typeof item.b === 'number' ? item.b : parseFrNumber(String(item.b ?? '')) ?? 4,
  )
  const g = gcdFr(n, d)
  const sn = n / g
  const sd = d / g
  if (kind === 'frac-reduce-partial') {
    const missNum =
      item.missing === 'a' ||
      (item.missing !== 'b' && (item.prompt ?? '').includes('□/'))
    return {
      ...item,
      a: n,
      b: d,
      missing: missNum ? 'a' : 'b',
      labels: ['frac-reduce-partial'],
      left: String(sn),
      right: String(sd),
      result: missNum ? sn : sd,
      prompt: missNum ? `${n}/${d} = □/${sd}` : `${n}/${d} = ${sn}/□`,
      answer: missNum ? String(sn) : String(sd),
    }
  }
  return {
    ...item,
    a: n,
    b: d,
    labels: ['frac-reduce'],
    left: String(sn),
    right: String(sd),
    prompt: `${n}/${d} =`,
    answer: sd === 1 ? String(sn) : `${sn}/${sd}`,
  }
}

function recalcFractionDecimal(item: MathItem): MathItem {
  const m = String(item.prompt ?? '').match(/(-?\d+)\s*\/\s*(-?\d+)/)
  if (!m) return item
  const n = Number(m[1])
  const d = Number(m[2])
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return item
  return {
    ...item,
    prompt: `${n}/${d} =`,
    answer: fmt(Math.round((n / d) * 1000) / 1000),
  }
}

function recalcFracShape(item: MathItem): MathItem {
  const fs = item.fracShape
  if (!fs) return item
  // Limites CFR (formes simples) pour TCM 20/21 et CFR 12/13.
  const clamped = clampFracShapeCfr(fs.kind, fs.n, fs.d)
  const answer = `${clamped.n}/${clamped.d}`
  return {
    ...item,
    fracShape: { ...fs, ...clamped },
    answer,
    prompt: fs.mode === 'color' ? `Coloriez ${answer}` : item.prompt,
  }
}

function recalcDualGeo(item: MathItem): MathItem {
  const dims = { ...(item.dims ?? {}) }
  const unit = dims.unit ?? 'cm'
  if (item.figure === 'square') {
    const side = parseFrNumber(String(dims.side ?? dims.length ?? ''))
    if (side == null) return item
    const peri = Math.round(4 * side * 1000) / 1000
    const area = Math.round(side * side * 1000) / 1000
    return {
      ...item,
      dims: { ...dims, side, length: side, unit },
      calcAnswer: `4 × ${fmt(side)}`,
      calcAnswerSecondary: `${fmt(side)} × ${fmt(side)}`,
      propertyLines: [
        { label: 'Périmètre', answer: `${fmt(peri)} ${unit}` },
        { label: 'Aire', answer: `${fmt(area)} ${unit}²` },
      ],
      answer: `Périmètre = ${fmt(peri)} ${unit} ; Aire = ${fmt(area)} ${unit}²`,
    }
  }
  if (item.figure === 'rectangle') {
    const length = parseFrNumber(String(dims.length ?? ''))
    const width = parseFrNumber(String(dims.width ?? ''))
    if (length == null || width == null) return item
    const peri = Math.round(2 * (length + width) * 1000) / 1000
    const area = Math.round(length * width * 1000) / 1000
    return {
      ...item,
      dims: { ...dims, length, width, unit },
      calcAnswer: `2 × (${fmt(length)} + ${fmt(width)})`,
      calcAnswerSecondary: `${fmt(length)} × ${fmt(width)}`,
      propertyLines: [
        { label: 'Périmètre', answer: `${fmt(peri)} ${unit}` },
        { label: 'Aire', answer: `${fmt(area)} ${unit}²` },
      ],
      answer: `Périmètre = ${fmt(peri)} ${unit} ; Aire = ${fmt(area)} ${unit}²`,
    }
  }
  if (item.figure === 'triangle') {
    const a = parseFrNumber(String(dims.a ?? ''))
    const b = parseFrNumber(String(dims.b ?? ''))
    const c = parseFrNumber(String(dims.c ?? ''))
    const h = parseFrNumber(String(dims.height ?? ''))
    if (a == null || b == null || c == null || h == null) return item
    const peri = Math.round((a + b + c) * 1000) / 1000
    const area = Math.round(((a * h) / 2) * 1000) / 1000
    return {
      ...item,
      dims: { ...dims, a, b, c, height: h, unit },
      calcAnswer: `${fmt(a)} + ${fmt(b)} + ${fmt(c)}`,
      calcAnswerSecondary: `(${fmt(a)} × ${fmt(h)}) ÷ 2`,
      propertyLines: [
        { label: 'Périmètre', answer: `${fmt(peri)} ${unit}` },
        { label: 'Aire', answer: `${fmt(area)} ${unit}²` },
      ],
      answer: `Périmètre = ${fmt(peri)} ${unit} ; Aire = ${fmt(area)} ${unit}²`,
    }
  }
  if (item.figure === 'parallelogram') {
    const base = parseFrNumber(String(dims.base ?? ''))
    const side = parseFrNumber(String(dims.side ?? ''))
    const height = parseFrNumber(String(dims.height ?? ''))
    if (base == null || side == null || height == null) return item
    const peri = Math.round(2 * (base + side) * 1000) / 1000
    const area = Math.round(base * height * 1000) / 1000
    return {
      ...item,
      dims: { ...dims, base, side, height, unit },
      calcAnswer: `2 × (${fmt(base)} + ${fmt(side)})`,
      calcAnswerSecondary: `${fmt(base)} × ${fmt(height)}`,
      propertyLines: [
        { label: 'Périmètre', answer: `${fmt(peri)} ${unit}` },
        { label: 'Aire', answer: `${fmt(area)} ${unit}²` },
      ],
      answer: `Périmètre = ${fmt(peri)} ${unit} ; Aire = ${fmt(area)} ${unit}²`,
    }
  }
  if (item.figure === 'rhombus') {
    const side = parseFrNumber(String(dims.side ?? ''))
    const d1 = parseFrNumber(String(dims.d1 ?? ''))
    const d2 = parseFrNumber(String(dims.d2 ?? ''))
    if (side == null || d1 == null || d2 == null) return item
    const peri = Math.round(4 * side * 1000) / 1000
    const area = Math.round(((d1 * d2) / 2) * 1000) / 1000
    return {
      ...item,
      dims: { ...dims, side, d1, d2, unit },
      calcAnswer: `4 × ${fmt(side)}`,
      calcAnswerSecondary: `(${fmt(d1)} × ${fmt(d2)}) ÷ 2`,
      propertyLines: [
        { label: 'Périmètre', answer: `${fmt(peri)} ${unit}` },
        { label: 'Aire', answer: `${fmt(area)} ${unit}²` },
      ],
      answer: `Périmètre = ${fmt(peri)} ${unit} ; Aire = ${fmt(area)} ${unit}²`,
    }
  }
  if (item.figure === 'trapezoid') {
    const top = parseFrNumber(String(dims.top ?? ''))
    const bottom = parseFrNumber(String(dims.bottom ?? ''))
    const leg = parseFrNumber(String(dims.c ?? dims.side ?? ''))
    const height = parseFrNumber(String(dims.height ?? ''))
    if (top == null || bottom == null || leg == null || height == null) return item
    const peri = Math.round((top + bottom + 2 * leg) * 1000) / 1000
    const area = Math.round((((top + bottom) * height) / 2) * 1000) / 1000
    return {
      ...item,
      dims: { ...dims, top, bottom, c: leg, height, unit },
      calcAnswer: `${fmt(top)} + ${fmt(bottom)} + 2 × ${fmt(leg)}`,
      calcAnswerSecondary: `(${fmt(top)} + ${fmt(bottom)}) × ${fmt(height)} ÷ 2`,
      propertyLines: [
        { label: 'Périmètre', answer: `${fmt(peri)} ${unit}` },
        { label: 'Aire', answer: `${fmt(area)} ${unit}²` },
      ],
      answer: `Périmètre = ${fmt(peri)} ${unit} ; Aire = ${fmt(area)} ${unit}²`,
    }
  }
  if (item.figure === 'circle') {
    const diameter = parseFrNumber(String(dims.diameter ?? (dims.radius != null ? dims.radius * 2 : '')))
    if (diameter == null || diameter <= 0) return item
    const r = diameter / 2
    const pi = 3.14
    const peri = Math.round(pi * diameter * 100) / 100
    const area = Math.round(pi * r * r * 1000) / 1000
    return {
      ...item,
      dims: { ...dims, diameter, radius: r, unit },
      calcAnswer: `3,14 × ${fmt(diameter)}`,
      calcAnswerSecondary: `3,14 × ${fmt(r)}²`,
      propertyLines: [
        { label: 'Périmètre', answer: `${fmt(peri)} ${unit}` },
        { label: 'Aire', answer: `${fmt(area)} ${unit}²` },
      ],
      answer: `Périmètre = ${fmt(peri)} ${unit} ; Aire = ${fmt(area)} ${unit}²`,
    }
  }
  return item
}

/** Remplace `[périmètre]`, `[côté]`… dans l’énoncé pour l’aperçu / l’impression. */
export function resolvePromptPlaceholders(item: MathItem): string {
  let text = item.prompt ?? ''
  const peri = item.dims?.perimeter
  if (peri != null && Number.isFinite(peri)) {
    const p = fmt(peri)
    text = text.replace(/\[périmètre\]/gi, p).replace(/\[perimetre\]/gi, p)
  }
  const known = item.dims?.length ?? item.dims?.width
  if (known != null && Number.isFinite(known)) {
    const k = fmt(known)
    text = text.replace(/\[côté\]/gi, k).replace(/\[cote\]/gi, k)
  }
  return text
}

function perimeterFromItem(item: MathItem): number | null {
  const fromDims = parseFrNumber(String(item.dims?.perimeter ?? ''))
  if (fromDims != null) return fromDims
  const prompt = item.prompt ?? ''
  // Ancien format ou valeur déjà substituée : « périmètre … N cm »
  const m = prompt.match(/périmètre[^0-9]*(\d+(?:[.,]\d+)?)\s*cm/i)
  if (m) return parseFrNumber(m[1]!)
  // Ancien ex. aire : √A pour le carré — conservé en secours.
  const areaMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*cm²/i)
  if (areaMatch && item.figure === 'square') {
    const area = parseFrNumber(areaMatch[1]!)
    if (area != null) return Math.round(4 * Math.sqrt(area) * 1000) / 1000
  }
  return null
}

function recalcSideFromPerimeter(item: MathItem): MathItem {
  const peri = perimeterFromItem(item)
  if (peri == null) return item
  const dims = { ...(item.dims ?? {}), perimeter: peri, unit: item.dims?.unit ?? 'cm' }
  if (item.figure === 'square') {
    const side = Math.round((peri / 4) * 1000) / 1000
    return {
      ...item,
      dims,
      calcAnswer: `${fmt(peri)} ÷ 4 = ${fmt(side)}`,
      propertyLines: [{ label: 'Côté', answer: `${fmt(side)} cm` }],
      answer: `${fmt(side)} cm`,
    }
  }
  if (item.figure === 'rectangle') {
    const known = parseFrNumber(String(dims.length ?? dims.width ?? ''))
    if (known == null || known === 0) return { ...item, dims }
    const unknown = Math.round((peri / 2 - known) * 1000) / 1000
    return {
      ...item,
      dims,
      calcAnswer: `${fmt(peri)} ÷ 2 − ${fmt(known)} = ${fmt(unknown)}`,
      propertyLines: [{ label: 'Côté', answer: `${fmt(unknown)} cm` }],
      answer: `${fmt(unknown)} cm`,
    }
  }
  return { ...item, dims }
}

function recalcSegments(item: MathItem): MathItem {
  const segs = item.segments
  if (!segs?.length) return item
  const next = segs.map((s) => {
    const mm =
      s.unit === 'cm'
        ? Math.round((parseFrNumber(s.display) ?? s.mm / 10) * 10)
        : (parseFrInt(s.display) ?? s.mm)
    const display = s.unit === 'cm' ? fmt(mm / 10) : String(mm)
    return { ...s, mm, display }
  })
  const letters = ['a', 'b', 'c'] as const
  const longest = next.reduce((best, s, i) => (s.mm > next[best]!.mm ? i : best), 0)
  const shortest = next.reduce((best, s, i) => (s.mm < next[best]!.mm ? i : best), 0)
  const opts = item.options ?? []
  const longFirst = (opts[0] ?? '').includes('long')
  return {
    ...item,
    segments: next,
    labels: next.map((s) => `${s.display} ${s.unit}`),
    answer: longFirst
      ? `${letters[longest]} ; ${letters[shortest]}`
      : `${letters[shortest]} ; ${letters[longest]}`,
  }
}

function recalcTextProblem(item: MathItem): MathItem {
  // Si calcAnswer / responseAnswer déjà édités manuellement, les garder ;
  // sinon tenter de dériver answer depuis calcAnswer « a op b = r ».
  const calc = item.calcAnswer ?? ''
  const m = calc.match(/(-?\d+(?:[.,]\d+)?)\s*([+\-−×÷*/])\s*(-?\d+(?:[.,]\d+)?)\s*=\s*(-?\d+(?:[.,]\d+)?)/)
  if (m) {
    const a = parseFrNumber(m[1]!)
    const b = parseFrNumber(m[3]!)
    const opRaw = m[2]!
    const op = (opRaw === '-' ? '−' : opRaw === '*' ? '×' : opRaw === '/' ? '÷' : opRaw) as ArithOp
    if (a != null && b != null) {
      const r = computeOp(op, a, b)
      if (r != null) {
        const answer = fmt(r)
        const response =
          item.responseAnswer?.replace(/-?\d+(?:[.,]\d+)?/, answer) ?? item.responseAnswer
        return {
          ...item,
          calcAnswer: `${fmt(a)} ${op} ${fmt(b)} = ${answer}`,
          responseAnswer: response,
          answer,
        }
      }
    }
  }
  // Nettoyage bruit flottant dans answer
  if (item.answer) {
    const n = parseFrNumber(item.answer)
    if (n != null) return { ...item, answer: fmt(n) }
  }
  return item
}

function cleanAnswerFloat(item: MathItem): MathItem {
  if (!item.answer) return item
  const n = parseFrNumber(item.answer)
  if (n == null) {
    const cleaned = sanitizeFrNumberNoise(item.answer)
    return cleaned === item.answer ? item : { ...item, answer: cleaned }
  }
  // Si c’est un seul nombre, reformater
  if (/^\s*-?\d+(?:[.,]\d+)?\s*$/.test(item.answer)) {
    return { ...item, answer: fmt(n) }
  }
  return {
    ...item,
    answer: sanitizeFrNumberNoise(
      item.answer.replace(/-?\d+(?:[.,]\d+)/g, (m) => {
        const v = parseFrNumber(m)
        return v == null ? m : fmt(v)
      }),
    ),
  }
}

/** Décomposition en millier / centaine / dizaine / unité selon la grandeur. */
function decomposePlaceValue(value: number): {
  placeParts: string[]
  labels: string[]
  prompt: string
} {
  const abs = Math.abs(Math.round(value))
  const u = abs % 10
  const d = Math.floor((abs % 100) / 10)
  const c = Math.floor((abs % 1000) / 100)
  const m = Math.floor(abs / 1000)
  if (abs >= 1000) {
    return {
      placeParts: [String(m * 1000), String(c * 100), String(d * 10), String(u)],
      labels: ['milliers', 'centaines', 'dizaines', 'unités'],
      prompt: abs.toLocaleString('fr-CH'),
    }
  }
  if (abs >= 100) {
    return {
      placeParts: [String(c * 100), String(d * 10), String(u)],
      labels: ['centaines', 'dizaines', 'unités'],
      prompt: String(abs),
    }
  }
  return {
    placeParts: [String(d * 10), String(u)],
    labels: ['dizaines', 'unités'],
    prompt: String(abs),
  }
}

function recalcPlaceValue(item: MathItem): MathItem {
  const value = parseFrInt(item.prompt ?? '')
  if (value == null) {
    if (item.placeParts?.length) {
      return { ...item, answer: item.placeParts.join(' + ') }
    }
    return item
  }
  const { placeParts, labels, prompt } = decomposePlaceValue(value)
  return {
    ...item,
    prompt,
    labels,
    placeParts,
    answer: placeParts.join(' + '),
  }
}

/** Ex. 11 : numérateur / dénominateur → terme français + réponse n/d. */
function recalcFractionWord(item: MathItem): MathItem {
  const parts = fractionPartsFromItem(item)
  if (!parts) return item
  const { n, d } = parts
  const term = fractionTermFr(n, d)
  if (!term) return item
  return {
    ...item,
    a: n,
    b: d,
    prompt: `${term} =`,
    answer: `${n}/${d}`,
  }
}

/** Calcul en ligne « a op b = □ » (ou a/b/result déjà stockés). */
function recalcInlineOp(item: MathItem): MathItem {
  const fromPrompt = String(item.prompt ?? '').match(
    /^(-?\d+(?:[.,]\d+)?|□)\s*([+\-−×÷*/])\s*(-?\d+(?:[.,]\d+)?|□)\s*=\s*(-?\d+(?:[.,]\d+)?|□)/,
  )
  let a = typeof item.a === 'number' ? item.a : null
  let b = typeof item.b === 'number' ? item.b : null
  let op = (item.op as string | undefined) ?? '+'
  if (fromPrompt) {
    const aRaw = fromPrompt[1]!
    const bRaw = fromPrompt[3]!
    op = fromPrompt[2]!
    if (aRaw !== '□') a = parseFrNumber(aRaw)
    if (bRaw !== '□') b = parseFrNumber(bRaw)
  }
  op = op === '-' ? '−' : op === '*' ? '×' : op === '/' ? '÷' : op
  if (a == null || b == null) return item
  const result = computeOp(op, a, b)
  if (result == null || !Number.isFinite(result)) return item
  const missing = item.missing ?? 'result'
  const leftA = missing === 'a' ? '□' : fmt(a)
  const leftB = missing === 'b' ? '□' : fmt(b)
  const right = missing === 'result' ? '□' : fmt(result)
  const answer = missing === 'a' ? fmt(a) : missing === 'b' ? fmt(b) : fmt(result)
  return {
    ...item,
    a,
    b,
    op: op as ArithOp,
    result,
    missing,
    prompt: `${leftA} ${op} ${leftB} = ${right}`,
    answer,
  }
}

/** Suite numérique : synchronise answer depuis blankIndexes + valeurs. */
function recalcSequence(item: MathItem): MathItem {
  const raw = item.sequence ?? []
  if (raw.length === 0) return item
  const blanks = [...(item.blankIndexes ?? [])].filter((i) => i >= 0 && i < raw.length)
  const values = raw.map((s, i) => {
    if (s !== '□') return s
    // Ancien format □ : tenter de récupérer depuis answer.
    const fromAns = (item.answer ?? '').split(/\s*;\s*/)
    const blankPos = (item.blankIndexes ?? []).indexOf(i)
    return blankPos >= 0 ? (fromAns[blankPos] ?? '') : ''
  })
  const answer = blanks.map((i) => values[i] ?? '').join(' ; ')
  return {
    ...item,
    sequence: values,
    blankIndexes: blanks,
    answer,
  }
}

const POW_SUP = ['', '¹', '²', '³', '⁴'] as const

function recalcPuissances(item: MathItem): MathItem {
  const kind =
    item.labels?.find((l) => l === 'power' || l === 'root' || l === 'sci-mul' || l === 'sci-div') ??
    (item.prompt?.startsWith('√')
      ? 'root'
      : /×\s*10/.test(item.prompt ?? '')
        ? 'sci-mul'
        : /÷\s*10/.test(item.prompt ?? '')
          ? 'sci-div'
          : 'power')
  const a = typeof item.a === 'number' ? item.a : parseFrNumber(String(item.a ?? ''))
  const b = typeof item.b === 'number' ? item.b : parseFrNumber(String(item.b ?? ''))
  if (kind === 'power') {
    if (a == null || b == null) return item
    const exp = Math.max(2, Math.min(4, Math.round(b)))
    const base =
      exp === 4 ? Math.max(1, Math.min(5, Math.round(a))) : Math.max(1, Math.min(9, Math.round(a)))
    return {
      ...item,
      a: base,
      b: exp,
      labels: ['power'],
      prompt: `${base}${POW_SUP[exp] ?? ''} =`,
      answer: String(base ** exp),
    }
  }
  if (kind === 'root') {
    if (a == null) return item
    const root = Math.max(1, Math.round(Math.sqrt(Math.abs(a))))
    const perfect = root * root
    return {
      ...item,
      a: perfect,
      b: root,
      labels: ['root'],
      prompt: `√${perfect} =`,
      answer: String(root),
    }
  }
  if (kind === 'sci-mul') {
    if (a == null || b == null) return item
    const exp = Math.max(1, Math.min(4, Math.round(b)))
    const tenths = Math.round(a * 10)
    return {
      ...item,
      a: tenths / 10,
      b: exp,
      labels: ['sci-mul'],
      prompt: `${fmt(tenths / 10)} × 10${POW_SUP[exp] ?? ''} =`,
      answer: fmt(tenths * 10 ** (exp - 1)),
    }
  }
  if (a == null || b == null) return item
  const exp = Math.max(1, Math.min(4, Math.round(b)))
  const w = Math.max(1, Math.round(a))
  return {
    ...item,
    a: w,
    b: exp,
    labels: ['sci-div'],
    prompt: `${w} ÷ 10${POW_SUP[exp] ?? ''} =`,
    answer: fmt(Number((w / 10 ** exp).toFixed(exp))),
  }
}

function recalcProportion(item: MathItem): MathItem {
  const isPct = item.labels?.includes('percent') || (item.prompt ?? '').includes('% de')
  if (isPct) {
    const pct = typeof item.a === 'number' ? item.a : parseFrNumber(String(item.a ?? ''))
    const n = typeof item.b === 'number' ? item.b : parseFrNumber(String(item.b ?? ''))
    if (pct == null || n == null) return item
    const value = (pct * n) / 100
    return {
      ...item,
      a: pct,
      b: n,
      result: value,
      labels: ['percent'],
      prompt: `${pct} % de ${n} est égal à`,
      answer: fmt(value),
      development: [`${pct}/100 × ${n}`, fmt(value)],
    }
  }
  const kgA = typeof item.a === 'number' ? item.a : parseFrNumber(String(item.a ?? ''))
  const priceA = typeof item.b === 'number' ? item.b : parseFrNumber(String(item.b ?? ''))
  const kgB = typeof item.result === 'number' ? item.result : parseFrNumber(String(item.result ?? ''))
  if (kgA == null || priceA == null || kgB == null || kgA === 0) return item
  const priceB = Math.round(((priceA * kgB) / kgA) * 1000) / 1000
  const tpl =
    TCM_PROPORTION_KG_TEMPLATES.find((t) => t.id === item.left) ?? TCM_PROPORTION_KG_TEMPLATES[0]!
  return {
    ...item,
    a: kgA,
    b: priceA,
    result: kgB,
    left: tpl.id,
    labels: ['kg-francs'],
    prompt: `${kgA} kg ${tpl.ofProduct} → ${priceA} francs\n${kgB} kg ${tpl.ofProduct} →`,
    answer: `${priceB} francs`,
    development: [`(${kgB} × ${priceA}) ÷ ${kgA}`, String(priceB)],
  }
}

/** Recalcule un item selon son layout / type d’exercice. */
export function recalcTcmLibreItem(item: MathItem, exerciseType: string): MathItem {
  let next = cleanAnswerFloat(item)

  if (
    next.layout === 'count-icons' ||
    exerciseType === 'nombres-compter-formes' ||
    next.countIcons
  ) {
    const scene = next.countIcons
    if (!scene) return next
    return rebuildCountIconsItem(createRng(41 + (scene.targetCount ?? 0) * 17), {
      targetKind: scene.targetKind,
      distractorA: scene.distractorA ?? 'star',
      distractorB: scene.distractorB ?? 'moon',
      targetCount: scene.targetCount,
      distractorACount: scene.distractorACount ?? 12,
      distractorBCount: scene.distractorBCount ?? 12,
    })
  }

  if (next.layout === 'sequence') return recalcSequence(next)
  if (next.layout === 'order') return recalcOrder(next)
  if (next.layout === 'compare') return recalcCompare(next)
  if (next.layout === 'column' || next.layout === 'column-empty' || next.layout === 'division-column') {
    return recalcColumn(next, exerciseType)
  }
  if (next.convert) return recalcConvert(next)
  if (next.layout === 'place-value') return recalcPlaceValue(next)
  if (
    exerciseType === 'tcm-puissances-mixte' ||
    next.labels?.some((l) => l === 'power' || l === 'root' || l === 'sci-mul' || l === 'sci-div')
  ) {
    return recalcPuissances(next)
  }
  if (
    exerciseType === 'tcm-proportion-kg' ||
    next.labels?.includes('percent') ||
    next.labels?.includes('kg-francs')
  ) {
    return recalcProportion(next)
  }
  if (
    exerciseType === 'tcm-priorite-ops' ||
    next.labels?.includes('priorite')
  ) {
    const tpl = prioriteTemplateById(next.problemTemplateId ?? '')
    if (tpl) {
      const filled =
        fillPrioriteTemplateWithVars(tpl, next.problemVars ?? {}) ??
        fillPrioriteTemplate(tpl, createRng(28))
      if (filled) {
        const keys = prioriteKeysInPattern(tpl.pattern)
        return {
          ...next,
          problemTemplateId: tpl.id,
          problemVars: Object.fromEntries(keys.map((k) => [k, filled.vars[k] ?? 2])),
          problemVarDefs: keys.map((k) => ({
            key: k,
            label: 'pqr'.includes(k) ? `Exposant ${k}` : `Valeur ${k}`,
            editOn: 'both' as const,
          })),
          prompt: filled.prompt,
          answer: filled.answer,
          development: filled.development,
          calcAnswer: filled.development.join('\n'),
          labels: ['priorite', tpl.kind],
        }
      }
    }
    return next
  }
  if (
    exerciseType === 'tcm-expressions-evaluer' ||
    next.labels?.includes('evaluer')
  ) {
    const tpl = evaluerTemplateById(next.problemTemplateId ?? '')
    if (tpl) {
      const letters = (next.unknowns?.length === 3
        ? (next.unknowns as [string, string, string])
        : ['x', 'y', 'z']) as [string, string, string]
      const kind = evaluerKindForTemplate(tpl.id)
      const filled = fillEvaluerTemplateWithVars(tpl, letters, next.problemVars ?? {}, false)
      if (filled) {
        return {
          ...next,
          problemTemplateId: tpl.id,
          problemVars: filled.vars,
          unknowns: [...filled.letters],
          prompt: filled.prompt,
          answer: filled.answer,
          development: filled.development,
          calcAnswer: filled.development.join('\n'),
          labels: ['evaluer', kind],
        }
      }
    }
    return next
  }
  if (
    exerciseType === 'tcm-expressions-reduire' ||
    next.labels?.includes('reduire')
  ) {
    if (next.problemTemplateId === 'sum' || next.labels?.includes('q1')) {
      return fillReduireQ1WithVars(next.problemVars ?? {}) ?? next
    }
    const tpl = reduireTemplateById(next.problemTemplateId ?? '')
    if (tpl) return fillReduireQ2WithVars(tpl, next.problemVars ?? {}) ?? next
    return next
  }
  if (exerciseType === 'tcm-equations' || next.labels?.includes('equations')) {
    const tpl = equationTemplateById(next.problemTemplateId ?? '')
    if (tpl) {
      const filled = fillEquationTemplateWithVars(tpl, next.problemVars ?? {})
      if (filled) {
        const kind = equationKindForTemplate(tpl.id)
        const keys = Object.keys(filled.vars).sort((a, b) => a.localeCompare(b))
        return {
          ...next,
          problemTemplateId: tpl.id,
          problemVars: filled.vars,
          problemVarDefs: keys.map((k) => ({
            key: k,
            label: k === 'x' ? 'Solution x' : `Paramètre ${k}`,
            editOn: 'both' as const,
          })),
          labels: ['equations', kind],
          prompt: filled.equation,
          development: filled.development,
          operations: filled.operations,
          calcAnswer: filled.development.join('\n'),
          responseAnswer: `x = ${fmt(filled.x)}`,
          answer: fmt(filled.x),
          unknowns: ['x'],
        }
      }
    }
    return next
  }
  if (exerciseType === 'tcm-relatifs-ops' || next.labels?.includes('relatif')) {
    const fromPrompt = parseRelatifPrompt(next.prompt ?? '')
    const a =
      typeof next.a === 'number'
        ? next.a
        : parseRelatifNumber(String(next.a ?? '')) ?? fromPrompt?.a ?? null
    const b =
      typeof next.b === 'number'
        ? next.b
        : parseRelatifNumber(String(next.b ?? '')) ?? fromPrompt?.b ?? null
    const op = (next.op ?? fromPrompt?.op ?? '+') as ArithOp
    if (a == null || b == null) return next
    const r = computeOp(op, a, b)
    if (r == null) return next
    const fmtR = (n: number) => (n >= 0 ? `(+${fmt(n)})` : `(−${fmt(Math.abs(n))})`)
    const ans =
      Math.abs(r - Math.round(r)) < 1e-8
        ? Math.round(r) >= 0
          ? `(+${Math.round(r)})`
          : `(−${Math.abs(Math.round(r))})`
        : r >= 0
          ? `(+${fmt(r)})`
          : `(−${fmt(Math.abs(r))})`
    return {
      ...next,
      a,
      b,
      op,
      result: r,
      labels: ['relatif'],
      prompt: `${fmtR(a)} ${op} ${fmtR(b)} =`,
      answer: ans,
    }
  }
  // Ex. 11 CFR : n/d → texte français + fraction.
  if (next.layout === 'inline' && exerciseType.includes('ex11')) {
    return recalcFractionWord(next)
  }
  // TCM ex. 30 — réduction partielle / complète / opérations sur fractions.
  if (
    exerciseType === 'tcm-fractions-mixte' ||
    next.labels?.some((l) => l.startsWith('frac-'))
  ) {
    return recalcFractionsMixte(next)
  }
  if (
    next.layout === 'inline' &&
    /\/\s*\d/.test(next.prompt ?? '') &&
    exerciseType !== 'tcm-fractions-mixte' &&
    !next.labels?.some((l) => l.startsWith('frac-'))
  ) {
    return recalcFractionDecimal(next)
  }
  if (
    next.layout === 'inline' &&
    (next.a != null || /^(-?\d|[□])/.test(next.prompt ?? '')) &&
    /[+\-−×÷*/]/.test(next.prompt ?? '') &&
    !/\/\s*\d/.test(next.prompt ?? '') &&
    !next.labels?.includes('relatif') &&
    !next.labels?.some((l) => l.startsWith('frac-'))
  ) {
    // Ne pas écraser les items « signe → mot » (ex. 6 CFR : prompt = « + »).
    if (/[=□]/.test(next.prompt ?? '') || next.a != null) return recalcInlineOp(next)
  }
  if (next.layout === 'fraction-shape') return recalcFracShape(next)
  if (next.layout === 'segment-measure') return recalcSegments(next)
  if (next.layout === 'geo' && next.geoNameCard) {
    const withProps = (next.propertyLines?.length ?? 0) > 1
    return applyNamedFigure(next, namedFigureKey(next), withProps)
  }
  if (next.layout === 'geo' && next.geoDualPads && (exerciseType.includes('ex22') || exerciseType.includes('ex23') || exerciseType.includes('ex24') || next.propertyLines?.some((l) => /Périmètre/i.test(l.label)))) {
    if (
      exerciseType.includes('ex25') ||
      exerciseType.includes('ex26') ||
      next.dims?.perimeter != null ||
      /\[périmètre\]|\[perimetre\]/i.test(next.prompt ?? '')
    ) {
      return recalcSideFromPerimeter(next)
    }
    return recalcDualGeo(next)
  }
  if (next.layout === 'geo' && (exerciseType.includes('ex25') || exerciseType.includes('ex26'))) {
    return recalcSideFromPerimeter(next)
  }
  if (next.layout === 'text') return recalcTextProblem(next)
  if (next.layout === 'audio-dictation') {
    if (exerciseType.includes('ex02')) {
      const a = parseFrNumber(next.left ?? '')
      const b = parseFrNumber(next.right ?? '')
      if (a == null || b == null) return next
      const aa = Math.max(1, Math.min(12, Math.round(a)))
      const bb = Math.max(1, Math.min(12, Math.round(b)))
      const parts = mulAudioParts(aa, bb)
      return {
        ...next,
        left: String(aa),
        right: String(bb),
        answer: String(aa * bb),
        audioParts: parts,
        audioSrc: parts[0],
      }
    }
    const n = parseFrNumber(next.answer ?? '')
    if (n == null) return next
    const nn = Math.max(1, Math.min(100, Math.round(n)))
    const parts = numberAudioParts(nn)
    return {
      ...next,
      answer: String(nn),
      audioParts: parts,
      audioSrc: parts[0],
    }
  }

  return next
}

export function recalcTcmLibreItems(items: MathItem[], exerciseType: string): MathItem[] {
  if (isCfrProblemExercise(exerciseType) && items.some((it) => it.problemTemplateId)) {
    const templateId = items.find((it) => it.problemTemplateId)?.problemTemplateId
    if (templateId) {
      const merged: Record<string, number> = {}
      for (const it of items) {
        if (it.problemVars) Object.assign(merged, it.problemVars)
      }
      const rebuilt = rebuildProblemItems(templateId, merged)
      if (rebuilt) return rebuilt
    }
  }
  return items.map((item) => recalcTcmLibreItem(item, exerciseType))
}

export function isTcmFamilyExercise(typeId: string): boolean {
  return typeId.startsWith('tcm-') || typeId === 'nombres-compter-formes'
}
