import {
  generateSystemAddition,
  generateSystemSubstitution,
  tryGenerateAlgebraBatch,
} from './algebra'
import { exerciseTypeById, topicById } from './catalog'
import {
  columnAddPair,
  columnDivPair,
  columnMulPair,
  columnSubPair,
  decimalAddPair,
  decimalDivPair,
  decimalMulPair,
  decimalSubPair,
  nombreBound,
  numberRangeFrom,
  pairAdd,
  pairDiv,
  pairMul,
  pairSub,
  pickInRange,
  roundToPlaces,
  upperBound,
  type NumberRange,
} from './difficulty'
import { numberToFrench } from '@/francais/french-numbers'
import { generatePerimetreCompose } from './perimetre-compose'
import { generateConstruire } from './coord-construire'
import { generateDroites } from './coord-droites'
import { tryGenerateReperage } from './coord-reperage'
import { generateTransformations, isTransformationExercise } from './coord-transformations'
import { tryGenerateSoutienBatch } from '@/francais/soutien/generate'
import { parseSoutienType } from '@/francais/soutien/kinds'
import { ALGEBRA_GLOSSARY, GEOMETRY_GLOSSARY } from './glossary-banks'
import { tryGenerateLectureBatch } from '@/francais/lecture'
import { tryGeneratePhraseBatch } from '@/francais/phrase'
import { generateLengthConversionBatch, tryGenerateConversion } from './conversions'
import { tryGenerateTcmItems } from '@/tcm/items'
import { tryGenerateFigure } from './figures-school'
import { tryGenerateCalligraphieBatch } from '@/calligraphie/generate'
import { tryGenerateJeuxBatch } from '@/jeux/generate'
import { tryGenerateMesure } from './mesures'
import { pageAsConfig, pageBlocks } from './page-model'
import { makeWordProblem } from './problems'
import { TCM_MAX_SCORE } from '@/tcm/test'
import { generateTcmInformations } from '@/tcm/informations'
import { tryGenerateTcfBlock } from '@/tcf/generate'
import { isTcfConsignesType, TCF_DOMAIN } from '@/tcf/catalog'
import { tryGenerateGrammaireBlock } from '@/grammaire/generate'
import { isGrammaireTheoryType } from '@/grammaire/types'
import { tryGenerateAcmBlock } from '@/acm/generate'
import { tryGenerateSanteBlock } from '@/sante/generate'
import { tryGenerateSocieteBlock } from '@/societe/generate'
import { tryGenerateTcmCfrItems } from '@/tcm-cfr/items'
import { isTcmCfrConsignesType, TCM_CFR_MAX_SCORE } from '@/tcm-cfr/test'
import { tryGenerateTcmCscBlock } from '@/tcm-csc/generate'
import { isTcmCscConsignesType } from '@/tcm-csc/test'
import { tryGenerateVocabulaireBlock } from '@/vocabulaire/generate'
import { isGrammarTheoryType } from '@/francais/grammar-theory'
import { createRng, int, pick, shuffle, type Rng } from './rng'
import type {
  AlgebraGiven,
  ArithOp,
  CountIconKind,
  CountIconToken,
  Difficulty,
  DivisionStep,
  Figure,
  MathItem,
  MissingPos,
  PageConfig,
  WorksheetBlock,
  WorksheetDocument,
  WorksheetPage,
} from './types'

const COUNT_ICON_TARGETS: readonly {
  kind: CountIconKind
  label: string
}[] = [
  { kind: 'note', label: 'notes' },
  { kind: 'notes', label: 'notes' },
  { kind: 'star', label: 'étoiles' },
  { kind: 'heart', label: 'cœurs' },
  { kind: 'leaf', label: 'feuilles' },
  { kind: 'moon', label: 'lunes' },
  { kind: 'bolt', label: 'éclairs' },
  { kind: 'flower', label: 'fleurs' },
]

function generateCountIcons(rng: Rng): MathItem {
  const target = pick(rng, COUNT_ICON_TARGETS)
  const targetCount = int(rng, 10, 20)
  const circleCount = int(rng, 4, 10)
  const triangleCount = int(rng, 4, 10)
  const total = targetCount + circleCount + triangleCount

  // Grille irrégulière : positions mélangées, tailles variées.
  const cols = Math.ceil(Math.sqrt(total * 1.35))
  const rows = Math.ceil(total / cols)
  const cells: Array<{ c: number; r: number }> = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push({ c, r })
  }
  const slots = shuffle(rng, cells).slice(0, total)

  const kinds: Array<CountIconKind | 'circle' | 'triangle'> = [
    ...Array.from({ length: targetCount }, () => target.kind),
    ...Array.from({ length: circleCount }, () => 'circle' as const),
    ...Array.from({ length: triangleCount }, () => 'triangle' as const),
  ]
  const orderedKinds = shuffle(rng, kinds)

  const tokens: CountIconToken[] = slots.map((slot, i) => {
    const padX = 8
    const padY = 10
    const cellW = (100 - padX * 2) / cols
    const cellH = (100 - padY * 2) / rows
    const x = padX + slot.c * cellW + cellW * (0.25 + rng() * 0.5)
    const y = padY + slot.r * cellH + cellH * (0.25 + rng() * 0.5)
    return {
      kind: orderedKinds[i]!,
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(8, Math.min(92, y)),
      size: int(rng, 11, 20),
      rot: int(rng, -28, 28),
    }
  })

  return {
    layout: 'count-icons',
    prompt: `Il y a ____ ${target.label}`,
    answer: String(targetCount),
    countIcons: {
      label: target.label,
      targetKind: target.kind,
      targetCount,
      tokens,
    },
  }
}

function fmt(n: number): string {
  return String(n).replace('.', ',')
}

/** Entier de la plage libre, borné à [lo, hi] (la plage prime sur le niveau). */
function rangeInt(rng: Rng, range: NumberRange, lo: number, hi: number): number {
  const a = Math.max(lo, Math.ceil(range.min))
  const b = Math.min(hi, Math.floor(range.max))
  if (b < a) return Math.min(hi, Math.max(lo, Math.round(range.max)))
  return int(rng, a, b)
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

function lcm(a: number, b: number): number {
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

function columnItem(op: ArithOp, a: number, b: number, result: number, empty: boolean): MathItem {
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
function twoDigitMulItem(a: number, b: number, empty: boolean): MathItem {
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
function normalizeColumnLayouts(items: MathItem[]): MathItem[] {
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

function divisionColumnItem(dividend: number, divisor: number, empty: boolean): MathItem {
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
function normalizeDivisionLayouts(items: MathItem[]): MathItem[] {
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

function inlineOp(op: ArithOp, a: number, b: number, result: number, missing: MissingPos = 'result'): MathItem {
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

function roundTo(n: number, unit: number): number {
  return Math.round(n / unit) * unit
}

function frac(n: number, d: number): string {
  return `${n}/${d}`
}

function simplify(n: number, d: number): [number, number] {
  const g = gcd(n, d)
  return [n / g, d / g]
}

function dec(rng: Rng, maxInt = 20, places = 2): number {
  const scale = 10 ** places
  return int(rng, 1, maxInt * scale) / scale
}

function decStr(n: number): string {
  return n.toFixed(2).replace('.', ',').replace(/,0+$/, '').replace(/,(\d)0$/, ',$1')
}

const PLACE = ['unités', 'dizaines', 'centaines', 'milliers'] as const

function generateItems(
  typeId: string,
  count: number,
  rng: Rng,
  difficulty: Difficulty,
  range?: NumberRange,
  shapes?: Figure[],
  worksheetSeed?: number,
): MathItem[] {
  const tcm = tryGenerateTcmItems(typeId, count, rng)
  if (tcm) return tcm
  const tcmCfr = tryGenerateTcmCfrItems(typeId, count, rng, worksheetSeed)
  if (tcmCfr) return tcmCfr
  if (typeId === 'conversions-longueur' && count >= 2) {
    // Lot unique (pas deux fois mm→cm) ; Q5–Q6 en décimal si count ≥ 5.
    return generateLengthConversionBatch(rng, count, range)
  }
  const items: MathItem[] = []
  for (let i = 0; i < count; i++) {
    items.push(generateOne(typeId, rng, i, difficulty, range, shapes))
  }
  return normalizeDivisionLayouts(normalizeColumnLayouts(items))
}

function generateOne(
  typeId: string,
  rng: Rng,
  index: number,
  difficulty: Difficulty,
  range?: NumberRange,
  shapes?: Figure[],
): MathItem {
  const routed =
    tryGenerateFigure(typeId, index) ??
    tryGenerateConversion(typeId, rng, difficulty, range) ??
    tryGenerateMesure(typeId, rng, difficulty, range, shapes)
  if (routed) return routed
  const max = upperBound(difficulty, range)
  const nMax = range ? range.max : nombreBound(difficulty)
  switch (typeId) {
    case 'nombres-chiffres': {
      const n = range ? rangeInt(rng, range, 0, 999_999) : int(rng, 0, Math.min(999, nMax))
      return { layout: 'text', prompt: numberToFrench(n), answer: String(n) }
    }
    case 'nombres-lettres': {
      const n = range ? rangeInt(rng, range, 0, 999_999) : int(rng, 0, Math.min(999, nMax))
      return { layout: 'text', prompt: String(n), answer: numberToFrench(n) }
    }
    case 'nombres-compter-formes': {
      return generateCountIcons(rng)
    }
    case 'tcm-comparer':
    case 'tcm-suite':
    case 'tcm-operations':
    case 'tcm-quatre-ops':
    case 'tcm-add-sub-col-3':
    case 'tcm-add-sub-col-4':
    case 'tcm-decompose-99':
    case 'tcm-grandes-suites':
    case 'tcm-decompose-9999':
    case 'tcm-mul-div-col':
    case 'tcm-rect-peri-aire':
    case 'tcm-para-peri-aire':
    case 'tcm-tri-peri-aire':
    case 'tcm-rhombus-peri-aire':
    case 'tcm-trap-peri-aire':
    case 'tcm-circle-peri-aire':
    case 'tcm-suites-6':
    case 'tcm-ranger':
    case 'tcm-dec-add-sub':
    case 'tcm-mul-mixte':
    case 'tcm-div-mixte':
    case 'tcm-frac-color':
    case 'tcm-frac-read':
    case 'tcm-ops-decimales':
    case 'tcm-puissances-mixte':
    case 'tcm-priorite-ops':
    case 'tcm-relatifs-ops':
    case 'tcm-fractions-mixte':
    case 'tcm-expressions-reduire':
    case 'tcm-expressions-evaluer':
    case 'tcm-equations':
    case 'tcm-conversions-mixte':
    case 'tcm-proportion-kg': {
      // Lot complet généré dans generateItems ; repli unitaire.
      const [item] = tryGenerateTcmItems(typeId, 1, rng) ?? []
      return item ?? { layout: 'inline', prompt: 'Calculez 1 + 1 =', answer: '2' }
    }
    case 'nombres-position': {
      const n = range ? rangeInt(rng, range, 10, 9999) : int(rng, 100, 9999)
      const place = PLACE[int(rng, 0, Math.min(3, String(n).length - 1))]!
      const idx = { unités: 0, dizaines: 1, centaines: 2, milliers: 3 }[place]
      const digit = Math.floor(n / 10 ** idx) % 10
      return {
        layout: 'text',
        prompt: `Dans ${n.toLocaleString('fr-CH')}, le chiffre des ${place} est`,
        answer: String(digit),
      }
    }
    case 'nombres-decompose': {
      const digitCount = index % 2 === 0 ? 3 : 4
      const lo = digitCount === 3 ? 111 : 1111
      const hi = digitCount === 3 ? 999 : 9999
      let n = range ? rangeInt(rng, range, 11, 9999) : int(rng, lo, hi)
      for (let guard = 0; guard < 20 && n % 10 === 0; guard++) {
        n = range ? rangeInt(rng, range, 11, 9999) : int(rng, lo, hi)
      }
      const nDigits = String(n).split('')
      const placeParts = nDigits.map((d, i) => String(Number(d) * 10 ** (nDigits.length - 1 - i)))
      const labels = ['milliers', 'centaines', 'dizaines', 'unités'].slice(4 - nDigits.length)
      return {
        layout: 'place-value',
        prompt: n.toLocaleString('fr-CH'),
        labels,
        placeParts,
        answer: placeParts.join(' + '),
      }
    }
    case 'nombres-comparer': {
      const a = range ? pickInRange(rng, range) : int(rng, 1, 999)
      let b = range ? pickInRange(rng, range) : int(rng, 1, 999)
      if (index % 5 === 0) b = a
      const answer = a < b ? '<' : a > b ? '>' : '='
      return { layout: 'compare', left: fmt(a), right: fmt(b), answer }
    }
    case 'nombres-encadrer-10':
    case 'nombres-encadrer-100': {
      const unit = typeId === 'nombres-encadrer-10' ? 10 : 100
      const nLo = range ? Math.max(unit + 1, Math.ceil(range.min)) : unit + 1
      const nHi = Math.max(nLo + 1, unit * 2 + 1, max)
      let n = int(rng, nLo, nHi)
      for (let guard = 0; guard < 40 && n % unit === 0; guard++) n = int(rng, nLo, nHi)
      if (n % unit === 0) n += 1
      const lo = Math.floor(n / unit) * unit
      return {
        layout: 'encadrement',
        prompt: String(n),
        a: lo,
        b: lo + unit,
        answer: `${lo} < ${n} < ${lo + unit}`,
      }
    }
    case 'nombres-pair': {
      const n = range ? rangeInt(rng, range, 0, 999_999) : int(rng, 1, Math.min(999, max))
      return {
        layout: 'select',
        prompt: String(n),
        options: ['pair', 'impair'],
        answer: n % 2 === 0 ? 'pair' : 'impair',
      }
    }
    case 'nombres-ranger': {
      const pool = range
        ? (() => {
            const values: number[] = []
            for (let guard = 0; guard < 60 && values.length < 5; guard++) {
              const v = pickInRange(rng, range)
              if (!values.includes(v) || guard > 40) values.push(v)
            }
            return values
          })()
        : [
            int(rng, 1, Math.min(50, max)),
            int(rng, 10, Math.min(99, max)),
            int(rng, 10, Math.min(99, max)),
            int(rng, Math.min(100, max), Math.min(999, max)),
            int(rng, Math.min(100, max), Math.min(999, max)),
          ].map((n) => Math.min(n, max))
      const numbers = shuffle(rng, pool)
      const ascending = rng() < 0.5
      const ordered = [...numbers].sort((a, b) => (ascending ? a - b : b - a))
      return {
        layout: 'order',
        sequence: numbers.map(fmt),
        placeParts: ordered.map(fmt),
        orderOp: ascending ? '<' : '>',
        prompt: ascending ? 'Du plus petit au plus grand :' : 'Du plus grand au plus petit :',
        answer: ordered.map(fmt).join(ascending ? ' < ' : ' > '),
      }
    }
    case 'nombres-suite': {
      const stepMax = difficulty === 'facile' ? 5 : difficulty === 'moyen' ? 9 : 15
      const step = range?.decimals ? int(rng, 1, 9) / 10 : int(rng, 2, stepMax)
      const start = range ? pickInRange(rng, range) : int(rng, 1, difficulty === 'facile' ? 30 : 80)
      const length = 8
      const seq = Array.from({ length }, (_, k) => roundToPlaces(start + k * step, 2))
      const blankCount = 3
      const indexes = shuffle(
        rng,
        Array.from({ length }, (_, k) => k),
      ).slice(0, blankCount)
      const blanks = [...indexes].sort((a, b) => a - b)
      return {
        layout: 'sequence',
        sequence: seq.map((n, k) => (blanks.includes(k) ? '□' : fmt(n))),
        blankIndexes: blanks,
        answer: blanks.map((k) => fmt(seq[k]!)).join(' ; '),
      }
    }
    case 'addition-ligne': {
      const p = pairAdd(rng, difficulty, range)
      return inlineOp('+', p.a, p.b, p.result)
    }
    case 'addition-trou': {
      const p = pairAdd(rng, difficulty, range)
      return inlineOp('+', p.a, p.b, p.result, pick(rng, ['a', 'b'] as const))
    }
    case 'addition-colonne':
    case 'addition-colonne-poser': {
      const p = columnAddPair(rng, difficulty, range)
      return columnItem('+', p.a, p.b, p.result, typeId.endsWith('poser'))
    }
    case 'addition-comparer': {
      const p = pairAdd(rng, difficulty, range)
      const q = pairAdd(rng, difficulty, range)
      const left = p.result
      const right = q.result
      return {
        layout: 'compare',
        left: `${fmt(p.a)} + ${fmt(p.b)}`,
        right: `${fmt(q.a)} + ${fmt(q.b)}`,
        answer: left < right ? '<' : left > right ? '>' : '=',
      }
    }
    case 'soustraction-ligne': {
      const p = pairSub(rng, difficulty, range)
      return inlineOp('−', p.a, p.b, p.result)
    }
    case 'soustraction-trou': {
      const p = pairSub(rng, difficulty, range)
      return inlineOp('−', p.a, p.b, p.result, pick(rng, ['a', 'b'] as const))
    }
    case 'soustraction-colonne':
    case 'soustraction-colonne-poser': {
      const p = columnSubPair(rng, difficulty, range)
      return columnItem('−', p.a, p.b, p.result, typeId.endsWith('poser'))
    }
    case 'soustraction-comparer': {
      const p = pairSub(rng, difficulty, range)
      const q = pairSub(rng, difficulty, range)
      const left = p.result
      const right = q.result
      return {
        layout: 'compare',
        left: `${fmt(p.a)} − ${fmt(p.b)}`,
        right: `${fmt(q.a)} − ${fmt(q.b)}`,
        answer: left < right ? '<' : left > right ? '>' : '=',
      }
    }
    case 'estimation-dizaine': {
      const draw = () => (range ? pickInRange(rng, range) : int(rng, 11, Math.min(99, max)))
      let n = draw()
      for (let guard = 0; guard < 20 && n % 10 === 0; guard++) n = draw()
      return { layout: 'inline', prompt: `${fmt(n)} ≈`, answer: String(roundTo(n, 10)) }
    }
    case 'estimation-centaine': {
      const hi = Math.max(101, Math.min(999, max))
      const draw = () => (range ? pickInRange(rng, range) : int(rng, 101, hi))
      let n = draw()
      for (let guard = 0; guard < 20 && n % 100 === 0; guard++) n = draw()
      return { layout: 'inline', prompt: `${fmt(n)} ≈`, answer: String(roundTo(n, 100)) }
    }
    case 'estimation-somme': {
      const p = pairAdd(rng, difficulty === 'facile' ? 'facile' : 'moyen', range)
      return { layout: 'inline', prompt: `${fmt(p.a)} + ${fmt(p.b)} ≈`, answer: String(roundTo(p.a, 10) + roundTo(p.b, 10)) }
    }
    case 'estimation-difference': {
      const p = pairSub(rng, difficulty === 'facile' ? 'facile' : 'moyen', range)
      return { layout: 'inline', prompt: `${fmt(p.a)} − ${fmt(p.b)} ≈`, answer: String(roundTo(p.a, 10) - roundTo(p.b, 10)) }
    }
    case 'multiplication-ligne': {
      const p = pairMul(rng, difficulty, range)
      return inlineOp('×', p.a, p.b, p.result)
    }
    case 'multiplication-trou': {
      const p = pairMul(rng, difficulty, range)
      return inlineOp('×', p.a, p.b, p.result, pick(rng, ['a', 'b'] as const))
    }
    case 'multiplication-colonne':
    case 'multiplication-colonne-poser': {
      const p = columnMulPair(rng, difficulty, range)
      return columnItem('×', p.a, p.b, p.result, typeId.endsWith('poser'))
    }
    case 'multiplication-2chiffres':
    case 'multiplication-2chiffres-poser': {
      const aMax = difficulty === 'facile' ? 49 : difficulty === 'moyen' ? 99 : 999
      const a = range ? Math.max(range.decimals ? 0.1 : 1, pickInRange(rng, range)) : int(rng, 12, aMax)
      let b = int(rng, 12, difficulty === 'facile' ? 29 : 99)
      while (b % 10 === 0) b = int(rng, 12, difficulty === 'facile' ? 29 : 99)
      return twoDigitMulItem(a, b, typeId.endsWith('poser'))
    }
    case 'division-ligne': {
      const p = pairDiv(rng, difficulty, range)
      return inlineOp('÷', p.a, p.b, p.result)
    }
    case 'division-trou': {
      const p = pairDiv(rng, difficulty, range)
      return inlineOp('÷', p.a, p.b, p.result, pick(rng, ['a', 'b'] as const))
    }
    case 'division-colonne':
    case 'division-colonne-poser': {
      if (range) {
        const p = columnDivPair(rng, range)
        return divisionColumnItem(p.a, p.b, typeId.endsWith('poser'))
      }
      const divisor = int(rng, 2, difficulty === 'avance' ? 12 : 9)
      const quotient = int(
        rng,
        difficulty === 'facile' ? 4 : 12,
        difficulty === 'facile' ? 20 : difficulty === 'moyen' ? 99 : 250,
      )
      const remainder = int(rng, 0, divisor - 1)
      const dividend = divisor * quotient + remainder
      return divisionColumnItem(dividend, divisor, typeId.endsWith('poser'))
    }
    case 'problemes-addition':
      return makeWordProblem(rng, difficulty, 'addition')
    case 'problemes-soustraction':
      return makeWordProblem(rng, difficulty, 'soustraction')
    case 'problemes-add-sub':
      return makeWordProblem(rng, difficulty, 'add-sub')
    case 'problemes-multiplication':
      return makeWordProblem(rng, difficulty, 'multiplication')
    case 'problemes-division':
      return makeWordProblem(rng, difficulty, 'division')
    case 'problemes-melange':
      return makeWordProblem(rng, difficulty, 'melange')
    case 'multiples-reconnaitre': {
      const base = int(rng, 2, 9)
      const yes = rng() < 0.5
      const n = range
        ? (() => {
            let v = rangeInt(rng, range, base, 999_999)
            for (let guard = 0; guard < 30 && (v % base === 0) !== yes; guard++) v = rangeInt(rng, range, base, 999_999)
            return v
          })()
        : yes
          ? base * int(rng, 2, 12)
          : base * int(rng, 2, 12) + int(rng, 1, base - 1)
      return { layout: 'inline', prompt: `${n} est-il un multiple de ${base} ?`, answer: n % base === 0 ? 'oui' : 'non' }
    }
    case 'multiples-diviseurs': {
      const n = pick(rng, [12, 18, 20, 24, 30, 36, 42, 48])
      const list: number[] = []
      for (let d = 1; d <= n; d++) if (n % d === 0) list.push(d)
      return { layout: 'text', prompt: `Quels sont les diviseurs de ${n} ?`, answer: list.join(' ; ') }
    }
    case 'multiples-pgcd': {
      const gMin = difficulty === 'facile' ? 2 : difficulty === 'moyen' ? 4 : 8
      const gMax = difficulty === 'facile' ? 8 : difficulty === 'moyen' ? 24 : 48
      const fMin = difficulty === 'facile' ? 2 : 3
      const fMax = difficulty === 'facile' ? 9 : difficulty === 'moyen' ? 18 : 30
      const g = int(rng, gMin, gMax)
      const k1 = int(rng, fMin, fMax)
      let k2 = int(rng, fMin, fMax)
      while (k2 === k1) k2 = int(rng, fMin, fMax)
      const a = g * k1
      const b = g * k2
      return { layout: 'inline', prompt: `PGCD(${a} ; ${b}) =`, answer: String(gcd(a, b)) }
    }
    case 'multiples-ppcm': {
      const gMin = difficulty === 'facile' ? 1 : difficulty === 'moyen' ? 2 : 4
      const gMax = difficulty === 'facile' ? 4 : difficulty === 'moyen' ? 12 : 24
      const fMin = difficulty === 'facile' ? 2 : 3
      const fMax = difficulty === 'facile' ? 8 : difficulty === 'moyen' ? 16 : 28
      const g = int(rng, gMin, gMax)
      const k1 = int(rng, fMin, fMax)
      let k2 = int(rng, fMin, fMax)
      while (k2 === k1) k2 = int(rng, fMin, fMax)
      const a = g * k1
      const b = g * k2
      return { layout: 'inline', prompt: `PPCM(${a} ; ${b}) =`, answer: String(lcm(a, b)) }
    }
    case 'fractions-identifier': {
      const n = int(rng, 1, 9)
      const d = int(rng, n + 1, 12)
      const ask = rng() < 0.5 ? 'numérateur' : 'dénominateur'
      return { layout: 'inline', prompt: `Dans ${frac(n, d)}, le ${ask} est`, answer: ask === 'numérateur' ? String(n) : String(d) }
    }
    case 'fractions-equivalentes': {
      const n = int(rng, 1, 6)
      const d = int(rng, n + 1, 9)
      const k = int(rng, 2, 5)
      const missNum = rng() < 0.5
      return {
        layout: 'inline',
        prompt: missNum ? `${frac(n, d)} = □/${d * k}` : `${frac(n, d)} = ${n * k}/□`,
        answer: missNum ? String(n * k) : String(d * k),
      }
    }
    case 'fractions-simplifier': {
      const k = int(rng, 2, 6)
      const n = int(rng, 1, 8) * k
      const d = int(rng, 2, 9) * k
      const [sn, sd] = simplify(n, d)
      return { layout: 'inline', prompt: `${frac(n, d)} =`, answer: frac(sn, sd) }
    }
    case 'fractions-comparer': {
      const d = int(rng, 3, 12)
      const n1 = int(rng, 1, d - 1)
      let n2 = int(rng, 1, d - 1)
      if (index % 4 === 0) n2 = n1
      const left = n1 / d
      const right = n2 / d
      return {
        layout: 'compare',
        left: frac(n1, d),
        right: frac(n2, d),
        answer: left < right ? '<' : left > right ? '>' : '=',
      }
    }
    case 'fractions-add': {
      const d = int(rng, 4, 12)
      const n1 = int(rng, 1, d - 2)
      const n2 = int(rng, 1, d - n1)
      const op: ArithOp = rng() < 0.5 ? '+' : '−'
      const raw = op === '+' ? n1 + n2 : n1 - n2
      const [sn, sd] = simplify(raw, d)
      return { layout: 'inline', prompt: `${frac(n1, d)} ${op} ${frac(n2, d)} =`, answer: sd === 1 ? String(sn) : frac(sn, sd) }
    }
    case 'fractions-mul': {
      const n1 = int(rng, 1, 5)
      const d1 = int(rng, 2, 8)
      const n2 = int(rng, 1, 5)
      const d2 = int(rng, 2, 8)
      const [sn, sd] = simplify(n1 * n2, d1 * d2)
      return { layout: 'inline', prompt: `${frac(n1, d1)} × ${frac(n2, d2)} =`, answer: sd === 1 ? String(sn) : frac(sn, sd) }
    }
    case 'fractions-div': {
      const n1 = int(rng, 1, 5)
      const d1 = int(rng, 2, 8)
      const n2 = int(rng, 1, 5)
      const d2 = int(rng, 2, 8)
      const [sn, sd] = simplify(n1 * d2, d1 * n2)
      return { layout: 'inline', prompt: `${frac(n1, d1)} ÷ ${frac(n2, d2)} =`, answer: sd === 1 ? String(sn) : frac(sn, sd) }
    }
    case 'decimaux-comparer': {
      const decRange: NumberRange | undefined = range ? { ...range, decimals: true } : undefined
      const a = decRange ? pickInRange(rng, decRange) : dec(rng, 9, 2)
      let b = decRange ? pickInRange(rng, decRange) : dec(rng, 9, 2)
      if (index % 5 === 0) b = a
      return {
        layout: 'compare',
        left: decStr(a),
        right: decStr(b),
        answer: a < b ? '<' : a > b ? '>' : '=',
      }
    }
    case 'decimaux-add-colonne':
    case 'decimaux-add-colonne-poser': {
      const p = range ? columnAddPair(rng, difficulty, { ...range, decimals: true }) : decimalAddPair(rng, 40)
      return columnItem('+', p.a, p.b, p.result, typeId.endsWith('poser'))
    }
    case 'decimaux-sub-colonne':
    case 'decimaux-sub-colonne-poser': {
      const p = range ? columnSubPair(rng, difficulty, { ...range, decimals: true }) : decimalSubPair(rng, 40)
      return columnItem('−', p.a, p.b, p.result, typeId.endsWith('poser'))
    }
    case 'decimaux-mul-colonne':
    case 'decimaux-mul-colonne-poser': {
      const p = range ? columnMulPair(rng, difficulty, { ...range, decimals: true }) : decimalMulPair(rng, 20)
      return columnItem('×', p.a, p.b, p.result, typeId.endsWith('poser'))
    }
    case 'decimaux-div-colonne':
    case 'decimaux-div-colonne-poser': {
      const p = range
        ? columnDivPair(rng, { ...range, decimals: true })
        : decimalDivPair(rng, difficulty === 'facile' ? 40 : difficulty === 'moyen' ? 120 : 400)
      return divisionColumnItem(p.a, p.b, typeId.endsWith('poser'))
    }
    case 'decimaux-mul-ligne': {
      const factors = [
        { label: '0,5', div: 2 },
        { label: '0,25', div: 4 },
        { label: '0,2', div: 5 },
        { label: '0,125', div: 8 },
        { label: '0,1', div: 10 },
        { label: '0,01', div: 100 },
        { label: '0,001', div: 1000 },
      ] as const
      const pickF = pick(rng, [...factors])
      const maxK = difficulty === 'facile' ? 12 : difficulty === 'moyen' ? 40 : 120
      const k = range ? rangeInt(rng, range, 1, 100_000) : int(rng, 2, maxK)
      const n = k * pickF.div
      return {
        layout: 'inline',
        prompt: `${fmt(n)} × ${pickF.label} =`,
        answer: fmt(k),
      }
    }
    case 'decimaux-div-ligne': {
      const factors = [
        { label: '0,5', mul: 2 },
        { label: '0,25', mul: 4 },
        { label: '0,2', mul: 5 },
        { label: '0,125', mul: 8 },
        { label: '0,1', mul: 10 },
        { label: '0,01', mul: 100 },
        { label: '0,001', mul: 1000 },
      ] as const
      const pickF = pick(rng, [...factors])
      const maxN = difficulty === 'facile' ? 20 : difficulty === 'moyen' ? 80 : 200
      const n = range ? pickInRange(rng, range) : int(rng, 1, maxN)
      const result = roundToPlaces(n * pickF.mul, 3)
      return {
        layout: 'inline',
        prompt: `${fmt(n)} ÷ ${pickF.label} =`,
        answer: fmt(result),
      }
    }
    case 'proportion-notion': {
      const pairs = [
        ['1/2', '50 %'],
        ['1/4', '25 %'],
        ['3/4', '75 %'],
        ['1/5', '20 %'],
        ['1/10', '10 %'],
      ] as const
      const pair = pick(rng, pairs)
      const askPct = rng() < 0.5
      return { layout: 'inline', prompt: askPct ? `${pair[0]} =` : `${pair[1]} =`, answer: askPct ? pair[1] : pair[0] }
    }
    case 'proportion-de': {
      const pct = pick(rng, [10, 20, 25, 50])
      const n = range ? pickInRange(rng, range) : pct === 25 ? int(rng, 2, 8) * 4 : int(rng, 2, 12) * 10
      return { layout: 'inline', prompt: `${pct} % de ${fmt(n)} =`, answer: fmt(roundToPlaces((pct * n) / 100, 4)) }
    }
    case 'proportion-var': {
      const n = range ? pickInRange(rng, range) : int(rng, 2, 12) * 10
      const pct = pick(rng, [10, 20, 25])
      const up = rng() < 0.5
      const result = roundToPlaces(up ? n * (1 + pct / 100) : n * (1 - pct / 100), 4)
      return {
        layout: 'inline',
        prompt: up ? `${fmt(n)} augmenté de ${pct} % =` : `${fmt(n)} diminué de ${pct} % =`,
        answer: fmt(result),
      }
    }
    case 'proportion-problemes': {
      const n = range ? pickInRange(rng, range) : int(rng, 4, 12) * 10
      const pct = pick(rng, [10, 20, 25, 50])
      const result = fmt(roundToPlaces(n - (pct * n) / 100, 4))
      return {
        layout: 'text',
        prompt: `Un article coûte ${fmt(n)} CHF. Pendant les soldes, il est réduit de ${pct} %. Quel est le nouveau prix ?`,
        calcAnswer: `${fmt(n)} − ${pct} %`,
        responseAnswer: `${result} CHF`,
        answer: `${result} CHF`,
      }
    }
    case 'relatifs-comparer': {
      const signed = () => (range ? pickInRange(rng, range) * (rng() < 0.5 ? -1 : 1) : int(rng, -20, 20))
      const a = signed()
      let b = signed()
      if (index % 5 === 0) b = a
      return { layout: 'compare', left: fmt(a), right: fmt(b), answer: a < b ? '<' : a > b ? '>' : '=' }
    }
    case 'relatifs-add': {
      const signed = () => (range ? pickInRange(rng, range) * (rng() < 0.5 ? -1 : 1) : int(rng, -15, 15))
      const a = signed()
      const b = signed()
      const op: ArithOp = rng() < 0.5 ? '+' : '−'
      const result = roundToPlaces(op === '+' ? a + b : a - b, 4)
      return { layout: 'inline', prompt: `(${fmt(a)}) ${op} (${fmt(b)}) =`, answer: fmt(result) }
    }
    case 'relatifs-mul': {
      if (range) {
        const a = pickInRange(rng, range) * (rng() < 0.5 ? -1 : 1) || 2
        const b = int(rng, 2, 9) * (rng() < 0.5 ? -1 : 1)
        if (rng() < 0.6) {
          return { layout: 'inline', prompt: `(${fmt(a)}) × (${b}) =`, answer: fmt(roundToPlaces(a * b, 4)) }
        }
        const dividend = roundToPlaces(a * b, 4)
        return { layout: 'inline', prompt: `(${fmt(dividend)}) ÷ (${b}) =`, answer: fmt(a) }
      }
      const a = int(rng, -9, 9) || 2
      const b = int(rng, -9, 9) || 3
      const mul = rng() < 0.6
      const result = mul ? a * b : a / b
      if (!mul && a % b !== 0) {
        const bb = pick(rng, [-4, -3, -2, 2, 3, 4])
        const aa = bb * int(rng, -6, 6) || bb * 2
        return { layout: 'inline', prompt: `(${aa}) ÷ (${bb}) =`, answer: String(aa / bb) }
      }
      return { layout: 'inline', prompt: mul ? `(${a}) × (${b}) =` : `(${a}) ÷ (${b}) =`, answer: String(result) }
    }
    case 'puissances-calcul': {
      const a = range ? pickInRange(rng, range) : int(rng, 2, 9)
      const p = pick(rng, [2, 3])
      const result = roundToPlaces(a ** p, 6)
      return { layout: 'inline', prompt: `${fmt(a)}${p === 2 ? '²' : '³'} =`, answer: fmt(result) }
    }
    case 'puissances-10': {
      const p = int(rng, 1, 4)
      return { layout: 'inline', prompt: `10${['¹', '²', '³', '⁴'][p - 1]} =`, answer: String(10 ** p) }
    }
    case 'puissances-racine': {
      const a = int(rng, 2, 12)
      return { layout: 'inline', prompt: `√${a * a} =`, answer: String(a) }
    }
    case 'puissances-priorite': {
      const a = int(rng, 2, 6)
      const b = int(rng, 2, 5)
      const c = int(rng, 2, 4)
      return { layout: 'inline', prompt: `${a} + ${b} × ${c} =`, answer: String(a + b * c) }
    }
    case 'expressions-substituer': {
      const n = int(rng, 2, 6)
      const k = int(rng, 1, 9)
      const x = int(rng, 2, 8)
      return { layout: 'inline', prompt: `Calculez ${n}x + ${k} pour x = ${x}`, answer: String(n * x + k) }
    }
    case 'expressions-reduire': {
      const a = int(rng, 2, 8)
      const b = int(rng, 2, 8)
      return { layout: 'inline', prompt: `Réduisez : ${a}x + ${b}x`, answer: `${a + b}x` }
    }
    case 'expressions-developper': {
      const n = int(rng, 2, 8)
      const k = int(rng, 1, 9)
      return { layout: 'inline', prompt: `Développez : ${n}(x + ${k})`, answer: `${n}x + ${n * k}` }
    }
    case 'expressions-factoriser': {
      const n = int(rng, 2, 6)
      const a = n * int(rng, 2, 6)
      const b = n * int(rng, 1, 6)
      return { layout: 'inline', prompt: `Factorisez : ${a}x + ${b}`, answer: `${n}(${a / n}x + ${b / n})` }
    }
    case 'equations-simple': {
      const x = int(rng, 2, 20)
      const b = int(rng, 2, 15)
      return { layout: 'inline', prompt: `x + ${b} = ${x + b}    x =`, answer: String(x) }
    }
    case 'equations-deux-cotes': {
      const x = int(rng, 2, 12)
      const a = int(rng, 3, 6)
      const c = int(rng, 1, a - 1)
      const b = int(rng, 1, 10)
      const d = a * x + b - c * x
      return { layout: 'inline', prompt: `${a}x + ${b} = ${c}x + ${d}    x =`, answer: String(x) }
    }
    case 'equations-fractions': {
      const x = int(rng, 2, 16)
      if (x % 2 !== 0) {
        const xx = x + 1
        return { layout: 'inline', prompt: `x/2 = ${xx / 2}    x =`, answer: String(xx) }
      }
      return { layout: 'inline', prompt: `x/2 = ${x / 2}    x =`, answer: String(x) }
    }
    case 'equations-systeme':
      return generateSystemSubstitution(rng)
    case 'equations-systeme-add':
      return generateSystemAddition(rng)
    case 'perimetres-composees': {
      return generatePerimetreCompose(rng, difficulty, range)
    }
    case 'reperage-lire': {
      const x = int(rng, -4, 5)
      const y = int(rng, -4, 5)
      return {
        layout: 'coord',
        prompt: 'Écrivez les coordonnées du point A.',
        point: { x, y, label: 'A' },
        answer: `(${x} ; ${y})`,
      }
    }
    default:
      return { layout: 'inline', prompt: 'Calculez 1 + 1 =', answer: '2' }
  }
}

function buildSingleBlock(
  config: PageConfig,
  seed: number,
  worksheetSeed = seed,
): {
  title: string
  instruction: string
  items: MathItem[]
  givens?: AlgebraGiven[]
  document?: WorksheetDocument
  bankQuestionCap?: number
} {
  const rng = createRng(seed)
  const topic = topicById[config.topic]
  const type = exerciseTypeById[config.exerciseType]
  const difficulty = config.difficulty ?? 'moyen'
  const fallbackTitle = type?.label ?? topic?.label ?? 'Exercices'
  if (config.exerciseType === 'tcm-consignes') {
    return {
      title: 'Informations',
      instruction: type?.instruction ?? 'Lisez les consignes avant de commencer le test.',
      items: generateTcmInformations('tcm', TCM_MAX_SCORE),
    }
  }
  if (isTcmCscConsignesType(config.exerciseType)) {
    return {
      title: 'Informations',
      instruction: type?.instruction ?? 'Lisez les consignes avant de commencer le test.',
      items: generateTcmInformations('tcm-csc', 0),
    }
  }
  const tcf = tryGenerateTcfBlock(config, rng)
  if (tcf) {
    return { title: fallbackTitle, instruction: tcf.instruction, items: tcf.items }
  }
  const grammaire = tryGenerateGrammaireBlock(config)
  if (grammaire) {
    return {
      title: fallbackTitle,
      instruction: grammaire.instruction,
      items: grammaire.items,
    }
  }
  const vocabulaire = tryGenerateVocabulaireBlock(config)
  if (vocabulaire) {
    return {
      title: fallbackTitle,
      instruction: vocabulaire.instruction,
      items: vocabulaire.items,
    }
  }
  const societe = tryGenerateSocieteBlock(config)
  if (societe) {
    return {
      title: fallbackTitle,
      instruction: societe.instruction,
      items: societe.items,
    }
  }
  const sante = tryGenerateSanteBlock(config)
  if (sante) {
    return {
      title: fallbackTitle,
      instruction: sante.instruction,
      items: sante.items,
    }
  }
  const acm = tryGenerateAcmBlock(config)
  if (acm) {
    return {
      title: fallbackTitle,
      instruction: acm.instruction,
      items: acm.items,
    }
  }
  const tcmCsc = tryGenerateTcmCscBlock(config)
  if (tcmCsc) {
    return {
      title: fallbackTitle,
      instruction: tcmCsc.instruction,
      items: tcmCsc.items,
    }
  }
  if (isTcmCfrConsignesType(config.exerciseType)) {
    return {
      title: 'Informations',
      instruction: type?.instruction ?? 'Lisez les consignes avant de commencer le test.',
      items: generateTcmInformations('tcm-cfr', TCM_CFR_MAX_SCORE),
    }
  }
  if (config.exerciseType === 'reperage-droites') {
    const droites = generateDroites(config, rng)
    return { title: fallbackTitle, instruction: droites.instruction, items: droites.items }
  }
  if (config.exerciseType === 'reperage-construire') {
    const construire = generateConstruire(config, rng)
    return { title: fallbackTitle, instruction: construire.instruction, items: construire.items }
  }
  if (isTransformationExercise(config.exerciseType)) {
    const tr = generateTransformations(config, rng)
    return { title: fallbackTitle, instruction: tr.instruction, items: tr.items }
  }
  if (config.exerciseType === 'glossaire-algebre-mots' || config.exerciseType === 'glossaire-geometrie-mots') {
    const bank = config.exerciseType === 'glossaire-algebre-mots' ? ALGEBRA_GLOSSARY : GEOMETRY_GLOSSARY
    const count = Math.max(1, Math.min(config.count || 8, bank.length))
    const picked = shuffle(rng, [...bank]).slice(0, count)
    return {
      title: fallbackTitle,
      instruction: type?.instruction ?? 'Lisez chaque mot, sa définition et le schéma.',
      items: picked.map((entry) => ({
        layout: 'glossary' as const,
        prompt: entry.term,
        glossary: {
          term: entry.term,
          definition: entry.definition,
          figure: entry.figure,
        },
        answer: entry.definition,
      })),
    }
  }
  const reperage = tryGenerateReperage(config, rng)
  if (reperage) {
    return { title: fallbackTitle, instruction: reperage.instruction, items: reperage.items }
  }
  const soutien = tryGenerateSoutienBatch(config.exerciseType, config.count, rng, difficulty, {
    soutienMotsLibre: config.soutienMotsLibre,
    soutienMotsEntries: config.soutienMotsEntries,
    columns: config.columns,
    soutienCompleterLibre: config.soutienCompleterLibre,
    soutienCompleterEntries: config.soutienCompleterEntries,
    excludeWords: config.soutienExcludeWords,
    type1Words: config.soutienType1Words,
  })
  if (soutien) {
    return {
      title: fallbackTitle,
      instruction: soutien.instruction ?? type?.instruction ?? 'Complétez.',
      items: soutien.items,
    }
  }
  const lecture = tryGenerateLectureBatch(config.exerciseType, config.count, rng, difficulty)
  if (lecture) {
    return {
      title: fallbackTitle,
      instruction: lecture.instruction ?? type?.instruction ?? 'Complétez.',
      items: lecture.items,
    }
  }
  const phrase = tryGeneratePhraseBatch(
    config.exerciseType,
    config.count,
    rng,
    difficulty,
    config.verbGroup ?? 'er',
  )
  if (phrase) {
    const libre =
      config.verbGroup === 'libre' &&
      Array.isArray(config.phraseItems) &&
      config.phraseItems.length > 0
    return {
      title: fallbackTitle,
      instruction: libre
        ? (config.phraseInstruction ?? phrase.instruction ?? type?.instruction ?? 'Complétez.')
        : (phrase.instruction ?? type?.instruction ?? 'Complétez.'),
      items: libre ? config.phraseItems! : phrase.items,
    }
  }
  const algebra = tryGenerateAlgebraBatch(config.exerciseType, config.count, rng, difficulty)
  if (algebra) {
    return {
      title: fallbackTitle,
      instruction: algebra.instruction ?? type?.instruction ?? 'Calculez.',
      items: algebra.items,
      givens: algebra.givens,
    }
  }
  const jeux = tryGenerateJeuxBatch(config.exerciseType, rng, {
    gameEntries: config.gameEntries,
    gameBackColor: config.gameBackColor,
    gameTopic: config.gameTopic,
    gameSeriesName: config.gameSeriesName,
    gameBorderId: config.gameBorderId,
    gameBorderRectoId:
      config.gameBorderRectoId !== undefined
        ? config.gameBorderRectoId
        : config.gameBorderId,
    gameBorderVersoId:
      config.gameBorderVersoId !== undefined
        ? config.gameBorderVersoId
        : config.gameBorderId,
    gameFontSize: config.gameFontSize,
    gameAlpha: config.gameAlpha,
  })
  if (jeux) {
    return {
      title: fallbackTitle,
      instruction: jeux.instruction,
      items: jeux.items,
    }
  }
  const calligraphie = tryGenerateCalligraphieBatch(
    config.exerciseType,
    config.calliText,
    config.calliFont,
    config.calliSize,
  )
  if (calligraphie) {
    return {
      title: fallbackTitle,
      instruction: calligraphie.instruction,
      items: calligraphie.items,
    }
  }
  return {
    title: fallbackTitle,
    instruction: type?.instruction ?? 'Calculez, complète ou simplifiez chaque expression.',
    items: generateItems(
      config.exerciseType,
      config.count,
      rng,
      difficulty,
      numberRangeFrom(config),
      config.quadLibre ? config.quadShapes : undefined,
      worksheetSeed,
    ),
  }
}

/** Page « Informations » d’un test (TCM / CFR / CSC / TCF) : ni numéro d’exercice ni points. */
function isInfoPageType(typeId: string): boolean {
  return (
    typeId === 'tcm-consignes' ||
    isTcmCfrConsignesType(typeId) ||
    isTcmCscConsignesType(typeId) ||
    isTcfConsignesType(typeId)
  )
}

export function buildPage(
  config: PageConfig,
  seed: number,
  startExercise = 1,
  worksheetSeed = seed,
): WorksheetPage {
  const blocksIn = pageBlocks(config)
  let exerciseCursor = startExercise
  const built: WorksheetBlock[] = blocksIn.map((block, index) => {
    const single = pageAsConfig(config, block)
    const local = block.contentSeed ?? 0
    const result = buildSingleBlock(single, seed + index * 10007 + local, worksheetSeed)
    const isTheory = isGrammarTheoryType(block.exerciseType) || isGrammaireTheoryType(block.exerciseType)
    const isJeux = block.exerciseType.startsWith('jeux-')
    const isTcmConsignes = isInfoPageType(block.exerciseType)
    const libre =
      Array.isArray(block.libreItems) && block.libreItems.length > 0
        ? {
            items: block.libreItems,
            instruction: block.libreInstruction ?? result.instruction,
          }
        : null
    let exerciseIndex = 0
    if (!isTcmConsignes) {
      if (block.exerciseNo != null) {
        exerciseIndex = block.exerciseNo
        exerciseCursor = Math.max(exerciseCursor, block.exerciseNo + 1)
      } else {
        exerciseIndex = exerciseCursor++
      }
    }
    return {
      exerciseIndex,
      title: isTcmConsignes
        ? 'Informations'
        : isTheory
          ? ((libre?.instruction ?? result.instruction)?.replace(/^Théorie — /, '') || `Théorie`)
          : isJeux
            ? (exerciseTypeById[block.exerciseType]?.label ?? `Jeu ${exerciseIndex}`)
            : `Exercice ${exerciseIndex}`,
      instruction: libre?.instruction ?? result.instruction,
      items: libre?.items ?? result.items,
      columns: block.columns,
      exerciseType: block.exerciseType,
      pointsPerQuestion: block.pointsPerQuestion,
      givens: result.givens,
      document: result.document,
      problemDraftGrids: block.problemDraftGrids,
      oralAnswerModes: block.oralAnswerModes,
      tcfFormModes: block.tcfFormModes,
      tcfPageBreakAfter: block.tcfPageBreakAfter,
      bankQuestionCap: result.bankQuestionCap,
    }
  })
  const first = built[0]
  const topic = topicById[config.topic]
  const type = exerciseTypeById[config.exerciseType]
  const isTheoryPage =
    isGrammarTheoryType(config.exerciseType) || isGrammaireTheoryType(config.exerciseType)
  const isTcmConsignesPage = isInfoPageType(config.exerciseType)
  return {
    ...config,
    title: isTcmConsignesPage
      ? 'Informations'
      : isTheoryPage
        ? (first?.title ?? type?.label ?? 'Théorie')
        : built.length > 1
          ? (topic?.label ?? 'Exercices')
          : (type?.label ?? topic?.label ?? 'Exercices'),
    instruction: first?.instruction ?? type?.instruction ?? 'Complétez.',
    items: built.flatMap((block) => block.items),
    blocks: built,
    givens: first?.givens,
  }
}

/** Mots déjà tirés en types 1 (vocab) et 5 (compléter) sur toute la série. */
function collectSoutienReservedWords(pages: PageConfig[], seed: number): {
  reserved: string[]
  type1Words: string[]
} {
  const reserved = new Set<string>()
  const type1Words: string[] = []
  const type1Seen = new Set<string>()
  pages.forEach((page, pageIndex) => {
    const pageSeed = seed + pageIndex * 7919
    pageBlocks(page).forEach((block, blockIndex) => {
      const kind = parseSoutienType(block.exerciseType)?.kind
      if (kind !== 'mots' && kind !== 'completer') return
      const single = pageAsConfig(page, block)
      const local = block.contentSeed ?? 0
      const result = buildSingleBlock(single, pageSeed + blockIndex * 10007 + local, seed)
      for (const item of result.items) {
        if (kind === 'mots' && item.layout === 'vocab-table') {
          for (const entry of item.vocabEntries ?? []) {
            const label = entry.label?.trim()
            if (!label) continue
            reserved.add(label.toLowerCase())
            if (!type1Seen.has(label.toLowerCase())) {
              type1Seen.add(label.toLowerCase())
              type1Words.push(label)
            }
          }
        }
        if (kind === 'completer' && item.layout === 'syllable-complete') {
          for (const row of item.syllableCompletes ?? []) {
            const word = row.word?.trim()
            if (word) reserved.add(word.toLowerCase())
          }
        }
      }
    })
  })
  return { reserved: [...reserved], type1Words }
}

export function buildWorksheets(pages: PageConfig[], seed: number): WorksheetPage[] {
  let exerciseNo = 1
  const out: WorksheetPage[] = []
  const { reserved, type1Words } = collectSoutienReservedWords(pages, seed)
  const pagesWithExclude =
    reserved.length > 0 || type1Words.length > 0
      ? pages.map((page) => ({
          ...page,
          soutienExcludeWords: reserved.length > 0 ? reserved : page.soutienExcludeWords,
          soutienType1Words: type1Words.length > 0 ? type1Words : page.soutienType1Words,
        }))
      : pages

  pagesWithExclude.forEach((page, index) => {
    const worksheet = buildPage(page, seed + index * 7919, exerciseNo, seed)
    const scoredBlocks = worksheet.blocks.filter((block) => !isInfoPageType(block.exerciseType))
    if (scoredBlocks.length) {
      exerciseNo = Math.max(...scoredBlocks.map((block) => block.exerciseIndex)) + 1
    }

    const isCom =
      page.exerciseType.includes('-com-orale') || page.exerciseType.includes('-com-ecrite')
    const isTheory =
      isGrammarTheoryType(page.exerciseType) || isGrammaireTheoryType(page.exerciseType)
    const isJeuxDuplex =
      page.exerciseType === 'jeux-vocabulaire' ||
      page.exerciseType === 'jeux-devinettes' ||
      page.exerciseType === 'jeux-memory' ||
      page.exerciseType === 'jeux-intrus' ||
      page.exerciseType === 'jeux-dominos'
    // Jeux recto-verso : une feuille A4 par grille (recto puis verso).
    // Pas « suite » : ce sont deux faces d’une même fiche, pas un débordement.
    if (isJeuxDuplex && worksheet.items.length >= 2) {
      const block = worksheet.blocks[0]
      worksheet.items.forEach((item, part) => {
        const side = part === 0 ? 'Recto' : 'Verso'
        out.push({
          ...worksheet,
          title: `${worksheet.title} — ${side}`,
          instruction: '',
          items: [item],
          blocks: block
            ? [
                {
                  ...block,
                  title: side,
                  instruction: '',
                  items: [item],
                },
              ]
            : worksheet.blocks,
          configIndex: index,
          isContinuation: false,
        })
      })
      return
    }
    // Loto : paires (page grilles + verso thème), puis lot animateur.
    if (page.exerciseType === 'jeux-loto' && worksheet.items.length > 0) {
      const block = worksheet.blocks[0]
      const pushSheet = (item: (typeof worksheet.items)[number], side: string) => {
        out.push({
          ...worksheet,
          title: side ? `${worksheet.title} — ${side}` : worksheet.title,
          instruction: '',
          items: [item],
          blocks: block
            ? [{ ...block, title: side || block.title, instruction: '', items: [item] }]
            : worksheet.blocks,
          configIndex: index,
          isContinuation: false,
        })
      }
      let i = 0
      while (i < worksheet.items.length) {
        const cur = worksheet.items[i]!
        const next = worksheet.items[i + 1]
        const kind = cur.gameBoard?.kind
        if (kind === 'loto-page' && next?.gameBoard?.kind === 'loto-back') {
          pushSheet(cur, 'Recto')
          pushSheet(next, 'Verso')
          i += 2
          continue
        }
        pushSheet(cur, kind === 'loto-call' ? 'Lot animateur' : '')
        i += 1
      }
      return
    }
    // TCF : sauts de page manuels après certaines questions (marge « Page »).
    if (page.domain === TCF_DOMAIN) {
      const sourceBlock = worksheet.blocks[0]
      const breaks = sourceBlock?.tcfPageBreakAfter ?? page.tcfPageBreakAfter
      const items = sourceBlock?.items ?? worksheet.items
      const cutAfter = new Set<number>()
      breaks?.forEach((on, i) => {
        if (on && i < items.length - 1) cutAfter.add(i)
      })
      if (cutAfter.size > 0 && sourceBlock) {
        const segments: number[][] = []
        let current: number[] = []
        items.forEach((_, i) => {
          current.push(i)
          if (cutAfter.has(i)) {
            segments.push(current)
            current = []
          }
        })
        if (current.length) segments.push(current)
        segments.forEach((indexes, part) => {
          const sliceItems = indexes.map((i) => items[i]!)
          const offset = indexes[0] ?? 0
          out.push({
            ...worksheet,
            title: part === 0 ? worksheet.title : `${worksheet.title} — suite`,
            instruction:
              part === 0 ? worksheet.instruction : 'Continuez. Répondez aux questions suivantes.',
            items: sliceItems,
            blocks: [
              {
                ...sourceBlock,
                title:
                  part === 0
                    ? sourceBlock.title
                    : `${sourceBlock.title.replace(/ \(suite\)$/, '')} (suite)`,
                instruction:
                  part === 0
                    ? sourceBlock.instruction
                    : 'Continuez. Répondez aux questions suivantes.',
                items: sliceItems,
                itemOffset: offset,
                // Tableaux complets : les callbacks UI rajoutent itemOffset.
                tcfPageBreakAfter: breaks,
                tcfFormModes: sourceBlock.tcfFormModes,
              },
            ],
            configIndex: index,
            isContinuation: part > 0,
          })
        })
        return
      }
    }

    // Théorie : ~6 blocs par feuille A4 (titres + tableaux densent vite).
    const pageCap = isTheory ? 6 : 4
    const totalItems = worksheet.items.length
    if (!page.continueOnNextPage || !(isCom || isTheory) || totalItems <= pageCap) {
      out.push({ ...worksheet, configIndex: index, isContinuation: false })
      return
    }

    const suiteInstruction = isTheory
      ? 'Suite de la théorie.'
      : 'Continuez. Répondez aux questions suivantes.'
    const suiteTitleSuffix = isTheory ? 'Suite de la théorie.' : 'Suite des questions.'

    let offset = 0
    let part = 0
    while (offset < totalItems) {
      const sliceEnd = offset + pageCap
      const headBlocks = worksheet.blocks
        .map((block) => ({
          ...block,
          title: part === 0 ? block.title : `${block.title.replace(/ \(suite\)$/, '')} (suite)`,
          instruction: part === 0 ? block.instruction : suiteInstruction,
          document: part === 0 ? block.document : undefined,
          items: block.items.slice(offset, sliceEnd),
          oralAnswerModes: block.oralAnswerModes?.slice(offset, sliceEnd),
          problemDraftGrids: block.problemDraftGrids?.slice(offset, sliceEnd),
        }))
        .filter((block) => block.items.length > 0)

      out.push({
        ...worksheet,
        title: part === 0 ? worksheet.title : `${worksheet.title} — suite`,
        instruction: part === 0 ? worksheet.instruction : suiteTitleSuffix,
        items: headBlocks.flatMap((block) => block.items),
        blocks: headBlocks,
        configIndex: index,
        isContinuation: part > 0,
      })
      offset = sliceEnd
      part++
    }
  })

  return out
}
