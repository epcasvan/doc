/**
 * Générateurs d’items TCM CFR (types `tcm-cfr-*`).
 */
import { genFracSingleItems } from '@/math/fraction-shapes'
import { createRng, int, pick, shuffle, type Rng } from '@/math/rng'
import type { ArithOp, Figure, MathItem } from '@/math/types'
import { fmt, sanitizeItemNumberNoise } from '@/math/column-arith'
import { FRACTION_WORDS } from '@/tpm/fraction-words'
import {
  columnItem,
  divisionColumnItem,
  withFixedColumnWidth,
  withFixedDivisionWidth,
  withFixedDivisionWorkRows,
} from '@/tpm/items'
import { mulAudioParts, numberAudioParts } from './audio-nombres'
import { generateMetroQuestions, pickMetroMap } from './metro'
import { genShopProblems, genWorkProblems } from './problems'
import { pickSymmetryTemplate } from './symetrie'
import { isTcmCfrType } from './types'

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

function oneDecimal(rng: Rng, loTenths: number, hiTenths: number): number {
  let t = int(rng, loTenths, hiTenths)
  while (t % 10 === 0) t = int(rng, loTenths, hiTenths)
  return Math.round(t) / 10
}

/** Construit un décimal scolaire à partir de centièmes entiers (évite le bruit binaire). */
function fromCents(unit: number, cents: number): number {
  return (unit * 100 + Math.max(0, Math.round(cents))) / 100
}

/** Ex. 1 — 5 nombres audio 11–99. */
function genEx01(rng: Rng, count: number): MathItem[] {
  const used = new Set<number>()
  return Array.from({ length: Math.max(1, count) }, () => {
    let n = int(rng, 11, 99)
    let guard = 0
    while (used.has(n) && guard < 40) {
      n = int(rng, 11, 99)
      guard++
    }
    used.add(n)
    const parts = numberAudioParts(n)
    return {
      layout: 'audio-dictation' as const,
      prompt: '',
      audioParts: parts,
      audioSrc: parts[0],
      answer: String(n),
    }
  })
}

/** Ex. 2 — 5 multiplications orales 2–12 × 2–12. */
function genEx02(rng: Rng, count: number): MathItem[] {
  return Array.from({ length: Math.max(1, count) }, () => {
    const a = int(rng, 1, 12)
    const b = int(rng, 1, 12)
    const parts = mulAudioParts(a, b)
    return {
      layout: 'audio-dictation' as const,
      prompt: '',
      left: String(a),
      right: String(b),
      audioParts: parts,
      audioSrc: parts[0],
      answer: String(a * b),
    }
  })
}

/** Ex. 3 — ranger 7 nombres (Q1 mixtes 10–100 ; Q2 même unité, décimales variables). */
function genEx03(rng: Rng): MathItem[] {
  const orderItem = (
    ascending: boolean,
    sequence: string[],
    ordered: string[],
  ): MathItem => ({
    layout: 'order',
    sequence,
    placeParts: ordered,
    orderBoxed: true,
    /** Cadres / traits compacts (max. 3 chiffres) pour tenir sur une ligne. */
    orderCompact: true,
    orderOp: ascending ? '<' : '>',
    prompt: ascending ? 'Du plus petit au plus grand :' : 'Du plus grand au plus petit :',
    answer: ordered.join(ascending ? ' < ' : ' > '),
  })

  // Q1 — 7 nombres 10–100, 0 ou 1 décimale.
  const q1vals: number[] = []
  while (q1vals.length < 7) {
    const withDec = rng() < 0.5
    const v = withDec ? oneDecimal(rng, 100, 1000) : int(rng, 10, 100)
    if (v < 10 || v > 100) continue
    if (q1vals.some((x) => Math.abs(x - v) < 1e-9)) continue
    q1vals.push(v)
  }
  const q1Asc = rng() < 0.5
  const q1Shuf = shuffle(rng, q1vals)
  const q1Ord = [...q1Shuf].sort((a, b) => (q1Asc ? a - b : b - a))

  // Q2 — même partie entière, décimales variables (6 · 6,1 · 6,01 · 6,11…).
  const unit = int(rng, 2, 9)
  const kinds: Array<() => number> = [
    () => unit,
    () => fromCents(unit, int(rng, 1, 9) * 10),
    () => fromCents(unit, int(rng, 1, 9)),
    () => fromCents(unit, int(rng, 1, 9) * 10 + int(rng, 1, 9)),
    () => fromCents(unit, int(rng, 1, 9) * 10),
    () => fromCents(unit, int(rng, 10, 99)),
    () => fromCents(unit, int(rng, 1, 9)),
  ]
  const q2vals: number[] = []
  const seen = new Set<string>()
  for (const make of shuffle(rng, kinds)) {
    let v = make()
    let key = fmt(v)
    let g = 0
    while (seen.has(key) && g < 20) {
      v = make()
      key = fmt(v)
      g++
    }
    if (!seen.has(key)) {
      seen.add(key)
      q2vals.push(v)
    }
    if (q2vals.length >= 7) break
  }
  while (q2vals.length < 7) {
    const v = fromCents(unit, int(rng, 0, 99))
    const key = fmt(v)
    if (!seen.has(key)) {
      seen.add(key)
      q2vals.push(v)
    }
  }
  const q2Asc = !q1Asc
  const q2Shuf = shuffle(rng, q2vals)
  const q2Ord = [...q2Shuf].sort((a, b) => (q2Asc ? a - b : b - a))

  return [
    orderItem(q1Asc, q1Shuf.map(fmt), q1Ord.map(fmt)),
    orderItem(q2Asc, q2Shuf.map(fmt), q2Ord.map(fmt)),
  ]
}

/** Ex. 4 — comparer décimaux (style 4,7 / 7,4 · 8,10 / 8,1…). */
function genEx04(rng: Rng, count: number): MathItem[] {
  const makers: Array<() => { left: string; right: string; answer: string }> = [
    () => {
      const a = oneDecimal(rng, 11, 99)
      const b = oneDecimal(rng, 11, 99)
      if (a === b) return { left: fmt(a), right: fmt(a), answer: '=' }
      return a < b
        ? { left: fmt(a), right: fmt(b), answer: '<' }
        : { left: fmt(a), right: fmt(b), answer: '>' }
    },
    () => {
      // Même chiffres permutés (4,7 vs 7,4).
      const d1 = int(rng, 1, 9)
      let d2 = int(rng, 1, 9)
      while (d2 === d1) d2 = int(rng, 1, 9)
      const a = d1 + d2 / 10
      const b = d2 + d1 / 10
      return a < b
        ? { left: fmt(a), right: fmt(b), answer: '<' }
        : { left: fmt(a), right: fmt(b), answer: '>' }
    },
    () => {
      // 8,10 vs 8,1 (égalité écrite différente).
      const u = int(rng, 2, 12)
      const t = int(rng, 1, 9)
      return { left: `${u},${t}0`, right: `${u},${t}`, answer: '=' }
    },
    () => {
      // 12,1 vs 12,01.
      const u = int(rng, 10, 20)
      const a = u + 1 / 10
      const b = u + 1 / 100
      return { left: fmt(a), right: fmt(b), answer: '>' }
    },
  ]
  const picked = shuffle(rng, makers).slice(0, Math.max(1, count))
  while (picked.length < count) picked.push(pick(rng, makers))
  return picked.map((make) => {
    const { left, right, answer } = make()
    return { layout: 'compare' as const, left, right, answer }
  })
}

/** Ex. 5 — décomposer 101–999 et 1001–9999. */
function genEx05(rng: Rng): MathItem[] {
  const small = int(rng, 101, 999)
  const big = int(rng, 1001, 9999)
  const decomp = (value: number, four: boolean): MathItem => {
    const u = value % 10
    const d = Math.floor((value % 100) / 10)
    const c = Math.floor((value % 1000) / 100)
    const m = Math.floor(value / 1000)
    const placeParts = four
      ? [String(m * 1000), String(c * 100), String(d * 10), String(u)]
      : [String(c * 100), String(d * 10), String(u)]
    const labels = four
      ? ['milliers', 'centaines', 'dizaines', 'unités']
      : ['centaines', 'dizaines', 'unités']
    return {
      layout: 'place-value',
      prompt: value.toLocaleString('fr-CH'),
      labels,
      placeParts,
      answer: placeParts.join(' + '),
    }
  }
  return rng() < 0.5
    ? [decomp(small, false), decomp(big, true)]
    : [decomp(big, true), decomp(small, false)]
}

/** Ex. 6 — nommer + × ÷ − (signe encadré, trait sur la même ligne). */
function genEx06(rng: Rng): MathItem[] {
  const ops: Array<{ op: ArithOp; word: string }> = [
    { op: '+', word: 'plus' },
    { op: '−', word: 'moins' },
    { op: '×', word: 'fois' },
    { op: '÷', word: 'diviser' },
  ]
  return shuffle(rng, ops).map(({ op, word }) => ({
    layout: 'inline' as const,
    op,
    prompt: op,
    answer: word,
  }))
}

/**
 * Ex. 7 / 8 — 2 + et 2 −, nombres 100–9999 (7 colonnes).
 * `empty` : calcul au-dessus, grille vide (l’élève pose les chiffres).
 */
function genAddSubFour(rng: Rng, empty: boolean): MathItem[] {
  const width = 7
  const mkAdd = (): MathItem => {
    const a = int(rng, 100, 9999)
    const b = int(rng, 100, 9999)
    return withFixedColumnWidth(columnItem('+', a, b, a + b, empty), width)
  }
  const mkSub = (): MathItem => {
    let a = int(rng, 100, 9999)
    let b = int(rng, 100, 9999)
    if (b > a) [a, b] = [b, a]
    while (a === b) {
      a = int(rng, 100, 9999)
      b = int(rng, 100, Math.min(a, 9999))
    }
    return withFixedColumnWidth(columnItem('−', a, b, a - b, empty), width)
  }
  return shuffle(rng, [mkAdd(), mkAdd(), mkSub(), mkSub()])
}

/** × 100–999 × 11–99 et ÷ 1000–9999 ÷ 2–9. */
function genMulDivPair(rng: Rng, empty: boolean): MathItem[] {
  const a = int(rng, 100, 999)
  const b = int(rng, 11, 99)
  const mul = withFixedColumnWidth(columnItem('×', a, b, a * b, empty), 7)
  const d = int(rng, 2, 9)
  const qMin = Math.ceil(1000 / d)
  const qMax = Math.floor(9999 / d)
  const quot = int(rng, qMin, qMax)
  const div = withFixedDivisionWorkRows(
    withFixedDivisionWidth(divisionColumnItem(d * quot, d, empty), 4, 4),
  )
  return rng() < 0.5 ? [mul, div] : [div, mul]
}

/** Ex. 9 — nombres dans la grille. */
function genEx09(rng: Rng): MathItem[] {
  return genMulDivPair(rng, false)
}

/** Ex. 10 — même structure que l’ex. 9, nombres hors grille. */
function genEx10(rng: Rng): MathItem[] {
  return genMulDivPair(rng, true)
}

/** Ex. 11 — termes → fraction verticale (numérateurs et dénominateurs tous distincts). */
function genEx11(rng: Rng, count: number): MathItem[] {
  const need = Math.max(1, count)
  const pool = shuffle(rng, [...FRACTION_WORDS])
  const picked: Array<(typeof FRACTION_WORDS)[number]> = []
  const usedN = new Set<number>()
  const usedD = new Set<number>()
  for (const entry of pool) {
    if (picked.length >= need) break
    if (usedN.has(entry.n) || usedD.has(entry.d)) continue
    usedN.add(entry.n)
    usedD.add(entry.d)
    picked.push(entry)
  }
  // Repli si le pool ne suffit pas (ne devrait pas arriver avec count ≤ 4).
  for (const entry of pool) {
    if (picked.length >= need) break
    if (picked.some((p) => p.term === entry.term)) continue
    if (usedN.has(entry.n) && usedD.has(entry.d)) continue
    if (!usedN.has(entry.n) && !usedD.has(entry.d)) {
      usedN.add(entry.n)
      usedD.add(entry.d)
      picked.push(entry)
    }
  }
  return picked.map(({ term, n, d }) => ({
    layout: 'inline' as const,
    prompt: `${term} =`,
    a: n,
    b: d,
    answer: `${n}/${d}`,
  }))
}

/** Ex. 12 / 13 — formes simples distinctes. */
function genFracShapes(rng: Rng, count: number, mode: 'color' | 'read'): MathItem[] {
  return genFracSingleItems(rng, Math.max(1, count)).map((item) => ({
    layout: 'fraction-shape' as const,
    fracShape: { ...item, mode },
    answer: `${item.n}/${item.d}`,
  }))
}

function genEx14(rng: Rng): MathItem[] {
  return genShopProblems(rng)
}

function genEx15(rng: Rng): MathItem[] {
  return genWorkProblems(rng)
}

type NamedFigure = {
  figure: Figure
  name: string
  props: [string, string]
  dims?: MathItem['dims']
}

const BARE = { bare: true } as const

const FIG_SQUARE: NamedFigure = {
  figure: 'square',
  name: 'carré',
  props: ['4 côtés égaux', '4 angles droits'],
  dims: { ...BARE },
}
const FIG_RECT: NamedFigure = {
  figure: 'rectangle',
  name: 'rectangle',
  props: ['côtés opposés égaux', '4 angles droits'],
  dims: { ...BARE },
}
const FIG_RHOMBUS: NamedFigure = {
  figure: 'rhombus',
  name: 'losange',
  props: ['4 côtés égaux', 'angles opposés égaux'],
  dims: { ...BARE },
}
const FIG_PARA: NamedFigure = {
  figure: 'parallelogram',
  name: 'parallélogramme',
  props: ['côtés opposés parallèles', 'côtés opposés égaux'],
  dims: { ...BARE },
}
const FIG_RIGHT_TRI: NamedFigure = {
  figure: 'triangle',
  name: 'triangle rectangle',
  props: ['un angle droit', '3 côtés'],
  dims: { ...BARE, triangleKind: 'right' },
}
const FIG_EQUI: NamedFigure = {
  figure: 'triangle',
  name: 'triangle équilatéral',
  props: ['3 côtés égaux', '3 angles égaux'],
  dims: { ...BARE, triangleKind: 'equilateral' },
}
const FIG_ISO: NamedFigure = {
  figure: 'triangle',
  name: 'triangle isocèle',
  props: ['2 côtés égaux', '2 angles égaux'],
  dims: { ...BARE, triangleKind: 'isosceles' },
}
const FIG_CIRCLE: NamedFigure = {
  figure: 'circle',
  name: 'cercle',
  props: ['tous les points à égale distance du centre', 'pas de côté'],
  dims: { ...BARE },
}
const FIG_TRAP: NamedFigure = {
  figure: 'trapezoid',
  name: 'trapèze',
  props: ['une paire de côtés parallèles', '4 côtés'],
  dims: { ...BARE, trapezoidKind: 'isosceles' },
}
const FIG_PENTA: NamedFigure = {
  figure: 'pentagon',
  name: 'pentagone',
  props: ['5 côtés', '5 sommets'],
  dims: { ...BARE },
}

function namedFigureCard(fig: NamedFigure, withProps: boolean): MathItem {
  const lines = withProps
    ? [
        { label: 'Nom', answer: fig.name },
        { label: 'Propriété 1', answer: fig.props[0] },
        { label: 'Propriété 2', answer: fig.props[1] },
      ]
    : [{ label: 'Nom', answer: fig.name }]
  return {
    layout: 'geo',
    figure: fig.figure,
    dims: fig.dims,
    geoNameCard: true,
    propertyLines: lines,
    answer: withProps ? `${fig.name} ; ${fig.props[0]} ; ${fig.props[1]}` : fig.name,
  }
}

/** Choix lié ex. 16 / 17 : losange dans l’un, parallélogramme dans l’autre. */
function rhombusInEx16(worksheetSeed: number): boolean {
  return createRng(worksheetSeed ^ 0x16f17a)() < 0.5
}

/**
 * Ex. 16 — 3 formes : (carré|rectangle), (losange|parallélogramme),
 * (équilatéral|rectangle|isocèle). Ordre mélangé, cadres empilés.
 */
function genEx16(rng: Rng, worksheetSeed: number): MathItem[] {
  const form1 = pick(rng, [FIG_SQUARE, FIG_RECT])
  const form2 = rhombusInEx16(worksheetSeed) ? FIG_RHOMBUS : FIG_PARA
  const form3 = pick(rng, [FIG_EQUI, FIG_RIGHT_TRI, FIG_ISO])
  return shuffle(rng, [form1, form2, form3]).map((fig) => namedFigureCard(fig, true))
}

/**
 * Ex. 17 — cercle, (parallélogramme|losange inverse de 16), (trapèze|pentagone).
 */
function genEx17(rng: Rng, worksheetSeed: number): MathItem[] {
  const form1 = FIG_CIRCLE
  const form2 = rhombusInEx16(worksheetSeed) ? FIG_PARA : FIG_RHOMBUS
  const form3 = pick(rng, [FIG_TRAP, FIG_PENTA])
  return shuffle(rng, [form1, form2, form3]).map((fig) => namedFigureCard(fig, false))
}

/** Ex. 14 (type ex18) — symétrie axiale ; consigne via le catalogue uniquement. */
function genEx18(rng: Rng): MathItem[] {
  const tpl = pickSymmetryTemplate(rng)
  return [
    {
      layout: 'symmetry-grid' as const,
      symmetryFigure: tpl,
      answer: tpl.id,
    },
  ]
}

/** Ex. 19 — mesurer 3 segments + QCM. */
function genEx19(rng: Rng): MathItem[] {
  const lengthsMm = shuffle(rng, [
    int(rng, 25, 45),
    int(rng, 50, 80),
    int(rng, 90, 120),
  ])
  const units: Array<'mm' | 'cm'> = shuffle(rng, ['mm', 'cm', pick(rng, ['mm', 'cm'] as const)])
  // Garantir au moins 1 cm et 1 mm.
  if (!units.includes('cm')) units[0] = 'cm'
  if (!units.includes('mm')) units[1] = 'mm'
  const segments = lengthsMm.map((mm, i) => ({
    mm,
    unit: units[i]!,
    display: units[i] === 'cm' ? fmt(mm / 10) : String(mm),
  }))
  const letters = ['a', 'b', 'c'] as const
  const longest = segments.reduce((best, s, i) => (s.mm > segments[best]!.mm ? i : best), 0)
  const shortest = segments.reduce((best, s, i) => (s.mm < segments[best]!.mm ? i : best), 0)
  const qLongFirst = rng() < 0.5
  return [
    {
      layout: 'segment-measure' as const,
      segments,
      selectVariant: 'pills',
      options: qLongFirst
        ? [
            'Quel segment est le plus long ?',
            'Quel segment est le plus court ?',
          ]
        : [
            'Quel segment est le plus court ?',
            'Quel segment est le plus long ?',
          ],
      answer: qLongFirst
        ? `${letters[longest]} ; ${letters[shortest]}`
        : `${letters[shortest]} ; ${letters[longest]}`,
      labels: segments.map((s) => `${s.display} ${s.unit}`),
    },
  ]
}

/** Ex. 20 — conversions m/dm/cm/mm uniquement. */
function genEx20(rng: Rng, count: number): MathItem[] {
  const units = ['m', 'dm', 'cm', 'mm'] as const
  const factors: Record<(typeof units)[number], number> = { m: 1000, dm: 100, cm: 10, mm: 1 }
  const items: MathItem[] = []
  const usedPairs = new Set<string>()
  while (items.length < count) {
    const from = pick(rng, [...units])
    let to = pick(rng, [...units])
    while (to === from) to = pick(rng, [...units])
    const key = `${from}->${to}`
    if (usedPairs.has(key)) continue
    usedPairs.add(key)
    const valueMm = int(rng, 1, 50) * factors[from]
    // Valeur « ronde » dans l’unité de départ.
    const value = valueMm / factors[from]
    const result = valueMm / factors[to]
    items.push({
      layout: 'inline',
      convert: { value: fmt(value), from, to },
      prompt: `${fmt(value)} ${from} = □ ${to}`,
      answer: fmt(result),
    })
  }
  return items
}

/** Ex. 21 — fractions → décimaux, dénominateurs distincts, non entiers. */
function genEx21(rng: Rng, count: number): MathItem[] {
  const dens = shuffle(rng, [2, 4, 5, 8, 10]).slice(0, count)
  while (dens.length < count) dens.push(pick(rng, [2, 4, 5, 8, 10]))
  return dens.map((d) => {
    let n = int(rng, 1, d - 1)
    while (n % d === 0) n = int(rng, 1, d - 1)
    const g = gcd(n, d)
    // Garder une fraction non entière.
    const nn = n / g
    const dd = d / g
    const value = nn / dd
    return {
      layout: 'inline' as const,
      prompt: `${nn}/${dd} =`,
      answer: fmt(Math.round(value * 1000) / 1000),
    }
  })
}

function dualGeo(
  figure: Figure,
  dims: NonNullable<MathItem['dims']>,
  periExpr: string,
  areaExpr: string,
  peri: number,
  area: number,
): MathItem {
  return {
    layout: 'geo',
    figure,
    dims: { ...dims, unit: dims.unit ?? 'cm' },
    geoDualPads: true,
    geoDualTight: true,
    calcAnswer: periExpr,
    calcAnswerSecondary: areaExpr,
    propertyLines: [
      { label: 'Périmètre', answer: `${fmt(peri)} cm` },
      { label: 'Aire', answer: `${fmt(area)} cm²` },
    ],
    answer: `Périmètre = ${fmt(peri)} cm ; Aire = ${fmt(area)} cm²`,
  }
}

/** Ex. 22 — carré décimal. */
function genEx22(rng: Rng): MathItem[] {
  const side = oneDecimal(rng, 20, 90)
  const peri = Math.round(4 * side * 10) / 10
  const area = Math.round(side * side * 100) / 100
  return [
    dualGeo(
      'square',
      { side, length: side },
      `4 × ${fmt(side)}`,
      `${fmt(side)} × ${fmt(side)}`,
      peri,
      area,
    ),
  ]
}

/** Ex. 23 — rectangle décimal. */
function genEx23(rng: Rng): MathItem[] {
  const length = oneDecimal(rng, 30, 120)
  let width = oneDecimal(rng, 20, 90)
  while (Math.abs(width - length) < 0.05) width = oneDecimal(rng, 20, 90)
  const peri = Math.round(2 * (length + width) * 10) / 10
  const area = Math.round(length * width * 100) / 100
  return [
    dualGeo(
      'rectangle',
      { length, width },
      `2 × (${fmt(length)} + ${fmt(width)})`,
      `${fmt(length)} × ${fmt(width)}`,
      peri,
      area,
    ),
  ]
}

/** Ex. 24 — triangle (a, c, h décimaux ; b entier). */
function genEx24(rng: Rng): MathItem[] {
  const a = oneDecimal(rng, 50, 120)
  let b = int(rng, 4, 12)
  while (Math.abs(b - a) < 0.05) b = int(rng, 4, 12)
  let c = oneDecimal(rng, 40, 110)
  while (Math.abs(c - a) < 0.05 || Math.abs(c - b) < 0.05) c = oneDecimal(rng, 40, 110)
  const h = oneDecimal(rng, 20, 60)
  const peri = Math.round((a + b + c) * 10) / 10
  const area = Math.round(((a * h) / 2) * 100) / 100
  return [
    dualGeo(
      'triangle',
      { a, b, c, height: h, triangleKind: 'scalene' },
      `${fmt(a)} + ${fmt(b)} + ${fmt(c)}`,
      `(${fmt(a)} × ${fmt(h)}) ÷ 2`,
      peri,
      area,
    ),
  ]
}

/** Ex. 25 — périmètre du carré → côté (cote absente ; brouillon comme ex. 22). */
function genEx25(rng: Rng): MathItem[] {
  const side = int(rng, 3, 12)
  const perimeter = 4 * side
  return [
    {
      layout: 'geo',
      figure: 'square',
      // Pas de cote affichée : c’est la valeur cherchée.
      dims: { perimeter, unit: 'cm' },
      prompt:
        'Le périmètre de ce carré est [périmètre] cm. Quelle est la longueur d’un côté ?',
      geoDualPads: true,
      geoDualTight: true,
      hideItemNumber: true,
      calcAnswer: `${perimeter} ÷ 4 = ${side}`,
      propertyLines: [{ label: 'Côté', answer: `${side} cm` }],
      answer: `${side} cm`,
    },
  ]
}

/** Ex. 26 — périmètre rectangle + un côté → autre côté (cote cherchée masquée). */
function genEx26(rng: Rng): MathItem[] {
  const length = int(rng, 4, 14)
  let width = int(rng, 2, 10)
  while (width === length) width = int(rng, 2, 10)
  const perimeter = 2 * (length + width)
  const giveLength = rng() < 0.5
  const known = giveLength ? length : width
  const unknown = giveLength ? width : length
  const knownLabel = giveLength ? 'longueur' : 'largeur'
  return [
    {
      layout: 'geo',
      figure: 'rectangle',
      // Afficher uniquement le côté connu ; masquer celui cherché.
      dims: giveLength
        ? { length, perimeter, unit: 'cm' }
        : { width, perimeter, unit: 'cm' },
      prompt: `Le périmètre de ce rectangle est [périmètre] cm. La ${knownLabel} mesure [côté] cm. Quelle est la longueur de l’autre côté ?`,
      geoDualPads: true,
      geoDualTight: true,
      hideItemNumber: true,
      calcAnswer: `${perimeter} ÷ 2 − ${known} = ${unknown}`,
      propertyLines: [{ label: 'Côté', answer: `${unknown} cm` }],
      answer: `${unknown} cm`,
    },
  ]
}

/** Ex. 27 — cadran I : toujours 24×24 cases positives ; graduation 1 u/case ou 1 u/2 cases. */
function genEx27(rng: Rng): MathItem[] {
  const positiveCells = 24
  // Deux types de graduation : 1 unité = 1 case (max 24) ou 1 unité = 2 cases (max 12).
  // Le nombre de cases positives reste fixe ; seule l’échelle change.
  const unitSquares = rng() < 0.5 ? 1 : 2
  const maxUnit = positiveCells / unitSquares
  // 1 u/case → entiers ; 1 u/2 cases → demis (ex. 5,5) sur chaque intersection.
  const step = unitSquares === 2 ? 0.5 : 1
  // Marge négative (−1) toujours 2 cases + trait à −1 + « 0 » au centre — identique
  // pour les deux graduations (1 u/case et 1 u/2 cases). Ne pas lier à unitSquares.
  const originCol = 2
  const originRow = 2
  // Pas de cases « flèche » en plus : la dernière graduation = +24 (ou +12 si 1 u/2 cases).
  // Les flèches dépassent dans le padding SVG, pas dans des cases supplémentaires.
  const visibleCols = originCol + positiveCells
  const visibleRows = visibleCols
  const cols = visibleCols
  const rows = visibleRows
  const maxGridMm = 168
  const cellMmAllowed = [10, 8, 6, 5, 4, 3] as const
  const cellMm =
    cellMmAllowed.find((mm) => visibleCols * mm <= maxGridMm + 0.5) ?? 3
  // Traits de graduation tous les 2 carrés → 2 u (1 u/case) ou 1 u (1 u/2 cases).
  const labelStep = unitSquares === 1 ? 2 : 1

  const placeLetters = shuffle(rng, 'ABCDEGHJKLMNPQRST'.split('')).slice(0, 3)
  const readLetters = shuffle(
    rng,
    'ABCDEGHJKLMNPQRSTUVWXYZ'.split('').filter((l) => !placeLetters.includes(l)),
  ).slice(0, 3)

  const maxSteps = Math.round(maxUnit / step)
  const pickUnit = (allowZero: boolean): number => {
    const minSteps = allowZero ? 0 : 1
    return Math.round(int(rng, minSteps, maxSteps) * step * 1000) / 1000
  }

  type Pt = { x: number; y: number; label: string }
  const used = new Set<string>()
  const take = (label: string, onAxis: boolean): Pt => {
    let x = 0
    let y = 0
    let g = 0
    do {
      if (onAxis) {
        if (rng() < 0.5) {
          x = pickUnit(false)
          y = 0
        } else {
          x = 0
          y = pickUnit(false)
        }
      } else {
        x = pickUnit(false)
        y = pickUnit(false)
      }
      g++
    } while (used.has(`${x},${y}`) && g < 60)
    used.add(`${x},${y}`)
    return { x, y, label }
  }

  const allLabels = [...placeLetters, ...readLetters]
  const axisIndex = int(rng, 0, allLabels.length - 1)
  const ptsPlace: Pt[] = placeLetters.map((label, i) => take(label, i === axisIndex))
  const ptsRead: Pt[] = readLetters.map((label, i) =>
    take(label, placeLetters.length + i === axisIndex),
  )
  const pair = (x: number, y: number) => `(${fmt(x)} ; ${fmt(y)})`

  return [
    {
      layout: 'coord',
      prompt: 'cfr-plan',
      coordScene: {
        variant: 'axes',
        cols,
        rows,
        visibleCols,
        visibleRows,
        axis: 'numeric',
        rangeX: maxUnit + 1,
        rangeY: maxUnit + 1,
        originCol,
        originRow,
        hideAxes: false,
        hideAxisLabels: true,
        axisArrows: true,
        showOrigin: true,
        originZeroInNegCell: true,
        cellMm,
        unitSquares,
        labelStep,
        step,
        marks: [
          ...ptsPlace.map((p) => ({
            x: p.x,
            y: p.y,
            kind: 'point' as const,
            label: p.label,
            reveal: 'answer' as const,
          })),
          ...ptsRead.map((p) => ({
            x: p.x,
            y: p.y,
            kind: 'point' as const,
            label: p.label,
            reveal: 'always' as const,
          })),
        ],
      },
      coordQuestions: [
        ...ptsPlace.map((p) => ({
          prompt: `Placez ${p.label}${pair(p.x, p.y)}`,
          answer: pair(p.x, p.y),
          reply: 'pair' as const,
        })),
        ...ptsRead.map((p) => ({
          prompt: `Écrivez les coordonnées du point ${p.label}.`,
          answer: pair(p.x, p.y),
          reply: 'pair' as const,
        })),
      ],
      answer: [...ptsPlace, ...ptsRead].map((p) => `${p.label}${pair(p.x, p.y)}`).join(' ; '),
    },
  ]
}

/** Ex. 28 — plan de métro. */
function genEx28(rng: Rng): MathItem[] {
  const map = pickMetroMap(rng)
  const questions = generateMetroQuestions(rng, map)
  return [
    {
      layout: 'metro-map' as const,
      metroMap: map,
      metroQuestions: questions,
      answer: questions.map((q) => q.answer).join(' ; '),
    },
  ]
}

export function tryGenerateTcmCfrItems(
  typeId: string,
  count: number,
  rng: Rng,
  worksheetSeed = 0,
): MathItem[] | null {
  if (!isTcmCfrType(typeId)) return null
  // Page Informations : générée via `generateTpmInformations` dans `math/generate.ts`.
  if (typeId === 'tcm-cfr-consignes') return []
  let items: MathItem[] | null = null
  if (typeId === 'tcm-cfr-ex01') items = genEx01(rng, count)
  else if (typeId === 'tcm-cfr-ex02') items = genEx02(rng, count)
  else if (typeId === 'tcm-cfr-ex03') items = genEx03(rng).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex04') items = genEx04(rng, count)
  else if (typeId === 'tcm-cfr-ex05') items = genEx05(rng).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex06') items = genEx06(rng).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex07') items = genAddSubFour(rng, false).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex08') items = genAddSubFour(rng, true).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex09') items = genEx09(rng).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex10') items = genEx10(rng).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex11') items = genEx11(rng, count)
  else if (typeId === 'tcm-cfr-ex12') items = genFracShapes(rng, count, 'color')
  else if (typeId === 'tcm-cfr-ex13') items = genFracShapes(rng, count, 'read')
  else if (typeId === 'tcm-cfr-ex14') items = genEx14(rng).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex15') items = genEx15(rng).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex16') items = genEx16(rng, worksheetSeed).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex17') items = genEx17(rng, worksheetSeed).slice(0, Math.max(1, count))
  else if (typeId === 'tcm-cfr-ex18') items = genEx18(rng)
  else if (typeId === 'tcm-cfr-ex19') items = genEx19(rng)
  else if (typeId === 'tcm-cfr-ex20') items = genEx20(rng, count)
  else if (typeId === 'tcm-cfr-ex21') items = genEx21(rng, count)
  else if (typeId === 'tcm-cfr-ex22') items = genEx22(rng)
  else if (typeId === 'tcm-cfr-ex23') items = genEx23(rng)
  else if (typeId === 'tcm-cfr-ex24') items = genEx24(rng)
  else if (typeId === 'tcm-cfr-ex25') items = genEx25(rng)
  else if (typeId === 'tcm-cfr-ex26') items = genEx26(rng)
  else if (typeId === 'tcm-cfr-ex27') items = genEx27(rng)
  else if (typeId === 'tcm-cfr-ex28') items = genEx28(rng)
  if (!items) return null
  return items.map((item) => sanitizeItemNumberNoise(item))
}
