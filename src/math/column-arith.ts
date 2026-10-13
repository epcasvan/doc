/** Helpers arithmétiques en colonnes / fractions / décimaux (extrait de generate.ts). */
import { int, type Rng } from './rng'
import { roundToPlaces, type NumberRange } from './difficulty'
import type { ArithOp, DivisionStep, MathItem, MissingPos } from './types'

/**
 * Affichage scolaire FR : virgule, sans bruit binaire
 * (ex. 7,2700000000000005 → 7,27).
 */
export function fmt(n: number): string {
  if (!Number.isFinite(n)) return '0'
  const r = Math.round(n * 1_000_000) / 1_000_000
  if (Math.abs(r - Math.round(r)) < 1e-9) return String(Math.round(r))
  return r
    .toFixed(6)
    .replace(/\.?0+$/, '')
    .replace('.', ',')
}

/**
 * Nettoie le bruit binaire dans une chaîne affichée
 * (`7,2700000000000005`, `0.30000000000000004`, etc.).
 */
export function sanitizeFrNumberNoise(text: string): string {
  return text.replace(/-?\d+[.,]\d+/g, (raw) => {
    const normalized = raw.replace(',', '.')
    const n = Number(normalized)
    if (!Number.isFinite(n)) return raw.replace('.', ',')
    // Trop de décimales ou longue suite de 0 → reformater via fmt
    const frac = normalized.split('.')[1] ?? ''
    if (frac.length > 6 || /0{4,}/.test(frac) || /9999/.test(frac)) return fmt(n)
    return fmt(n)
  })
}

const TEXT_KEYS = [
  'answer',
  'prompt',
  'calcAnswer',
  'calcAnswerSecondary',
  'left',
  'right',
  'responseAnswer',
  'response',
  'expression',
] as const

/** Applique `fmt` / nettoyage de bruit binaire sur les champs texte d’un item. */
export function sanitizeItemNumberNoise<T extends Record<string, unknown>>(item: T): T {
  const out: Record<string, unknown> = { ...item }
  for (const key of TEXT_KEYS) {
    const v = out[key]
    if (typeof v === 'string') out[key] = sanitizeFrNumberNoise(v)
  }
  if (Array.isArray(out.propertyLines)) {
    out.propertyLines = out.propertyLines.map((line) => {
      if (!line || typeof line !== 'object') return line
      const row = line as { label?: string; answer?: string }
      return {
        ...row,
        ...(typeof row.answer === 'string' ? { answer: sanitizeFrNumberNoise(row.answer) } : {}),
      }
    })
  }
  if (Array.isArray(out.order)) {
    out.order = out.order.map((x) => (typeof x === 'string' ? sanitizeFrNumberNoise(x) : x))
  }
  if (Array.isArray(out.sequence)) {
    out.sequence = out.sequence.map((x) => (typeof x === 'string' ? sanitizeFrNumberNoise(x) : x))
  }
  if (Array.isArray(out.questions)) {
    out.questions = out.questions.map((q) => {
      if (!q || typeof q !== 'object') return q
      const row = q as { prompt?: string; answer?: string }
      return {
        ...row,
        ...(typeof row.prompt === 'string' ? { prompt: sanitizeFrNumberNoise(row.prompt) } : {}),
        ...(typeof row.answer === 'string' ? { answer: sanitizeFrNumberNoise(row.answer) } : {}),
      }
    })
  }
  return out as T
}

/** Entier de la plage libre, borné à [lo, hi] (la plage prime sur le niveau). */
export function rangeInt(rng: Rng, range: NumberRange, lo: number, hi: number): number {
  const a = Math.max(lo, Math.ceil(range.min))
  const b = Math.min(hi, Math.floor(range.max))
  if (b < a) return Math.min(hi, Math.max(lo, Math.round(range.max)))
  return int(rng, a, b)
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

function decimalPlacesOf(n: number): number {
  if (!Number.isFinite(n)) return 0
  for (let places = 0; places <= 3; places++) {
    const factor = 10 ** places
    if (Math.abs(n * factor - Math.round(n * factor)) < 1e-8) return places
  }
  return 3
}

function scaleInt(n: number, places: number): number {
  return Math.round(Math.abs(n) * 10 ** places)
}

/** Chiffres d’un entier (parties déjà mises à l’échelle). */
function digits(n: number, width: number): string[] {
  const s = String(Math.abs(Math.trunc(n))).padStart(width, ' ')
  return s.split('').map((ch) => (ch === ' ' ? '' : ch))
}

/**
 * Chiffres d’un nombre décimal : partie entière + décimales.
 * La case des unités garde un 0 si besoin (ex. 0,5).
 */
function digitsDecimal(n: number, intWidth: number, places: number): string[] {
  const scaled = scaleInt(n, places)
  const factor = 10 ** places
  const intPart = places > 0 ? Math.floor(scaled / factor) : scaled
  const fracPart = places > 0 ? scaled % factor : 0
  const intDigits = String(intPart)
    .padStart(intWidth, ' ')
    .split('')
    .map((ch) => (ch === ' ' ? '' : ch))
  if (places > 0 && intPart === 0) intDigits[intWidth - 1] = '0'
  if (places <= 0) return intDigits
  const fracDigits = String(fracPart).padStart(places, '0').split('')
  return [...intDigits, ...fracDigits]
}

function widthOf(...nums: number[]): number {
  return Math.max(1, ...nums.map((n) => String(Math.abs(Math.trunc(n))).length))
}

function intWidthOf(n: number, places: number): number {
  const scaled = scaleInt(n, places)
  const intPart = places > 0 ? Math.floor(scaled / 10 ** places) : scaled
  return Math.max(1, String(intPart).length)
}

/** Retenues (addition / × 1 chiffre) ou emprunts (soustraction) alignés sur les colonnes. */
function computeCarries(op: ArithOp, scaledA: number, scaledB: number, width: number): string[] {
  const da = digits(scaledA, width).map((d) => (d === '' ? 0 : Number(d)))
  const db = digits(scaledB, width).map((d) => (d === '' ? 0 : Number(d)))
  const carries = Array.from({ length: width }, () => '')
  if (op === '+') {
    let carry = 0
    for (let i = width - 1; i >= 0; i--) {
      if (carry > 0) carries[i] = String(carry)
      const sum = da[i]! + db[i]! + carry
      carry = Math.floor(sum / 10)
    }
  } else if (op === '−') {
    let borrow = 0
    for (let i = width - 1; i >= 0; i--) {
      const top = da[i]! - borrow
      const bottom = db[i]!
      if (top < bottom) {
        carries[i] = '1'
        borrow = 1
      } else {
        borrow = 0
      }
    }
  } else if (op === '×') {
    let carry = 0
    const mul = scaledB % 10
    for (let i = width - 1; i >= 0; i--) {
      if (carry > 0) carries[i] = String(carry)
      const prod = da[i]! * mul + carry
      carry = Math.floor(prod / 10)
    }
  }
  return carries
}

/** Chiffres d’un entier mis à l’échelle, avec 0 forcé dans la case des unités. */
function digitsScaledAligned(scaled: number, width: number, places: number): string[] {
  const cells = digits(scaled, width)
  if (places > 0) {
    const unitsIdx = width - places - 1
    if (unitsIdx >= 0 && cells[unitsIdx] === '') cells[unitsIdx] = '0'
  }
  return cells
}

/** × décimal × décimal (b à 1 décimale, 1,1–9,9) : produits partiels sur entiers mis à l’échelle. */
function columnMulDecimalItem(a: number, b: number, result: number, empty: boolean): MathItem {
  const placesA = Math.max(1, decimalPlacesOf(a))
  const placesB = Math.max(1, decimalPlacesOf(b))
  const places = placesA + placesB
  const sa = scaleInt(a, placesA)
  const sb = scaleInt(b, placesB)
  const units = sb % 10
  const tens = Math.floor(sb / 10)
  const partialUnits = sa * units
  const partialTens = sa * tens * 10
  const product = sa * sb
  const aScaled = sa * 10 ** (places - placesA)
  const bScaled = sb * 10 ** (places - placesB)
  const w = Math.max(
    1,
    String(product).length,
    String(aScaled).length,
    String(bScaled).length,
    String(partialUnits).length,
    String(partialTens).length,
  )
  return {
    layout: empty ? 'column-empty' : 'column',
    prompt: empty ? `${fmt(a)} × ${fmt(b)}` : undefined,
    op: '×',
    a,
    b,
    result,
    digitsA: digitsScaledAligned(aScaled, w, places),
    digitsB: digitsScaledAligned(bScaled, w, places),
    digitsPartials: [digits(partialUnits, w), digits(partialTens, w)],
    digitsResult: digitsScaledAligned(product, w, places),
    carries: computeCarries('×', aScaled, units, w),
    decimalPlaces: places,
    blankOperands: empty,
    answer: fmt(result),
  }
}

export function columnItem(op: ArithOp, a: number, b: number, result: number, empty: boolean): MathItem {
  if (op === '×' && (decimalPlacesOf(a) > 0 || decimalPlacesOf(b) > 0) && decimalPlacesOf(b) > 0) {
    return columnMulDecimalItem(a, b, result, empty)
  }
  const places =
    op === '×'
      ? Math.max(decimalPlacesOf(a), decimalPlacesOf(result))
      : Math.max(decimalPlacesOf(a), decimalPlacesOf(b), decimalPlacesOf(result))
  const sa = scaleInt(a, places)
  const sb = op === '×' ? Math.round(Math.abs(b)) : scaleInt(b, places)
  const intW = Math.max(
    intWidthOf(a, places),
    op === '×' ? String(Math.round(Math.abs(b))).length : intWidthOf(b, places),
    intWidthOf(result, places),
  )
  const w = intW + places
  return {
    layout: empty ? 'column-empty' : 'column',
    prompt: empty ? `${fmt(a)} ${op} ${fmt(b)}` : undefined,
    op,
    a,
    b,
    result,
    digitsA: digitsDecimal(a, intW, places),
    // × entier : multiplicateur aligné à droite.
    digitsB: op === '×' ? digits(sb, w) : digitsDecimal(b, intW, places),
    digitsResult: digitsDecimal(result, intW, places),
    carries: computeCarries(op, sa, sb, w),
    decimalPlaces: places > 0 ? places : undefined,
    blankOperands: empty,
    answer: fmt(result),
  }
}

/**
 * × 2 chiffres en colonnes : produits partiels (unités puis dizaines), puis somme.
 * `a` peut être décimal : calcul sur l’entier mis à l’échelle, virgule sur `a` et le résultat.
 */
export function twoDigitMulItem(a: number, b: number, empty: boolean): MathItem {
  const places = decimalPlacesOf(a)
  const scaledA = scaleInt(a, places)
  const units = b % 10
  const tens = Math.floor(b / 10)
  const partialUnits = scaledA * units
  const partialTens = scaledA * tens * 10
  const scaledResult = scaledA * b
  const result = roundToPlaces(a * b, places)
  const w = Math.max(widthOf(scaledA, b, partialUnits, partialTens, scaledResult), places + 1)
  return {
    layout: empty ? 'column-empty' : 'column',
    prompt: empty ? `${fmt(a)} × ${fmt(b)}` : undefined,
    op: '×',
    a,
    b,
    result,
    digitsA: digitsDecimal(a, w - places, places),
    digitsB: digits(b, w),
    digitsPartials: [digits(partialUnits, w), digits(partialTens, w)],
    digitsResult: digitsDecimal(result, w - places, places),
    carries: computeCarries('×', scaledA, units, w),
    decimalPlaces: places > 0 ? places : undefined,
    blankOperands: empty,
    answer: fmt(result),
  }
}

function padDigitRow(row: string[] | undefined, width: number): string[] {
  const src = row ?? []
  if (src.length >= width) return src
  return [...Array.from({ length: width - src.length }, () => ''), ...src]
}

/** Pad à droite (décimales) puis à gauche (partie entière) pour aligner la virgule. */
function padDecimalRow(
  row: string[] | undefined,
  places: number,
  targetPlaces: number,
  totalWidth: number,
): string[] {
  const src = row ?? []
  const p = Math.max(0, places)
  const frac = p > 0 ? src.slice(Math.max(0, src.length - p)) : []
  const intPart = p > 0 ? src.slice(0, Math.max(0, src.length - p)) : [...src]
  while (frac.length < targetPlaces) frac.push(p > 0 || targetPlaces > 0 ? '0' : '')
  return padDigitRow([...intPart, ...frac], totalWidth)
}

/** Aligne tous les tableaux en colonnes d’une fiche sur la même largeur (et ligne de retenues). */
export function normalizeColumnLayouts(items: MathItem[]): MathItem[] {
  const columnItems = items.filter(
    (item) => item.layout === 'column' || item.layout === 'column-empty',
  )
  if (columnItems.length === 0) return items
  const maxPlaces = Math.max(0, ...columnItems.map((item) => item.decimalPlaces ?? 0))
  const maxIntWidth = Math.max(
    1,
    ...columnItems.map((item) => {
      const places = item.decimalPlaces ?? 0
      const len = Math.max(
        item.digitsA?.length ?? 0,
        item.digitsB?.length ?? 0,
        item.digitsResult?.length ?? 0,
        item.carries?.length ?? 0,
        ...(item.digitsPartials?.map((row) => row.length) ?? [0]),
      )
      return Math.max(1, len - places)
    }),
  )
  const maxWidth = maxIntWidth + maxPlaces
  const maxPartials = Math.max(0, ...columnItems.map((item) => item.digitsPartials?.length ?? 0))
  return items.map((item) => {
    if (item.layout !== 'column' && item.layout !== 'column-empty') return item
    const places = item.decimalPlaces ?? 0
    const partials = item.digitsPartials ?? []
    const padRow = (row: string[] | undefined) =>
      maxPlaces > 0 || places > 0
        ? padDecimalRow(row, places, maxPlaces, maxWidth)
        : padDigitRow(row, maxWidth)
    const paddedPartials =
      maxPartials > 0
        ? Array.from({ length: maxPartials }, (_, i) => padRow(partials[i]))
        : undefined
    const bIsDecimal =
      item.op === '×' && typeof item.b === 'number' && decimalPlacesOf(item.b) > 0
    return {
      ...item,
      digitsA: padRow(item.digitsA),
      // × entier : aligné à droite ; × décimal : même alignement de virgule.
      digitsB:
        item.op === '×' && !bIsDecimal ? padDigitRow(item.digitsB, maxWidth) : padRow(item.digitsB),
      digitsResult: padRow(item.digitsResult),
      carries: padRow(item.carries ?? Array.from({ length: maxWidth }, () => '')),
      digitsPartials: paddedPartials,
      decimalPlaces: maxPlaces > 0 ? maxPlaces : undefined,
    }
  })
}

function buildDivisionSteps(digitsStr: string, divisor: number): DivisionStep[] {
  const steps: DivisionStep[] = []
  let current = 0
  for (let i = 0; i < digitsStr.length; i++) {
    current = current * 10 + Number(digitsStr[i] || 0)
    if (current < divisor && steps.length === 0 && i < digitsStr.length - 1) continue
    const qDigit = Math.floor(current / divisor)
    const product = qDigit * divisor
    const rem = current - product
    steps.push({
      bringDown: String(current),
      product: String(product),
      remainder: String(rem),
      endCol: i,
    })
    current = rem
  }
  return steps
}

function placeDigitsAtEnd(value: string, width: number, endCol: number): string[] {
  const row = Array.from({ length: width }, () => '')
  const start = Math.max(0, endCol - value.length + 1)
  for (let k = 0; k < value.length; k++) {
    const col = start + k
    if (col >= 0 && col < width) row[col] = value[k]!
  }
  return row
}

export function divisionColumnItem(dividend: number, divisor: number, empty: boolean): MathItem {
  const places = Math.max(decimalPlacesOf(dividend), decimalPlacesOf(dividend / divisor))
  const scale = 10 ** places
  const scaledDividend = scaleInt(dividend, places)
  const scaledQuotient = Math.floor(scaledDividend / divisor)
  const remainder = scaledDividend % divisor
  const quotient = places > 0 ? scaledQuotient / scale : scaledQuotient
  const intW = intWidthOf(dividend, places)
  const digitsA = digitsDecimal(dividend, intW, places)
  const width = digitsA.length
  const digitsStr = digitsA.map((d) => (d === '' ? '0' : d)).join('')
  const steps = buildDivisionSteps(digitsStr, divisor)
  const workRows: string[][] = []
  for (const step of steps) {
    workRows.push(placeDigitsAtEnd(step.product, width, step.endCol))
    workRows.push(placeDigitsAtEnd(step.remainder, width, step.endCol))
  }
  // Au moins 2 lignes de travail (1 étape) pour la fiche élève.
  while (workRows.length < 2) {
    workRows.push(Array.from({ length: width }, () => ''))
  }
  const qIntW = Math.max(1, String(Math.floor(Math.abs(quotient))).length)
  return {
    layout: 'division-column',
    op: '÷',
    prompt: empty ? `${fmt(dividend)} ÷ ${fmt(divisor)}` : undefined,
    dividend,
    divisor,
    quotient,
    remainder: places > 0 ? remainder / scale : remainder,
    digitsA,
    digitsB: String(divisor).split(''),
    digitsResult: digitsDecimal(quotient, qIntW, places),
    digitsPartials: workRows,
    digitsRemainder: digits(remainder, Math.max(1, String(remainder).length)),
    divisionSteps: steps,
    decimalPlaces: places > 0 ? places : undefined,
    blankOperands: empty,
    answer:
      remainder && places === 0
        ? `${scaledQuotient} reste ${remainder}`
        : fmt(quotient),
  }
}

/** Aligne les divisions posées d’une fiche (même largeur / même nb de lignes de travail). */
export function normalizeDivisionLayouts(items: MathItem[]): MathItem[] {
  const divItems = items.filter((item) => item.layout === 'division-column')
  if (divItems.length === 0) return items
  const maxWidth = Math.max(1, ...divItems.map((item) => item.digitsA?.length ?? 0))
  const maxWork = Math.max(2, ...divItems.map((item) => item.digitsPartials?.length ?? 0))
  const maxDivisor = Math.max(1, ...divItems.map((item) => item.digitsB?.length ?? 0))
  const maxQuotient = Math.max(1, ...divItems.map((item) => item.digitsResult?.length ?? 0))
  const maxRem = Math.max(1, ...divItems.map((item) => item.digitsRemainder?.length ?? 0))
  return items.map((item) => {
    if (item.layout !== 'division-column') return item
    const work = item.digitsPartials ?? []
    return {
      ...item,
      digitsA: padDigitRow(item.digitsA, maxWidth),
      digitsB: padDigitRow(item.digitsB, maxDivisor),
      digitsResult: padDigitRow(item.digitsResult, maxQuotient),
      digitsRemainder: padDigitRow(item.digitsRemainder, maxRem),
      digitsPartials: Array.from({ length: maxWork }, (_, i) =>
        padDigitRow(work[i] ?? Array.from({ length: maxWidth }, () => ''), maxWidth),
      ),
    }
  })
}

export function inlineOp(op: ArithOp, a: number, b: number, result: number, missing: MissingPos = 'result'): MathItem {
  const leftA = missing === 'a' ? '□' : fmt(a)
  const leftB = missing === 'b' ? '□' : fmt(b)
  const right = missing === 'result' ? '□' : fmt(result)
  const answer = missing === 'a' ? fmt(a) : missing === 'b' ? fmt(b) : fmt(result)
  return {
    layout: missing === 'result' ? 'inline' : 'inline',
    prompt: `${leftA} ${op} ${leftB} = ${right}`,
    op,
    a,
    b,
    result,
    missing,
    answer,
  }
}

export function roundTo(n: number, unit: number): number {
  return Math.round(n / unit) * unit
}

export function frac(n: number, d: number): string {
  return `${n}/${d}`
}

export function simplify(n: number, d: number): [number, number] {
  const g = gcd(n, d)
  return [n / g, d / g]
}

export function dec(rng: Rng, maxInt = 20, places = 2): number {
  const scale = 10 ** places
  return int(rng, 1, maxInt * scale) / scale
}

export function decStr(n: number): string {
  return n.toFixed(2).replace('.', ',').replace(/,0+$/, '').replace(/,(\d)0$/, ',$1')
}
