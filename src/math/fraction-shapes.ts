/**
 * Tirage des formes fractionnaires — porté depuis
 * soutien-scolaire PlacementExercises16to27 (`genFracItems`).
 */
import type { ShapeKind } from '@/components/math/FractionShape'
import { int, pick, shuffle, type Rng } from './rng'

export type FracShapeItem = {
  kind: ShapeKind
  d: number
  n: number
  copies: number
  multi: boolean
}

/** Dénominateurs autorisés (formes simples) — TCM CFR ex. 12 / 13 et TCM 20 / 21. */
const FRAC_SINGLE_D_ALLOWED: Partial<Record<ShapeKind, readonly number[]>> = {
  triangle: [1, 2, 3, 4, 6, 9],
  hexagon: [2, 3, 4, 6, 12],
}

const FRAC_SINGLE_D_RANGE: Partial<Record<ShapeKind, { min: number; max: number }>> = {
  rect: { min: 2, max: 20 },
  square: { min: 2, max: 10 },
  circle: { min: 2, max: 20 },
  semicircle: { min: 2, max: 10 },
  quartercircle: { min: 2, max: 10 },
}

/** Borne le dénominateur selon la forme (limites CFR). */
export function clampFracDenom(kind: ShapeKind, d: number): number {
  const raw = Math.round(d)
  const allowed = FRAC_SINGLE_D_ALLOWED[kind]
  if (allowed) {
    if (allowed.includes(raw)) return raw
    // Plus proche valeur autorisée.
    return allowed.reduce((best, v) => (Math.abs(v - raw) < Math.abs(best - raw) ? v : best), allowed[0]!)
  }
  const range = FRAC_SINGLE_D_RANGE[kind] ?? { min: 2, max: 20 }
  return Math.max(range.min, Math.min(range.max, raw))
}

/** Borne n/d (forme simple CFR) : 1 ≤ n ≤ d−1 (ou n = 1 si d = 1). */
export function clampFracShapeCfr(
  kind: ShapeKind,
  n: number,
  d: number,
): { n: number; d: number; copies: 1; multi: false } {
  const safeD = clampFracDenom(kind, d)
  const maxN = Math.max(1, safeD - 1)
  const safeN = Math.max(1, Math.min(maxN, Math.round(n)))
  return { n: safeN, d: safeD, copies: 1, multi: false }
}

/** Parts (dénominateur) par forme — TCM CFR ex. 12 / 13. */
function pickSingleShapeCfg(rng: Rng): { kind: ShapeKind; d: number } {
  const pickers: Array<() => { kind: ShapeKind; d: number }> = [
    () => ({ kind: 'rect', d: int(rng, 2, 20) }),
    () => ({ kind: 'square', d: int(rng, 2, 10) }),
    () => ({ kind: 'triangle', d: pick(rng, [1, 2, 3, 4, 6, 9] as const) }),
    () => ({ kind: 'circle', d: int(rng, 2, 20) }),
    () => ({ kind: 'semicircle', d: int(rng, 2, 10) }),
    () => ({ kind: 'quartercircle', d: int(rng, 2, 10) }),
    () => ({ kind: 'hexagon', d: pick(rng, [2, 3, 4, 6, 12] as const) }),
  ]
  return shuffle(rng, pickers)[0]!()
}

function pickMultiShapeCfg(rng: Rng): { kind: ShapeKind; d: number } {
  const pickers: Array<() => { kind: ShapeKind; d: number }> = [
    () => ({ kind: 'rect', d: int(rng, 2, 5) }),
    () => ({ kind: 'square', d: pick(rng, [2, 4] as const) }),
    () => ({ kind: 'triangle', d: pick(rng, [2, 3, 4] as const) }),
    () => ({ kind: 'circle', d: int(rng, 2, 5) }),
    () => ({ kind: 'semicircle', d: int(rng, 2, 4) }),
    () => ({ kind: 'quartercircle', d: int(rng, 2, 4) }),
    () => ({ kind: 'hexagon', d: pick(rng, [2, 3, 4, 6] as const) }),
  ]
  return shuffle(rng, pickers)[0]!()
}

/** Uniquement formes simples (une copie) — TCM CFR ex. 12 / 13. */
export function genFracSingleItems(rng: Rng, count: number): FracShapeItem[] {
  const items: FracShapeItem[] = []
  const usedKinds = new Set<ShapeKind>()
  const usedConfigs = new Set<string>()
  for (let i = 0; i < count; i++) {
    let cfg = pickSingleShapeCfg(rng)
    let tries = 0
    while (
      (usedKinds.has(cfg.kind) || usedConfigs.has(`${cfg.kind}-${cfg.d}`)) &&
      tries < 60
    ) {
      cfg = pickSingleShapeCfg(rng)
      tries++
    }
    usedKinds.add(cfg.kind)
    usedConfigs.add(`${cfg.kind}-${cfg.d}`)
    items.push({ ...cfg, n: int(rng, 1, Math.max(1, cfg.d - 1)), copies: 1, multi: false })
  }
  return items
}

/** Première moitié : formes simples ; seconde : multi-formes (comme soutien). */
export function genFracItems(rng: Rng, count: number): FracShapeItem[] {
  const items: FracShapeItem[] = []
  const usedConfigs = new Set<string>()
  const singles = Math.ceil(count / 2)

  for (let i = 0; i < count; i++) {
    const isSingle = i < singles
    let cfg = isSingle ? pickSingleShapeCfg(rng) : pickMultiShapeCfg(rng)
    let tries = 0
    while (usedConfigs.has(`${cfg.kind}-${cfg.d}`) && tries < 40) {
      cfg = isSingle ? pickSingleShapeCfg(rng) : pickMultiShapeCfg(rng)
      tries++
    }
    usedConfigs.add(`${cfg.kind}-${cfg.d}`)
    if (isSingle) {
      items.push({ ...cfg, n: int(rng, 1, cfg.d - 1), copies: 1, multi: false })
    } else {
      const copies = int(rng, 2, 3)
      items.push({ ...cfg, n: int(rng, cfg.d + 1, copies * cfg.d - 1), copies, multi: true })
    }
  }

  return items
}
