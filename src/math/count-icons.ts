/**
 * Compter les icônes (nombres naturels / TCM ex. 1).
 * 11 styles N&B ; placement aléatoire sans chevauchement.
 */
import { int, shuffle, type Rng } from '@/math/rng'
import type { CountIconKind, CountIconScene, CountIconToken, MathItem } from '@/math/types'

/** 6 styles de référence + 10 autres silhouettes N&B. */
export const COUNT_ICON_CATALOG: readonly {
  kind: CountIconKind
  label: string
  labelOne: string
}[] = [
  { kind: 'notes', label: 'notes', labelOne: 'notes liées' },
  { kind: 'club', label: 'trèfles', labelOne: 'trèfle' },
  { kind: 'diamond', label: 'carreaux', labelOne: 'carreau' },
  { kind: 'heart', label: 'cœurs', labelOne: 'cœur' },
  { kind: 'spade', label: 'piques', labelOne: 'pique' },
  { kind: 'bolt', label: 'éclairs', labelOne: 'éclair' },
  { kind: 'star', label: 'étoiles', labelOne: 'étoile' },
  { kind: 'moon', label: 'lunes', labelOne: 'lune' },
  { kind: 'leaf', label: 'feuilles', labelOne: 'feuille' },
  { kind: 'flower', label: 'fleurs', labelOne: 'fleur' },
  { kind: 'note', label: 'croches', labelOne: 'croche' },
  { kind: 'sun', label: 'soleils', labelOne: 'soleil' },
  { kind: 'circle', label: 'cercles', labelOne: 'cercle' },
  { kind: 'triangle', label: 'triangles', labelOne: 'triangle' },
  { kind: 'cross', label: 'croix', labelOne: 'croix' },
  { kind: 'arrow', label: 'flèches', labelOne: 'flèche' },
]

export const COUNT_ICON_OPTIONS = COUNT_ICON_CATALOG.map((c) => ({
  value: c.kind,
  label: c.labelOne,
}))

export function countIconMeta(kind: CountIconKind): (typeof COUNT_ICON_CATALOG)[number] {
  return COUNT_ICON_CATALOG.find((c) => c.kind === kind) ?? COUNT_ICON_CATALOG[0]!
}

/** Emprise approximative (rayon en % du cadre) pour éviter les contacts. */
function tokenRadius(size: number): number {
  return (size / 2) * 0.92
}

function overlaps(
  x: number,
  y: number,
  r: number,
  placed: Array<{ x: number; y: number; r: number }>,
  gap: number,
): boolean {
  for (const p of placed) {
    const dx = x - p.x
    const dy = y - p.y
    const minDist = r + p.r + gap
    if (dx * dx + dy * dy < minDist * minDist) return true
  }
  return false
}

/**
 * Place des jetons aléatoirement sans qu’ils se touchent.
 * Repli sur une grille si le tirage libre échoue.
 */
export function packCountIconTokens(
  rng: Rng,
  kinds: CountIconKind[],
): CountIconToken[] {
  const ordered = shuffle(rng, [...kinds])
  const placed: Array<{ x: number; y: number; r: number }> = []
  const tokens: CountIconToken[] = []
  const gap = 1.6
  const pad = 7

  for (const kind of ordered) {
    const size = int(rng, 10, 15)
    const r = tokenRadius(size)
    let x = 50
    let y = 50
    let ok = false
    for (let attempt = 0; attempt < 120; attempt++) {
      const nx = pad + r + rng() * (100 - 2 * (pad + r))
      const ny = pad + r + rng() * (100 - 2 * (pad + r))
      if (!overlaps(nx, ny, r, placed, gap)) {
        x = nx
        y = ny
        ok = true
        break
      }
    }
    if (!ok) {
      // Grille de secours : première case libre assez grande.
      const cols = Math.ceil(Math.sqrt(ordered.length * 1.2))
      const rows = Math.ceil(ordered.length / cols)
      const cellW = (100 - 2 * pad) / cols
      const cellH = (100 - 2 * pad) / rows
      outer: for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const nx = pad + col * cellW + cellW / 2
          const ny = pad + row * cellH + cellH / 2
          if (!overlaps(nx, ny, r, placed, gap * 0.5)) {
            x = nx
            y = ny
            ok = true
            break outer
          }
        }
      }
    }
    placed.push({ x, y, r })
    tokens.push({
      kind,
      x: Math.max(pad, Math.min(100 - pad, x)),
      y: Math.max(pad, Math.min(100 - pad, y)),
      size,
      rot: int(rng, -22, 22),
    })
  }
  return tokens
}

export type CountIconsLibreConfig = {
  targetKind: CountIconKind
  distractorA: CountIconKind
  distractorB: CountIconKind
  targetCount: number
  distractorACount: number
  distractorBCount: number
}

export function buildCountIconsItem(rng: Rng, cfg?: Partial<CountIconsLibreConfig>): MathItem {
  const pool = shuffle(rng, [...COUNT_ICON_CATALOG])
  let targetKind = cfg?.targetKind ?? pool[0]!.kind
  let distractorA = cfg?.distractorA ?? pool[1]!.kind
  let distractorB = cfg?.distractorB ?? pool[2]!.kind

  // Garantir 3 kinds distincts.
  const all = COUNT_ICON_CATALOG.map((c) => c.kind)
  if (distractorA === targetKind) {
    distractorA = all.find((k) => k !== targetKind) ?? 'star'
  }
  if (distractorB === targetKind || distractorB === distractorA) {
    distractorB =
      all.find((k) => k !== targetKind && k !== distractorA) ?? 'moon'
  }

  const targetCount = Math.max(3, Math.min(24, cfg?.targetCount ?? int(rng, 10, 18)))
  const distractorACount = Math.max(2, Math.min(14, cfg?.distractorACount ?? int(rng, 4, 9)))
  const distractorBCount = Math.max(2, Math.min(14, cfg?.distractorBCount ?? int(rng, 4, 9)))

  const kinds: CountIconKind[] = [
    ...Array.from({ length: targetCount }, () => targetKind),
    ...Array.from({ length: distractorACount }, () => distractorA),
    ...Array.from({ length: distractorBCount }, () => distractorB),
  ]
  const tokens = packCountIconTokens(rng, kinds)
  const meta = countIconMeta(targetKind)
  const scene: CountIconScene = {
    label: meta.label,
    targetKind,
    targetCount,
    distractorA,
    distractorB,
    distractorACount,
    distractorBCount,
    tokens,
  }
  return {
    layout: 'count-icons',
    prompt: `Il y a ____ ${meta.label}`,
    answer: String(targetCount),
    countIcons: scene,
  }
}

export function generateCountIcons(rng: Rng): MathItem {
  return buildCountIconsItem(rng)
}

export function rebuildCountIconsItem(
  rng: Rng,
  cfg: CountIconsLibreConfig,
): MathItem {
  return buildCountIconsItem(rng, cfg)
}
