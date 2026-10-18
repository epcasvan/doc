/**
 * Compter les icônes (nombres naturels / TPM ex. 1).
 * Grille 10×8 par cadre : une forme par cellule (certaines vides),
 * tailles 33 %–100 % de la cellule, orientations variées.
 */
import { int, shuffle, type Rng } from '@/math/rng'
import type { CountIconKind, CountIconScene, CountIconToken, MathItem } from '@/math/types'

/** Colonnes × lignes du cadre (une forme max par cellule). */
export const COUNT_ICON_GRID_COLS = 10
export const COUNT_ICON_GRID_ROWS = 8

/** Taille max = largeur d’une cellule (% du cadre). */
export const COUNT_ICON_MAX_SIZE = 100 / COUNT_ICON_GRID_COLS
/** Taille min = 33 % de la taille max. */
export const COUNT_ICON_MIN_SIZE = COUNT_ICON_MAX_SIZE * (1 / 3)

export const COUNT_TARGET_MIN = 15
export const COUNT_TARGET_MAX = 25
export const COUNT_DECOY_MIN = 10
export const COUNT_DECOY_MAX = 20

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

/**
 * Place chaque forme dans une cellule distincte de la grille 10×8.
 * Cellules restantes vides ; taille et rotation aléatoires.
 */
export function packCountIconTokens(
  rng: Rng,
  kinds: CountIconKind[],
): CountIconToken[] {
  const cells = COUNT_ICON_GRID_COLS * COUNT_ICON_GRID_ROWS
  if (kinds.length > cells) {
    throw new Error(
      `Trop de formes (${kinds.length}) pour la grille ${COUNT_ICON_GRID_COLS}×${COUNT_ICON_GRID_ROWS}`,
    )
  }

  const ordered = shuffle(rng, [...kinds])
  const cellIds = shuffle(
    rng,
    Array.from({ length: cells }, (_, i) => i),
  ).slice(0, ordered.length)

  const cellW = 100 / COUNT_ICON_GRID_COLS
  const cellH = 100 / COUNT_ICON_GRID_ROWS
  const tokens: CountIconToken[] = []

  for (let i = 0; i < ordered.length; i++) {
    const kind = ordered[i]!
    const cell = cellIds[i]!
    const col = cell % COUNT_ICON_GRID_COLS
    const row = Math.floor(cell / COUNT_ICON_GRID_COLS)
    // Centre de la cellule (grille invisible 10×8)
    const x = (col + 0.5) * cellW
    const y = (row + 0.5) * cellH
    // Taille entre 33 % et 100 % de la cellule (largeur = hauteur max)
    const scale = 1 / 3 + rng() * (2 / 3)
    const size = COUNT_ICON_MAX_SIZE * scale
    // Orientations variées (pas seulement un léger tilt)
    const rot = int(rng, -45, 45)
    tokens.push({ kind, x, y, size, rot })
  }

  // Ordre d’affichage indépendant du tirage des cellules (lisibilité N&B inchangée)
  return shuffle(rng, tokens)
}

export type CountIconsLibreConfig = {
  targetKind: CountIconKind
  distractorA: CountIconKind
  distractorB: CountIconKind
  targetCount: number
  distractorACount: number
  distractorBCount: number
}

function clampTarget(n: number): number {
  return Math.max(COUNT_TARGET_MIN, Math.min(COUNT_TARGET_MAX, Math.round(n)))
}

function clampDecoy(n: number): number {
  return Math.max(COUNT_DECOY_MIN, Math.min(COUNT_DECOY_MAX, Math.round(n)))
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

  const targetCount = clampTarget(cfg?.targetCount ?? int(rng, COUNT_TARGET_MIN, COUNT_TARGET_MAX))
  const distractorACount = clampDecoy(
    cfg?.distractorACount ?? int(rng, COUNT_DECOY_MIN, COUNT_DECOY_MAX),
  )
  const distractorBCount = clampDecoy(
    cfg?.distractorBCount ?? int(rng, COUNT_DECOY_MIN, COUNT_DECOY_MAX),
  )

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
