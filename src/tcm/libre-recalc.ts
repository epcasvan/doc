/**
 * Recalcule les réponses des items TCM / TCM CFR après édition libre.
 * Appelé à la validation (bouton ✓ à côté du téléchargement).
 */
import { fmt, sanitizeFrNumberNoise } from '@/math/column-arith'
import type { ArithOp, Figure, MathItem } from '@/math/types'
import { fractionPartsFromItem, fractionTermFr } from '@/tcm/fraction-words'
import { columnItem, divisionColumnItem } from '@/tcm/items'
import { parseFrInt, parseFrNumber, parseOrderSequence } from './libre-parse'

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

function recalcColumn(item: MathItem): MathItem {
  const a = typeof item.a === 'number' ? item.a : parseFrNumber(String(item.a ?? ''))
  const b = typeof item.b === 'number' ? item.b : parseFrNumber(String(item.b ?? ''))
  const op = (item.op ?? '+') as ArithOp
  if (a == null || b == null) return item
  const result = computeOp(op, a, b)
  if (result == null || !Number.isFinite(result)) return item
  const empty = Boolean(item.blankOperands) || item.layout === 'column-empty'
  if (op === '÷') {
    const built = divisionColumnItem(a, b, empty)
    return { ...item, ...built, layout: item.layout }
  }
  const built = columnItem(op, a, b, result, empty)
  return { ...item, ...built, layout: item.layout }
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
  const units = ['m', 'dm', 'cm', 'mm'] as const
  type U = (typeof units)[number]
  const factors: Record<U, number> = { m: 1000, dm: 100, cm: 10, mm: 1 }
  const from = (item.convert?.from ?? 'm') as U
  const to = (item.convert?.to ?? 'cm') as U
  if (!(from in factors) || !(to in factors)) return item
  const value = parseFrNumber(item.convert?.value ?? '')
  if (value == null) return item
  const valueMm = value * factors[from]
  const result = valueMm / factors[to]
  return {
    ...item,
    convert: { value: fmt(value), from, to },
    prompt: `${fmt(value)} ${from} = □ ${to}`,
    answer: fmt(result),
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
  const n = Math.max(1, Math.round(fs.n))
  const d = Math.max(n + (fs.mode === 'read' ? 0 : 0), Math.round(fs.d))
  const safeD = Math.max(2, d)
  const safeN = Math.min(Math.max(1, n), safeD)
  const answer = `${safeN}/${safeD}`
  return {
    ...item,
    fracShape: { ...fs, n: safeN, d: safeD },
    answer: fs.mode === 'color' ? answer : answer,
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
  return item
}

function recalcSideFromArea(item: MathItem): MathItem {
  const prompt = item.prompt ?? ''
  const areaMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*cm²/i)
  const area = areaMatch ? parseFrNumber(areaMatch[1]!) : null
  if (area == null) return item
  if (item.figure === 'square') {
    const side = Math.round(Math.sqrt(area) * 1000) / 1000
    return {
      ...item,
      calcAnswer: `√${fmt(area)} = ${fmt(side)}`,
      propertyLines: [{ label: 'Côté', answer: `${fmt(side)} cm` }],
      answer: `${fmt(side)} cm`,
    }
  }
  if (item.figure === 'rectangle') {
    const known = parseFrNumber(String(item.dims?.length ?? item.dims?.width ?? ''))
    if (known == null || known === 0) return item
    const unknown = Math.round((area / known) * 1000) / 1000
    return {
      ...item,
      calcAnswer: `${fmt(area)} ÷ ${fmt(known)} = ${fmt(unknown)}`,
      propertyLines: [{ label: 'Côté', answer: `${fmt(unknown)} cm` }],
      answer: `${fmt(unknown)} cm`,
    }
  }
  return item
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

/** Recalcule un item selon son layout / type d’exercice. */
export function recalcTcmLibreItem(item: MathItem, exerciseType: string): MathItem {
  let next = cleanAnswerFloat(item)

  if (next.layout === 'order') return recalcOrder(next)
  if (next.layout === 'compare') return recalcCompare(next)
  if (next.layout === 'column' || next.layout === 'column-empty' || next.layout === 'division-column') {
    return recalcColumn(next)
  }
  if (next.convert) return recalcConvert(next)
  if (next.layout === 'place-value') return recalcPlaceValue(next)
  // Ex. 11 CFR : n/d → texte français + fraction.
  if (next.layout === 'inline' && exerciseType.includes('ex11')) {
    return recalcFractionWord(next)
  }
  if (next.layout === 'inline' && /\/\s*\d/.test(next.prompt ?? '')) return recalcFractionDecimal(next)
  if (
    next.layout === 'inline' &&
    (next.a != null || /^(-?\d|[□])/.test(next.prompt ?? '')) &&
    /[+\-−×÷*/]/.test(next.prompt ?? '') &&
    !/\/\s*\d/.test(next.prompt ?? '')
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
    if (exerciseType.includes('ex25') || exerciseType.includes('ex26') || /aire/i.test(next.prompt ?? '')) {
      return recalcSideFromArea(next)
    }
    return recalcDualGeo(next)
  }
  if (next.layout === 'geo' && (exerciseType.includes('ex25') || exerciseType.includes('ex26'))) {
    return recalcSideFromArea(next)
  }
  if (next.layout === 'text') return recalcTextProblem(next)
  if (next.layout === 'audio-dictation') {
    const n = parseFrNumber(next.answer ?? '')
    return n == null ? next : { ...next, answer: fmt(n) }
  }

  return next
}

export function recalcTcmLibreItems(items: MathItem[], exerciseType: string): MathItem[] {
  return items.map((item) => recalcTcmLibreItem(item, exerciseType))
}

export function isTcmFamilyExercise(typeId: string): boolean {
  return typeId.startsWith('tcm-')
}
