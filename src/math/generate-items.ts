/** Tirage des items maths purs (nombres, opérations, fractions…) — extrait de generate.ts. */
import {
  generateSystemAddition,
  generateSystemSubstitution,
} from './algebra'
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
import { generateOpTableItem } from './op-table'
import { generatePerimetreCompose } from './perimetre-compose'
import { generateLengthConversionBatch, tryGenerateConversion } from './conversions'
import { tryGenerateTpmItems } from '@/tpm/items'
import { tryGenerateFigure } from './figures-school'
import { tryGenerateMesure } from './mesures'
import { makeWordProblem } from './problems'
import { tryGenerateTcmCfrItems } from '@/tcm-cfr/items'
import { generateCountIcons } from '@/math/count-icons'
import { int, pick, shuffle, type Rng } from './rng'
import type {
  ArithOp,
  Difficulty,
  Figure,
  MathItem,
} from './types'
import {
  columnItem,
  dec,
  decStr,
  divisionColumnItem,
  fmt,
  frac,
  gcd,
  inlineOp,
  lcm,
  normalizeColumnLayouts,
  normalizeDivisionLayouts,
  rangeInt,
  roundTo,
  simplify,
  twoDigitMulItem,
} from './column-arith'

const PLACE = ['unités', 'dizaines', 'centaines', 'milliers'] as const

export function generateItems(
  typeId: string,
  count: number,
  rng: Rng,
  difficulty: Difficulty,
  range?: NumberRange,
  shapes?: Figure[],
  worksheetSeed?: number,
): MathItem[] {
  const tpm = tryGenerateTpmItems(typeId, count, rng)
  if (tpm) return tpm
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
    case 'tpm-comparer':
    case 'tpm-suite':
    case 'tpm-operations':
    case 'tpm-quatre-ops':
    case 'tpm-add-sub-col-3':
    case 'tpm-add-sub-col-4':
    case 'tpm-decompose-99':
    case 'tpm-grandes-suites':
    case 'tpm-decompose-9999':
    case 'tpm-mul-div-col':
    case 'tpm-rect-peri-aire':
    case 'tpm-para-peri-aire':
    case 'tpm-tri-peri-aire':
    case 'tpm-rhombus-peri-aire':
    case 'tpm-trap-peri-aire':
    case 'tpm-circle-peri-aire':
    case 'tpm-suites-6':
    case 'tpm-ranger':
    case 'tpm-dec-add-sub':
    case 'tpm-mul-mixte':
    case 'tpm-div-mixte':
    case 'tpm-frac-color':
    case 'tpm-frac-read':
    case 'tpm-ops-decimales':
    case 'tpm-puissances-mixte':
    case 'tpm-priorite-ops':
    case 'tpm-relatifs-ops':
    case 'tpm-fractions-mixte':
    case 'tpm-expressions-reduire':
    case 'tpm-expressions-evaluer':
    case 'tpm-equations':
    case 'tpm-conversions-mixte':
    case 'tpm-proportion-kg': {
      // Lot complet généré dans generateItems ; repli unitaire.
      const [item] = tryGenerateTpmItems(typeId, 1, rng) ?? []
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
    case 'addition-tableau':
      return generateOpTableItem('+', 'cells', rng, difficulty, range)
    case 'addition-tableau-entetes':
      return generateOpTableItem('+', 'headers', rng, difficulty, range)
    case 'addition-tableau-melange':
      return generateOpTableItem('+', 'mixed', rng, difficulty, range)
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
    case 'soustraction-tableau':
      return generateOpTableItem('−', 'cells', rng, difficulty, range)
    case 'soustraction-tableau-entetes':
      return generateOpTableItem('−', 'headers', rng, difficulty, range)
    case 'soustraction-tableau-melange':
      return generateOpTableItem('−', 'mixed', rng, difficulty, range)
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
        return { layout: 'inline', prompt: `(${aa}) ÷ (${bb}) =`, answer: fmt(aa / bb) }
      }
      return { layout: 'inline', prompt: mul ? `(${a}) × (${b}) =` : `(${a}) ÷ (${b}) =`, answer: fmt(result) }
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
