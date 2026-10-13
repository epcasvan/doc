/**
 * TCM ex. 31 — deux questions :
 * 1) Pourcentage d’un nombre : « p % de n est égal à … »
 *    p ∈ {10, 20, 25, 40, 60, 75, 80} ; n ∈ [101 ; 999], pas multiple de 10.
 * 2) Règle de trois kg → francs : « n kg de … → p francs » / « m kg → ____ »
 *    25 produits ; n, m, p ∈ [10 ; 99] ; ni n|m ni m|n ; réponse exacte.
 */
import { fmt } from '@/math/column-arith'
import { int, pick, type Rng } from '@/math/rng'
import type { MathItem } from '@/math/types'

const PCT_CHOICES = [10, 20, 25, 40, 60, 75, 80] as const

export type ProportionKgTemplate = {
  id: string
  product: string
  ofProduct: string
}

/** 25 modèles distincts (produits / formulations) — Q2. */
export const TCM_PROPORTION_KG_TEMPLATES: readonly ProportionKgTemplate[] = [
  { id: 'k01', product: 'farine', ofProduct: 'de farine' },
  { id: 'k02', product: 'riz', ofProduct: 'de riz' },
  { id: 'k03', product: 'pommes', ofProduct: 'de pommes' },
  { id: 'k04', product: 'carottes', ofProduct: 'de carottes' },
  { id: 'k05', product: 'pommes de terre', ofProduct: 'de pommes de terre' },
  { id: 'k06', product: 'sucre', ofProduct: 'de sucre' },
  { id: 'k07', product: 'sel', ofProduct: 'de sel' },
  { id: 'k08', product: 'café', ofProduct: 'de café' },
  { id: 'k09', product: 'thé', ofProduct: 'de thé' },
  { id: 'k10', product: 'blé', ofProduct: 'de blé' },
  { id: 'k11', product: 'maïs', ofProduct: 'de maïs' },
  { id: 'k12', product: 'oranges', ofProduct: 'd’oranges' },
  { id: 'k13', product: 'bananes', ofProduct: 'de bananes' },
  { id: 'k14', product: 'tomates', ofProduct: 'de tomates' },
  { id: 'k15', product: 'oignons', ofProduct: 'd’oignons' },
  { id: 'k16', product: 'fromage', ofProduct: 'de fromage' },
  { id: 'k17', product: 'beurre', ofProduct: 'de beurre' },
  { id: 'k18', product: 'ciment', ofProduct: 'de ciment' },
  { id: 'k19', product: 'sable', ofProduct: 'de sable' },
  { id: 'k20', product: 'ferraille', ofProduct: 'de ferraille' },
  { id: 'k21', product: 'charbon', ofProduct: 'de charbon' },
  { id: 'k22', product: 'pellets', ofProduct: 'de pellets' },
  { id: 'k23', product: 'terreau', ofProduct: 'de terreau' },
  { id: 'k24', product: 'engrais', ofProduct: 'd’engrais' },
  { id: 'k25', product: 'semences', ofProduct: 'de semences' },
]

export const TCM_PROPORTION_KG_COUNT = TCM_PROPORTION_KG_TEMPLATES.length

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

function divides(a: number, b: number): boolean {
  return a !== 0 && b % a === 0
}

function fmtAnswer(n: number): string {
  return fmt(n)
}

/** n ∈ [101 ; 999], non multiple de 10 (pas une « dizaine » ronde). */
function pickPercentBase(rng: Rng, pct: number): number {
  for (let attempt = 0; attempt < 200; attempt++) {
    let n = int(rng, 101, 999)
    if (n % 10 === 0) continue
    const raw = (pct * n) / 100
    const rounded = Math.round(raw * 100) / 100
    if (Math.abs(raw - rounded) < 1e-9) return n
  }
  return pct === 25 ? 248 : 245
}

function generatePercentItem(rng: Rng): MathItem {
  const pct = pick(rng, [...PCT_CHOICES])
  const n = pickPercentBase(rng, pct)
  const value = (pct * n) / 100
  const answer = fmtAnswer(value)
  // Développement sur la ligne de réponse : p/100 × n = résultat.
  const development = [`${pct}/100 × ${n}`, answer]
  return {
    layout: 'text',
    // a = %, b = nombre (édition libre).
    a: pct,
    b: n,
    result: value,
    prompt: `${pct} % de ${n} est égal à`,
    answer,
    development,
    labels: ['percent'],
  }
}

/**
 * Deux masses 10–99 (ni l’une ni l’autre ne divise l’autre)
 * + prix donné 10–99 tel que le prix cherché soit entier.
 * Les 3 nombres affichés (kgA, priceA, kgB) sont distincts
 * (évite « 51 kg → 51 francs » = 1 fr/kg, trop facile).
 */
export function pickIndepKgPrice(rng: Rng): {
  kgA: number
  kgB: number
  priceA: number
  priceB: number
} {
  for (let attempt = 0; attempt < 200; attempt++) {
    const kgA = int(rng, 10, 99)
    let kgB = int(rng, 10, 99)
    while (kgB === kgA) kgB = int(rng, 10, 99)
    if (divides(kgA, kgB) || divides(kgB, kgA)) continue

    const step = kgA / gcd(kgA, kgB)
    const minK = Math.ceil(10 / step)
    const maxK = Math.floor(99 / step)
    if (minK > maxK) continue
    const k = int(rng, minK, maxK)
    const priceA = k * step
    if (priceA < 10 || priceA > 99) continue
    // kgA, priceA, kgB tous distincts (pas de 1 fr/kg ni de doublon avec kgB).
    if (priceA === kgA || priceA === kgB) continue
    const priceB = (priceA * kgB) / kgA
    if (!Number.isInteger(priceB) || priceB < 10 || priceB > 99) continue
    if (priceB === kgA || priceB === kgB || priceB === priceA) continue
    return { kgA, kgB, priceA, priceB }
  }
  return { kgA: 15, kgB: 28, priceA: 30, priceB: 56 }
}

function generateKgFrancsItem(rng: Rng): MathItem {
  const tpl = pick(rng, [...TCM_PROPORTION_KG_TEMPLATES])
  const { kgA, kgB, priceA, priceB } = pickIndepKgPrice(rng)
  const answer = `${priceB} francs`
  // Règle de trois : (m × p) ÷ n = résultat (sur la ligne de réponse).
  const development = [`(${kgB} × ${priceA}) ÷ ${kgA}`, String(priceB)]
  return {
    layout: 'text',
    // a = kgA, b = priceA, result = kgB (édition libre) ; left = id produit.
    a: kgA,
    b: priceA,
    result: kgB,
    left: tpl.id,
    prompt: `${kgA} kg ${tpl.ofProduct} → ${priceA} francs\n${kgB} kg ${tpl.ofProduct} →`,
    answer,
    development,
    labels: ['kg-francs'],
  }
}

/** Lot TCM ex. 31 : Q1 pourcentage, Q2 kg → francs. */
export function generateTcmProportionKgBatch(rng: Rng, count = 2): MathItem[] {
  const items = [generatePercentItem(rng), generateKgFrancsItem(rng)]
  return items.slice(0, Math.max(1, Math.min(count, 2)))
}
