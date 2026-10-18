/**
 * Termes de fractions en français (TCM CFR ex. 11) + génération n/d → texte.
 */
import { numberToFrench } from '@/francais/french-numbers'

export type FractionWord = { term: string; n: number; d: number }

/** Banque pédagogique (termes courants pour l’ex. 11). */
export const FRACTION_WORDS: readonly FractionWord[] = [
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

const DENOM_BASE: Record<number, [singular: string, plural: string]> = {
  2: ['demi', 'demis'],
  3: ['tiers', 'tiers'],
  4: ['quart', 'quarts'],
  5: ['cinquième', 'cinquièmes'],
  6: ['sixième', 'sixièmes'],
  7: ['septième', 'septièmes'],
  8: ['huitième', 'huitièmes'],
  9: ['neuvième', 'neuvièmes'],
  10: ['dixième', 'dixièmes'],
  11: ['onzième', 'onzièmes'],
  12: ['douzième', 'douzièmes'],
}

function denomWord(d: number, plural: boolean): string {
  const pair = DENOM_BASE[d]
  if (pair) return plural ? pair[1] : pair[0]
  // Repli : ordinal en -ième
  const base = `${numberToFrench(d)}ième`.replace('unième', 'unième')
  return plural ? `${base}s` : base
}

/** Texte français pour la fraction n/d (ex. 3, 4 → « trois quarts »). */
export function fractionTermFr(n: number, d: number): string {
  const nn = Math.round(Math.abs(n))
  const dd = Math.round(Math.abs(d))
  if (!Number.isFinite(nn) || !Number.isFinite(dd) || dd === 0) return ''
  const known = FRACTION_WORDS.find((e) => e.n === nn && e.d === dd)
  if (known) return known.term
  const num = nn === 1 ? 'un' : numberToFrench(nn)
  return `${num} ${denomWord(dd, nn !== 1)}`
}

/** Extrait n et d depuis answer « n/d » ou a/b de l’item. */
export function fractionPartsFromItem(item: {
  a?: number | string
  b?: number | string
  answer?: string
}): { n: number; d: number } | null {
  if (typeof item.a === 'number' && typeof item.b === 'number' && item.b !== 0) {
    return { n: Math.round(item.a), d: Math.round(item.b) }
  }
  const m = String(item.answer ?? '').match(/^(-?\d+)\s*\/\s*(-?\d+)$/)
  if (!m) return null
  const n = Number(m[1])
  const d = Number(m[2])
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null
  return { n, d }
}
