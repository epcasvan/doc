/**
 * TPM ex. 35 — conversions mixtes (4 questions, une par famille) :
 * masse, capacité, temps, et (aire | volume | longueur | densité) au hasard.
 * Valeur entière ou décimale tirée au sort pour chaque question.
 */
import { int, pick, type Rng } from '@/math/rng'
import type { MathItem } from '@/math/types'
import {
  convertFamilyDef,
  convertValue,
  formatConvertNumber,
  type ConvertFamily,
} from '@/tpm/convert-units'

type UnitPair = {
  from: string
  to: string
}

function makeItem(
  value: number,
  from: string,
  to: string,
  answer: number,
  family: ConvertFamily,
): MathItem {
  return {
    layout: 'inline',
    prompt: `${formatConvertNumber(value)} ${from} =`,
    convert: { value: formatConvertNumber(value), from, to, family },
    answer: `${formatConvertNumber(answer)} ${to}`,
  }
}

/** Paires scolaires adjacentes (ou semi-adjacentes) dans une famille. */
function adjacentPairs(family: ConvertFamily): UnitPair[] {
  const units = convertFamilyDef(family).units
  const pairs: UnitPair[] = []
  for (let i = 0; i < units.length; i++) {
    if (i > 0) pairs.push({ from: units[i]!, to: units[i - 1]! })
    if (i < units.length - 1) pairs.push({ from: units[i]!, to: units[i + 1]! })
    // Un pas de 2 pour diversifier (ex. kg ↔ g, m ↔ cm).
    if (i > 1) pairs.push({ from: units[i]!, to: units[i - 2]! })
    if (i < units.length - 2) pairs.push({ from: units[i]!, to: units[i + 2]! })
  }
  return pairs
}

function randomValue(rng: Rng, decimal: boolean, multiply: number): number {
  if (multiply < 1) {
    const den = Math.round(1 / multiply)
    if (decimal) {
      const places = rng() < 0.55 ? 1 : 2
      if (places === 1) {
        const tenths = int(rng, 1, 9)
        return den * (int(rng, 1, 8) + tenths / 10)
      }
      let hundredths = int(rng, 1, 99)
      while (hundredths % 10 === 0) hundredths = int(rng, 1, 99)
      return den * (int(rng, 1, 5) + hundredths / 100)
    }
    return den * int(rng, 1, 12)
  }
  if (!decimal) {
    if (multiply >= 10_000) return int(rng, 1, 12)
    if (multiply >= 1000) return int(rng, 1, 25)
    return int(rng, 1, 40)
  }
  const places = rng() < 0.55 ? 1 : 2
  if (places === 1) {
    let tenths = int(rng, 11, 99)
    while (tenths % 10 === 0) tenths = int(rng, 11, 99)
    return tenths / 10
  }
  let hundredths = int(rng, 101, 999)
  while (hundredths % 10 === 0) hundredths = int(rng, 101, 999)
  return hundredths / 100
}

function generateOne(rng: Rng, family: ConvertFamily): MathItem {
  const pair = pick(rng, adjacentPairs(family))
  const decimal = rng() < 0.5
  const sample = convertValue(1, pair.from, pair.to, family) ?? 1
  const value = randomValue(rng, decimal, sample)
  const answer = convertValue(value, pair.from, pair.to, family) ?? value
  const clean = Math.round(answer * 1_000_000) / 1_000_000
  return makeItem(value, pair.from, pair.to, clean, family)
}

/** Lot TPM ex. 35 : poids, litre, temps, + une parmi longueur / aire / volume / densité. */
export function generateTpmConversionsBatch(rng: Rng): MathItem[] {
  const mass = generateOne(rng, 'poids')
  const capacity = generateOne(rng, 'litre')
  const time = generateOne(rng, 'temps')
  const spatial = generateOne(rng, pick(rng, ['longueur', 'aire', 'volume', 'densite'] as const))
  return [mass, capacity, time, spatial]
}
