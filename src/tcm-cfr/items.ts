/**
 * Générateurs d’items TCM CFR (types `tcm-cfr-*`).
 */
import { genFracSingleItems } from '@/math/fraction-shapes'
import { createRng, int, pick, shuffle, type Rng } from '@/math/rng'
import type { ArithOp, Figure, MathItem } from '@/math/types'
import { fmt } from '@/math/column-arith'
import {
  columnItem,
  divisionColumnItem,
  withFixedColumnWidth,
  withFixedDivisionWidth,
  withFixedDivisionWorkRows,
} from '@/tcm/items'
import { mulAudioParts, numberAudioParts } from './audio-nombres'
import { generateMetroQuestions, pickMetroMap } from './metro'
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
    const a = int(rng, 2, 12)
    const b = int(rng, 2, 12)
    const parts = mulAudioParts(a, b)
    return {
      layout: 'audio-dictation' as const,
      prompt: '',
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

const FRACTION_WORDS: Array<{ term: string; n: number; d: number }> = [
  { term: 'un demi', n: 1, d: 2 },
  { term: 'trois demis', n: 3, d: 2 },
  { term: 'cinq demis', n: 5, d: 2 },
  { term: 'un tiers', n: 1, d: 3 },
  { term: 'deux tiers', n: 2, d: 3 },
  { term: 'quatre tiers', n: 4, d: 3 },
  { term: 'cinq tiers', n: 5, d: 3 },
  { term: 'un quart', n: 1, d: 4 },
  { term: 'trois quarts', n: 3, d: 4 },
  { term: 'cinq quarts', n: 5, d: 4 },
  { term: 'sept quarts', n: 7, d: 4 },
  { term: 'un cinquième', n: 1, d: 5 },
  { term: 'deux cinquièmes', n: 2, d: 5 },
  { term: 'trois cinquièmes', n: 3, d: 5 },
  { term: 'quatre cinquièmes', n: 4, d: 5 },
  { term: 'six cinquièmes', n: 6, d: 5 },
  { term: 'sept cinquièmes', n: 7, d: 5 },
  { term: 'un sixième', n: 1, d: 6 },
  { term: 'cinq sixièmes', n: 5, d: 6 },
  { term: 'sept sixièmes', n: 7, d: 6 },
  { term: 'un huitième', n: 1, d: 8 },
  { term: 'trois huitièmes', n: 3, d: 8 },
  { term: 'cinq huitièmes', n: 5, d: 8 },
  { term: 'neuf huitièmes', n: 9, d: 8 },
  { term: 'un dixième', n: 1, d: 10 },
  { term: 'trois dixièmes', n: 3, d: 10 },
  { term: 'sept dixièmes', n: 7, d: 10 },
  { term: 'neuf dixièmes', n: 9, d: 10 },
  { term: 'onze dixièmes', n: 11, d: 10 },
  { term: 'treize dixièmes', n: 13, d: 10 },
]

/** Ex. 11 — termes → fraction verticale (numérateurs et dénominateurs tous distincts). */
function genEx11(rng: Rng, count: number): MathItem[] {
  const need = Math.max(1, count)
  const pool = shuffle(rng, FRACTION_WORDS)
  const picked: typeof FRACTION_WORDS = []
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

type ProblemPart = {
  prompt: string
  calcAnswer: string
  responseAnswer: string
  answer: string
}

type ProblemTemplate = (rng: Rng) => [ProblemPart, ProblemPart]

function money(n: number): string {
  return fmt(Math.round(n * 100) / 100)
}

/**
 * Ex. 14 — pool de 10 problèmes courses (2 parties, 5–8 phrases narratives).
 * Modèle : récit détaillé type Nadia (magasin), nombres variables.
 */
const EX14_TEMPLATES: readonly ProblemTemplate[] = [
  (rng) => {
    const a = oneDecimal(rng, 20, 60)
    const b = oneDecimal(rng, 30, 90)
    const c = oneDecimal(rng, 15, 55)
    const total = Math.round((a + b + c) * 100) / 100
    const d1 = oneDecimal(rng, 15, 35)
    const d2 = oneDecimal(rng, 20, 45)
    const drink = Math.min(d1, d2)
    const spent = Math.round((total + drink) * 100) / 100
    const budget = Math.ceil(spent) + pick(rng, [5, 10, 15, 20])
    const reste = Math.round((budget - spent) * 100) / 100
    return [
      {
        prompt: `Nadia va au magasin avec ${budget} francs dans son porte-monnaie. Dans son panier, elle prend du riz à ${money(a)} francs et du poulet à ${money(b)} francs. Elle ajoute des carottes à ${money(c)} francs dans son panier. Elle se rend à la caisse.\n\nQuelle somme paye-t-elle ?`,
        calcAnswer: `${money(a)} + ${money(b)} + ${money(c)} = ${money(total)}`,
        responseAnswer: `Nadia paye ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `Nadia sort du magasin mais elle a oublié d’acheter à boire. Elle retourne dans le magasin. Elle hésite entre 2 boissons, un soda à ${money(d1)} francs ou de l’eau gazeuse à ${money(d2)} francs. Elle prend la moins chère.\n\nCombien d’argent reste-t-il après ses courses ?`,
        calcAnswer: `${budget} − ${money(total)} − ${money(drink)} = ${money(reste)}`,
        responseAnswer: `Il reste ${money(reste)} francs.`,
        answer: money(reste),
      },
    ]
  },
  (rng) => {
    const pain = oneDecimal(rng, 15, 35)
    const fromage = oneDecimal(rng, 30, 80)
    const fruit = oneDecimal(rng, 20, 50)
    const total = Math.round((pain + fromage + fruit) * 100) / 100
    const bus = oneDecimal(rng, 25, 45)
    const spent = Math.round((total + bus) * 100) / 100
    const budget = Math.ceil(spent) + pick(rng, [5, 10, 15])
    const reste = Math.round((budget - spent) * 100) / 100
    return [
      {
        prompt: `Omar part faire ses courses avec ${budget} francs dans son portefeuille. Il entre dans la boulangerie du quartier. Il choisit un pain à ${money(pain)} francs. Puis il ajoute du fromage à ${money(fromage)} francs et un sachet de fruits à ${money(fruit)} francs. Il paie à la caisse.\n\nCombien paye-t-il pour ses courses ?`,
        calcAnswer: `${money(pain)} + ${money(fromage)} + ${money(fruit)} = ${money(total)}`,
        responseAnswer: `Omar paye ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `Omar quitte le magasin et se dirige vers l’arrêt de bus. Il doit rentrer chez lui. Le ticket de bus coûte ${money(bus)} francs. Il paie son ticket avec l’argent qui lui reste.\n\nCombien d’argent lui reste-t-il après le trajet ?`,
        calcAnswer: `${budget} − ${money(total)} − ${money(bus)} = ${money(reste)}`,
        responseAnswer: `Il lui reste ${money(reste)} francs.`,
        answer: money(reste),
      },
    ]
  },
  (rng) => {
    const pull = oneDecimal(rng, 250, 450)
    const chaussettes = oneDecimal(rng, 50, 120)
    const total = Math.round((pull + chaussettes) * 100) / 100
    const reduction = oneDecimal(rng, 30, 80)
    const paye = Math.round((total - reduction) * 100) / 100
    const budget = Math.ceil(paye) + pick(rng, [10, 20, 30])
    const reste = Math.round((budget - paye) * 100) / 100
    return [
      {
        prompt: `Léa entre dans un magasin de vêtements. Elle a ${budget} francs sur elle. Elle regarde les rayons pendant un moment. Elle choisit un pull à ${money(pull)} francs. Elle prend aussi des chaussettes à ${money(chaussettes)} francs.\n\nQuel est le prix total avant réduction ?`,
        calcAnswer: `${money(pull)} + ${money(chaussettes)} = ${money(total)}`,
        responseAnswer: `Le total est ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `À la caisse, la vendeuse annonce une réduction de ${money(reduction)} francs. Léa est contente. Elle paie avec son argent. Elle range le reste dans son porte-monnaie.\n\nCombien lui reste-t-il après l’achat ?`,
        calcAnswer: `${money(total)} − ${money(reduction)} = ${money(paye)} ; ${budget} − ${money(paye)} = ${money(reste)}`,
        responseAnswer: `Il lui reste ${money(reste)} francs.`,
        answer: money(reste),
      },
    ]
  },
  (rng) => {
    const n = int(rng, 3, 6)
    const prix = oneDecimal(rng, 12, 35)
    const total = Math.round(n * prix * 100) / 100
    const billet = total <= 20 ? 20 : total <= 50 ? 50 : 100
    const rendu = Math.round((billet - total) * 100) / 100
    return [
      {
        prompt: `Yanis a besoin de matériel pour l’école. Il se rend à la papeterie près de chez lui. Il regarde les cahiers en rayon. Il décide d’acheter ${n} cahiers. Chaque cahier coûte ${money(prix)} francs.\n\nCombien doit-il payer pour les cahiers ?`,
        calcAnswer: `${n} × ${money(prix)} = ${money(total)}`,
        responseAnswer: `Yanis doit payer ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `Yanis tend un billet de ${billet} francs à la caissière. La caissière prend le billet. Elle prépare la monnaie. Elle lui rend le reste.\n\nCombien la caissière lui rend-elle ?`,
        calcAnswer: `${billet} − ${money(total)} = ${money(rendu)}`,
        responseAnswer: `On lui rend ${money(rendu)} francs.`,
        answer: money(rendu),
      },
    ]
  },
  (rng) => {
    const lait = oneDecimal(rng, 12, 25)
    const nLait = int(rng, 2, 4)
    const pain = oneDecimal(rng, 15, 30)
    const total = Math.round((lait * nLait + pain) * 100) / 100
    const budget = Math.max(1, Math.floor(total) - int(rng, 1, 3))
    const manque = Math.round((total - budget) * 100) / 100
    return [
      {
        prompt: `Sara va à l’épicerie du village. Elle prend un panier. Elle met ${nLait} briques de lait à ${money(lait)} francs chacune dans le panier. Elle ajoute un pain à ${money(pain)} francs. Elle se dirige vers la caisse.\n\nQuel est le montant des courses ?`,
        calcAnswer: `${nLait} × ${money(lait)} + ${money(pain)} = ${money(total)}`,
        responseAnswer: `Les courses coûtent ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `Sara ouvre son porte-monnaie. Elle n’a que ${budget} francs sur elle. Elle compte encore une fois. Il lui manque de l’argent pour payer.\n\nCombien lui manque-t-il ?`,
        calcAnswer: `${money(total)} − ${budget} = ${money(manque)}`,
        responseAnswer: `Il lui manque ${money(manque)} francs.`,
        answer: money(manque),
      },
    ]
  },
  (rng) => {
    const a = oneDecimal(rng, 40, 90)
    const b = oneDecimal(rng, 30, 70)
    const c = oneDecimal(rng, 20, 60)
    const total = Math.round((a + b + c) * 100) / 100
    const share = Math.round((total / 2) * 100) / 100
    return [
      {
        prompt: `Deux amies s’installent à la terrasse d’un café. Elles commandent des boissons pour ${money(a)} francs. Elles ajoutent des gâteaux pour ${money(b)} francs. Elles prennent aussi des thés pour ${money(c)} francs. L’addition arrive sur la table.\n\nQuel est le total de l’addition ?`,
        calcAnswer: `${money(a)} + ${money(b)} + ${money(c)} = ${money(total)}`,
        responseAnswer: `L’addition est de ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `Les deux amies veulent partager la note. Elles divisent le montant en deux parts égales. Chacune paie la même somme. Elles laissent l’argent sur la table.\n\nCombien chacune paie-t-elle ?`,
        calcAnswer: `${money(total)} ÷ 2 = ${money(share)}`,
        responseAnswer: `Chacune paie ${money(share)} francs.`,
        answer: money(share),
      },
    ]
  },
  (rng) => {
    const kg = oneDecimal(rng, 12, 25)
    const prixKg = oneDecimal(rng, 20, 40)
    const total = Math.round(kg * prixKg * 100) / 100
    const billet = total <= 20 ? 20 : total <= 50 ? 50 : 100
    const rendu = Math.round((billet - total) * 100) / 100
    return [
      {
        prompt: `Hugo va au marché le samedi matin. Il regarde les étals de fruits. Il choisit des pommes. Il en prend ${money(kg)} kg. Le kilo de pommes coûte ${money(prixKg)} francs.\n\nCombien paie-t-il pour les pommes ?`,
        calcAnswer: `${money(kg)} × ${money(prixKg)} = ${money(total)}`,
        responseAnswer: `Hugo paie ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `Hugo sort un billet de ${billet} francs. Le marchand prend le billet. Il calcule la monnaie. Il rend le reste à Hugo.\n\nCombien le marchand lui rend-il ?`,
        calcAnswer: `${billet} − ${money(total)} = ${money(rendu)}`,
        responseAnswer: `On lui rend ${money(rendu)} francs.`,
        answer: money(rendu),
      },
    ]
  },
  (rng) => {
    const livre = oneDecimal(rng, 80, 160)
    const stylo = oneDecimal(rng, 15, 40)
    const nStylo = int(rng, 2, 5)
    const total = Math.round((livre + stylo * nStylo) * 100) / 100
    const budget = Math.ceil(total) + pick(rng, [5, 10, 15, 20])
    const reste = Math.round((budget - total) * 100) / 100
    return [
      {
        prompt: `Inès entre dans une librairie. Elle a ${budget} francs dans son sac. Elle cherche un livre pour l’école. Elle trouve un livre à ${money(livre)} francs. Elle prend aussi ${nStylo} stylos à ${money(stylo)} francs chacun.\n\nCombien dépense-t-elle en tout ?`,
        calcAnswer: `${money(livre)} + ${nStylo} × ${money(stylo)} = ${money(total)}`,
        responseAnswer: `Inès dépense ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `Inès paie à la caisse. Elle range ses achats dans son sac. Elle vérifie l’argent qui lui reste. Elle est contente de ses achats.\n\nCombien lui reste-t-il ?`,
        calcAnswer: `${budget} − ${money(total)} = ${money(reste)}`,
        responseAnswer: `Il lui reste ${money(reste)} francs.`,
        answer: money(reste),
      },
    ]
  },
  (rng) => {
    const pizza = oneDecimal(rng, 120, 220)
    const n = int(rng, 2, 4)
    const boisson = oneDecimal(rng, 20, 50)
    const total = Math.round((pizza * n + boisson) * 100) / 100
    const share = Math.round((total / n) * 100) / 100
    return [
      {
        prompt: `La famille a faim ce soir. Les enfants veulent des pizzas. Les parents commandent ${n} pizzas à ${money(pizza)} francs chacune. Ils ajoutent une grande boisson à ${money(boisson)} francs. Le livreur apporte la commande.\n\nQuel est le prix total ?`,
        calcAnswer: `${n} × ${money(pizza)} + ${money(boisson)} = ${money(total)}`,
        responseAnswer: `Le total est ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `Les parents décident de partager le montant. Ils divisent le total en ${n} parts égales. Chaque personne paie sa part. Tout le monde est d’accord.\n\nCombien chacune paie-t-elle ?`,
        calcAnswer: `${money(total)} ÷ ${n} = ${money(share)}`,
        responseAnswer: `Chacune paie ${money(share)} francs.`,
        answer: money(share),
      },
    ]
  },
  (rng) => {
    const a = oneDecimal(rng, 35, 80)
    const b = oneDecimal(rng, 40, 90)
    const c = oneDecimal(rng, 25, 70)
    const total = Math.round((a + b + c) * 100) / 100
    const plusCher = Math.max(a, b, c)
    const moinsCher = Math.min(a, b, c)
    const ecart = Math.round((plusCher - moinsCher) * 100) / 100
    return [
      {
        prompt: `Sofia fait des courses pour préparer un repas. Elle met trois articles dans son panier. Le premier coûte ${money(a)} francs. Le deuxième coûte ${money(b)} francs. Le troisième coûte ${money(c)} francs. Elle arrive à la caisse.\n\nQuel est le prix total des trois articles ?`,
        calcAnswer: `${money(a)} + ${money(b)} + ${money(c)} = ${money(total)}`,
        responseAnswer: `Le total est ${money(total)} francs.`,
        answer: money(total),
      },
      {
        prompt: `Sofia regarde les prix sur son ticket. Elle compare l’article le plus cher et le moins cher. Elle veut connaître la différence. Elle fait le calcul.\n\nQuelle est la différence entre l’article le plus cher et le moins cher ?`,
        calcAnswer: `${money(plusCher)} − ${money(moinsCher)} = ${money(ecart)}`,
        responseAnswer: `La différence est ${money(ecart)} francs.`,
        answer: money(ecart),
      },
    ]
  },
]

/**
 * Ex. 15 — pool de 10 problèmes travail / partage (2 parties, 5–8 phrases).
 * Modèle : récit détaillé type Karim (mécanicien), nombres variables.
 */
const EX15_TEMPLATES: readonly ProblemTemplate[] = [
  (rng) => {
    const rate = int(rng, 6, 12)
    const hours = pick(rng, [4, 8])
    const gain = rate * hours
    const half = gain / 2
    const share = half / 2
    return [
      {
        prompt: `Karim est mécanicien. Il travaille dans un garage et gagne ${rate} francs par heure. Aujourd’hui, il travaille pendant ${hours} heures.\n\nAujourd’hui, combien d’argent a-t-il gagné ?`,
        calcAnswer: `${rate} × ${hours} = ${gain}`,
        responseAnswer: `Karim a gagné ${gain} francs.`,
        answer: String(gain),
      },
      {
        prompt: `Le jour suivant, Karim retrouve Ahmed, Yeva et Danil dans un parc. Il propose de donner la moitié de l’argent gagné à ses 3 amis. Danil refuse, il ne veut pas d’argent. La moitié de l’argent de Karim est donc partagée avec le reste de ses amis. Ils reçoivent le même montant.\n\nCombien d’argent reçoit Yeva ?`,
        calcAnswer: `${gain} ÷ 2 = ${half} ; ${half} ÷ 2 = ${share}`,
        responseAnswer: `Yeva reçoit ${share} francs.`,
        answer: String(share),
      },
    ]
  },
  (rng) => {
    const rate = int(rng, 8, 15)
    const hours = pick(rng, [4, 6, 8])
    const gain = rate * hours
    const keep = gain / 2
    const save = gain - keep
    return [
      {
        prompt: `Maya travaille dans un magasin de vêtements. Elle aide les clients toute la journée. Elle est payée ${rate} francs par heure. Aujourd’hui, elle travaille pendant ${hours} heures.\n\nCombien d’argent a-t-elle gagné aujourd’hui ?`,
        calcAnswer: `${hours} × ${rate} = ${gain}`,
        responseAnswer: `Maya a gagné ${gain} francs.`,
        answer: String(gain),
      },
      {
        prompt: `Le soir, Maya rentre chez elle. Elle compte son argent. Elle décide de garder la moitié pour ses dépenses. Elle place le reste à la banque. Elle fait le calcul soigneusement.\n\nCombien place-t-elle à la banque ?`,
        calcAnswer: `${gain} − ${keep} = ${save}`,
        responseAnswer: `Elle place ${save} francs à la banque.`,
        answer: String(save),
      },
    ]
  },
  (rng) => {
    const days = int(rng, 3, 5)
    const perDay = int(rng, 40, 80)
    const gain = days * perDay
    const lunch = int(rng, 8, 15)
    const reste = gain - lunch * days
    return [
      {
        prompt: `Tom aide dans un magasin pendant les vacances. Il range les rayons et accueille les clients. Il travaille pendant ${days} jours. Chaque jour, il gagne ${perDay} francs.\n\nCombien d’argent gagne-t-il en tout ?`,
        calcAnswer: `${days} × ${perDay} = ${gain}`,
        responseAnswer: `Tom gagne ${gain} francs.`,
        answer: String(gain),
      },
      {
        prompt: `Chaque jour de travail, Tom achète son repas. Le repas coûte ${lunch} francs. Il paie son repas avec son salaire. À la fin des ${days} jours, il regarde ce qui lui reste.\n\nCombien lui reste-t-il à la fin ?`,
        calcAnswer: `${gain} − ${days} × ${lunch} = ${reste}`,
        responseAnswer: `Il lui reste ${reste} francs.`,
        answer: String(reste),
      },
    ]
  },
  (rng) => {
    const rate = int(rng, 10, 18)
    const hours = pick(rng, [4, 6, 8, 10])
    const gain = rate * hours
    const gift = int(rng, 10, 25)
    const reste = gain - gift
    return [
      {
        prompt: `Amina donne des cours de français. Elle prépare ses leçons avec soin. Elle donne des cours pendant ${hours} heures. Elle gagne ${rate} francs par heure.\n\nCombien d’argent a-t-elle gagné ?`,
        calcAnswer: `${hours} × ${rate} = ${gain}`,
        responseAnswer: `Amina a gagné ${gain} francs.`,
        answer: String(gain),
      },
      {
        prompt: `Amina rentre chez elle contente. Elle pense à sa sœur. Elle décide de lui offrir ${gift} francs. Elle garde le reste pour elle.\n\nCombien lui reste-t-il après le cadeau ?`,
        calcAnswer: `${gain} − ${gift} = ${reste}`,
        responseAnswer: `Il lui reste ${reste} francs.`,
        answer: String(reste),
      },
    ]
  },
  (rng) => {
    const boxes = int(rng, 4, 9)
    const perBox = int(rng, 5, 12)
    const total = boxes * perBox
    const keep = int(rng, 2, 4)
    const sold = total - keep
    return [
      {
        prompt: `Un jardinier travaille dans son verger. Il récolte des pommes toute la matinée. Il remplit ${boxes} caisses. Chaque caisse contient ${perBox} pommes.\n\nCombien de pommes a-t-il récoltées en tout ?`,
        calcAnswer: `${boxes} × ${perBox} = ${total}`,
        responseAnswer: `Il a récolté ${total} pommes.`,
        answer: String(total),
      },
      {
        prompt: `Le jardinier garde ${keep} pommes pour sa famille. Il met le reste dans sa camionnette. Il part vendre les pommes au marché. Les clients viennent les acheter.\n\nCombien de pommes vend-il ?`,
        calcAnswer: `${total} − ${keep} = ${sold}`,
        responseAnswer: `Il vend ${sold} pommes.`,
        answer: String(sold),
      },
    ]
  },
  (rng) => {
    const rate = int(rng, 7, 14)
    const hours = pick(rng, [3, 6, 9])
    const gain = rate * hours
    const third = gain / 3
    const reste = gain - third
    return [
      {
        prompt: `Luis travaille dans un atelier de menuiserie. Il fabrique des meubles. Il travaille pendant ${hours} heures aujourd’hui. Il est payé ${rate} francs par heure.\n\nCombien d’argent gagne-t-il aujourd’hui ?`,
        calcAnswer: `${hours} × ${rate} = ${gain}`,
        responseAnswer: `Luis gagne ${gain} francs.`,
        answer: String(gain),
      },
      {
        prompt: `En rentrant, Luis parle avec ses parents. Il décide de leur donner le tiers de son argent. Il garde le reste pour lui. Il range l’argent dans deux enveloppes.\n\nCombien garde-t-il pour lui ?`,
        calcAnswer: `${gain} ÷ 3 = ${third} ; ${gain} − ${third} = ${reste}`,
        responseAnswer: `Il garde ${reste} francs.`,
        answer: String(reste),
      },
    ]
  },
  (rng) => {
    const weeks = int(rng, 2, 4)
    const perWeek = int(rng, 50, 90)
    const gain = weeks * perWeek
    const buy = int(rng, 30, 70)
    const reste = gain - buy
    return [
      {
        prompt: `Nora trouve un travail temporaire dans un supermarché. Elle range les rayons chaque semaine. Elle travaille pendant ${weeks} semaines. Elle gagne ${perWeek} francs par semaine.\n\nCombien gagne-t-elle au total ?`,
        calcAnswer: `${weeks} × ${perWeek} = ${gain}`,
        responseAnswer: `Nora gagne ${gain} francs.`,
        answer: String(gain),
      },
      {
        prompt: `Nora veut s’acheter un livre. Elle entre dans une librairie. Elle trouve un livre à ${buy} francs. Elle paie avec l’argent de son travail.\n\nCombien lui reste-t-il après l’achat ?`,
        calcAnswer: `${gain} − ${buy} = ${reste}`,
        responseAnswer: `Il lui reste ${reste} francs.`,
        answer: String(reste),
      },
    ]
  },
  (rng) => {
    const rate = int(rng, 9, 16)
    const hours = pick(rng, [4, 8])
    const gain = rate * hours
    const parts = 4
    const share = gain / parts
    return [
      {
        prompt: `Paul travaille comme livreur. Il livre des colis dans la ville. Il gagne ${rate} francs par heure. Aujourd’hui, il travaille pendant ${hours} heures.\n\nCombien d’argent a-t-il gagné ?`,
        calcAnswer: `${rate} × ${hours} = ${gain}`,
        responseAnswer: `Paul a gagné ${gain} francs.`,
        answer: String(gain),
      },
      {
        prompt: `Paul rentre chez lui. Il retrouve sa famille. Il propose de partager son argent également entre ${parts} personnes. Chacun reçoit la même somme.\n\nCombien chacune reçoit-elle ?`,
        calcAnswer: `${gain} ÷ ${parts} = ${share}`,
        responseAnswer: `Chacune reçoit ${share} francs.`,
        answer: String(share),
      },
    ]
  },
  (rng) => {
    const morning = int(rng, 3, 5)
    const afternoon = int(rng, 2, 4)
    const rate = int(rng, 8, 14)
    const hours = morning + afternoon
    const gain = hours * rate
    return [
      {
        prompt: `Rita travaille dans un restaurant. Le matin, elle prépare la salle pendant ${morning} heures. L’après-midi, elle sert les clients pendant ${afternoon} heures. Elle est fatiguée mais contente.\n\nCombien d’heures travaille-t-elle en tout ?`,
        calcAnswer: `${morning} + ${afternoon} = ${hours}`,
        responseAnswer: `Rita travaille ${hours} heures.`,
        answer: String(hours),
      },
      {
        prompt: `Rita est payée ${rate} francs par heure. Le patron calcule son salaire. Il lui donne son argent le soir. Rita range l’argent dans son sac.\n\nCombien gagne-t-elle ce jour-là ?`,
        calcAnswer: `${hours} × ${rate} = ${gain}`,
        responseAnswer: `Elle gagne ${gain} francs.`,
        answer: String(gain),
      },
    ]
  },
  (rng) => {
    const rate = int(rng, 6, 11)
    const hours = pick(rng, [6, 8, 10])
    const gain = rate * hours
    const tip = int(rng, 5, 15)
    const total = gain + tip
    return [
      {
        prompt: `Sam aide au restaurant le week-end. Il sert les tables et range la cuisine. Il travaille pendant ${hours} heures. Il gagne ${rate} francs par heure sans le pourboire.\n\nCombien gagne-t-il sans le pourboire ?`,
        calcAnswer: `${hours} × ${rate} = ${gain}`,
        responseAnswer: `Sam gagne ${gain} francs.`,
        answer: String(gain),
      },
      {
        prompt: `Un client est très content du service. Il laisse ${tip} francs de pourboire à Sam. Sam ajoute ce pourboire à son salaire. Il compte tout son argent.\n\nCombien a-t-il en tout ?`,
        calcAnswer: `${gain} + ${tip} = ${total}`,
        responseAnswer: `Il a ${total} francs en tout.`,
        answer: String(total),
      },
    ]
  },
]

function partsToItems(parts: [ProblemPart, ProblemPart]): MathItem[] {
  return parts.map((p) => ({
    layout: 'text' as const,
    prompt: p.prompt,
    calcAnswer: p.calcAnswer,
    responseAnswer: p.responseAnswer,
    answer: p.answer,
  }))
}

function genEx14(rng: Rng): MathItem[] {
  return partsToItems(pick(rng, EX14_TEMPLATES)(rng))
}

function genEx15(rng: Rng): MathItem[] {
  return partsToItems(pick(rng, EX15_TEMPLATES)(rng))
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
  props: ['4 côtés égaux', 'diagonales perpendiculaires'],
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

/** Ex. 25 — aire du carré → côté (cote absente ; brouillon comme ex. 22). */
function genEx25(rng: Rng): MathItem[] {
  const side = int(rng, 3, 12)
  const area = side * side
  return [
    {
      layout: 'geo',
      figure: 'square',
      // Pas de cote affichée : c’est la valeur cherchée.
      dims: { unit: 'cm' },
      prompt: `L’aire de ce carré est ${area} cm². Quelle est la longueur d’un côté ?`,
      geoDualPads: true,
      geoDualTight: true,
      hideItemNumber: true,
      calcAnswer: `√${area} = ${side}`,
      propertyLines: [{ label: 'Côté', answer: `${side} cm` }],
      answer: `${side} cm`,
    },
  ]
}

/** Ex. 26 — aire rectangle + un côté → autre côté (cote cherchée masquée). */
function genEx26(rng: Rng): MathItem[] {
  const length = int(rng, 4, 14)
  let width = int(rng, 2, 10)
  while (width === length) width = int(rng, 2, 10)
  const area = length * width
  const giveLength = rng() < 0.5
  const known = giveLength ? length : width
  const unknown = giveLength ? width : length
  const knownLabel = giveLength ? 'longueur' : 'largeur'
  return [
    {
      layout: 'geo',
      figure: 'rectangle',
      // Afficher uniquement le côté connu ; masquer celui cherché.
      dims: giveLength ? { length, unit: 'cm' } : { width, unit: 'cm' },
      prompt: `L’aire de ce rectangle est ${area} cm². La ${knownLabel} mesure ${known} cm. Quelle est la longueur de l’autre côté ?`,
      geoDualPads: true,
      geoDualTight: true,
      hideItemNumber: true,
      calcAnswer: `${area} ÷ ${known} = ${unknown}`,
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

  type Pt = { x: number; y: number; label: string }
  const used = new Set<string>()
  const take = (label: string, onAxis: boolean): Pt => {
    let x = 0
    let y = 0
    let g = 0
    do {
      if (onAxis) {
        if (rng() < 0.5) {
          x = int(rng, 1, maxUnit)
          y = 0
        } else {
          x = 0
          y = int(rng, 1, maxUnit)
        }
      } else {
        x = int(rng, 1, maxUnit)
        y = int(rng, 1, maxUnit)
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
          prompt: `Placez ${p.label}(${p.x} ; ${p.y})`,
          answer: `(${p.x} ; ${p.y})`,
          reply: 'pair' as const,
        })),
        ...ptsRead.map((p) => ({
          prompt: `Écrivez les coordonnées du point ${p.label}.`,
          answer: `(${p.x} ; ${p.y})`,
          reply: 'pair' as const,
        })),
      ],
      answer: [...ptsPlace, ...ptsRead].map((p) => `${p.label}(${p.x};${p.y})`).join(' ; '),
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
  // Page Informations : générée via `generateTcmInformations` dans `math/generate.ts`.
  if (typeId === 'tcm-cfr-consignes') return []
  if (typeId === 'tcm-cfr-ex01') return genEx01(rng, count)
  if (typeId === 'tcm-cfr-ex02') return genEx02(rng, count)
  if (typeId === 'tcm-cfr-ex03') return genEx03(rng).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex04') return genEx04(rng, count)
  if (typeId === 'tcm-cfr-ex05') return genEx05(rng).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex06') return genEx06(rng).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex07') return genAddSubFour(rng, false).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex08') return genAddSubFour(rng, true).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex09') return genEx09(rng).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex10') return genEx10(rng).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex11') return genEx11(rng, count)
  if (typeId === 'tcm-cfr-ex12') return genFracShapes(rng, count, 'color')
  if (typeId === 'tcm-cfr-ex13') return genFracShapes(rng, count, 'read')
  if (typeId === 'tcm-cfr-ex14') return genEx14(rng).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex15') return genEx15(rng).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex16') return genEx16(rng, worksheetSeed).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex17') return genEx17(rng, worksheetSeed).slice(0, Math.max(1, count))
  if (typeId === 'tcm-cfr-ex18') return genEx18(rng)
  if (typeId === 'tcm-cfr-ex19') return genEx19(rng)
  if (typeId === 'tcm-cfr-ex20') return genEx20(rng, count)
  if (typeId === 'tcm-cfr-ex21') return genEx21(rng, count)
  if (typeId === 'tcm-cfr-ex22') return genEx22(rng)
  if (typeId === 'tcm-cfr-ex23') return genEx23(rng)
  if (typeId === 'tcm-cfr-ex24') return genEx24(rng)
  if (typeId === 'tcm-cfr-ex25') return genEx25(rng)
  if (typeId === 'tcm-cfr-ex26') return genEx26(rng)
  if (typeId === 'tcm-cfr-ex27') return genEx27(rng)
  if (typeId === 'tcm-cfr-ex28') return genEx28(rng)
  return null
}
