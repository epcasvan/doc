/**
 * Figures de symétrie axiale (axe vertical) pour TCM CFR.
 * Quadrillage 20 × 10 cases, axe au milieu (x = 10), figure d’un seul côté.
 * Silhouettes d’objets (pas de lettres) ; rotation 0° / 90° / 180° / 270°.
 */
import { pick, type Rng } from '@/math/rng'

export type GridPt = { x: number; y: number }

export type SymRotation = 0 | 90 | 180 | 270

export type SymmetryTemplate = {
  id: string
  cols: number
  rows: number
  axisX: number
  side: 'left' | 'right'
  /** Rotation horaire appliquée à la figure de base (0 = sens normal). */
  rotation: SymRotation
  /** Polylignes fermées ou ouvertes ; la figure ne touche pas l’axe. */
  polylines: GridPt[][]
  /** Points marqués (œil, pompon…) sur des intersections. */
  dots?: GridPt[]
}

/** Grille 20 de long × 10 de haut, axe vertical au centre. */
const COLS = 20
const ROWS = 10
const AXIS = 10

const ROTATIONS: readonly SymRotation[] = [0, 90, 180, 270]

function T(id: string, polylines: GridPt[][], dots?: GridPt[]): SymmetryTemplate {
  return {
    id,
    cols: COLS,
    rows: ROWS,
    axisX: AXIS,
    side: 'left',
    rotation: 0,
    polylines,
    ...(dots && dots.length > 0 ? { dots } : {}),
  }
}

/**
 * Silhouettes d’objets — tous les sommets sur des intersections entières
 * (pas de x,y en .5). Définies à gauche de l’axe (x max ≤ 9).
 */
export const SYMMETRY_TEMPLATES: readonly SymmetryTemplate[] = [
  T('bateau', [
    [
      { x: 1, y: 2 },
      { x: 8, y: 2 },
      { x: 7, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 4, y: 2 },
      { x: 4, y: 9 },
    ],
    [
      { x: 1, y: 3 },
      { x: 4, y: 3 },
      { x: 4, y: 9 },
      { x: 1, y: 3 },
    ],
    [
      { x: 4, y: 5 },
      { x: 7, y: 5 },
      { x: 4, y: 9 },
      { x: 4, y: 5 },
    ],
  ]),

  T('maison', [
    [
      { x: 1, y: 1 },
      { x: 9, y: 1 },
      { x: 9, y: 5 },
      { x: 1, y: 5 },
      { x: 1, y: 1 },
    ],
    [
      { x: 1, y: 5 },
      { x: 5, y: 9 },
      { x: 9, y: 5 },
    ],
    [
      { x: 3, y: 1 },
      { x: 3, y: 4 },
      { x: 5, y: 4 },
      { x: 5, y: 1 },
    ],
    [
      { x: 6, y: 3 },
      { x: 6, y: 4 },
      { x: 8, y: 4 },
      { x: 8, y: 3 },
      { x: 6, y: 3 },
    ],
  ]),

  T('arbre', [
    [
      { x: 5, y: 0 },
      { x: 5, y: 4 },
    ],
    [
      { x: 3, y: 0 },
      { x: 7, y: 0 },
    ],
    [
      { x: 1, y: 4 },
      { x: 9, y: 4 },
      { x: 7, y: 7 },
      { x: 5, y: 10 },
      { x: 3, y: 7 },
      { x: 1, y: 4 },
    ],
  ]),

  T('fleche', [
    [
      { x: 1, y: 4 },
      { x: 5, y: 4 },
      { x: 5, y: 2 },
      { x: 9, y: 5 },
      { x: 5, y: 8 },
      { x: 5, y: 6 },
      { x: 1, y: 6 },
      { x: 1, y: 4 },
    ],
  ]),

  T('cle', [
    [
      { x: 2, y: 7 },
      { x: 4, y: 9 },
      { x: 6, y: 9 },
      { x: 8, y: 7 },
      { x: 8, y: 5 },
      { x: 6, y: 3 },
      { x: 4, y: 3 },
      { x: 2, y: 5 },
      { x: 2, y: 7 },
    ],
    [
      { x: 5, y: 3 },
      { x: 5, y: 0 },
      { x: 8, y: 0 },
      { x: 8, y: 1 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 7, y: 2 },
      { x: 7, y: 1 },
    ],
  ]),

  T('eclair', [
    [
      { x: 6, y: 9 },
      { x: 3, y: 5 },
      { x: 5, y: 5 },
      { x: 2, y: 1 },
      { x: 7, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 9 },
    ],
  ]),

  T('coeur', [
    [
      { x: 5, y: 0 },
      { x: 1, y: 3 },
      { x: 1, y: 6 },
      { x: 3, y: 8 },
      { x: 5, y: 6 },
      { x: 7, y: 8 },
      { x: 9, y: 6 },
      { x: 9, y: 3 },
      { x: 5, y: 0 },
    ],
  ]),

  T('etoile', [
    [
      { x: 5, y: 10 },
      { x: 6, y: 7 },
      { x: 9, y: 7 },
      { x: 7, y: 5 },
      { x: 8, y: 2 },
      { x: 5, y: 4 },
      { x: 2, y: 2 },
      { x: 3, y: 5 },
      { x: 1, y: 7 },
      { x: 4, y: 7 },
      { x: 5, y: 10 },
    ],
  ]),

  T('parapluie', [
    [
      { x: 1, y: 6 },
      { x: 5, y: 10 },
      { x: 9, y: 6 },
      { x: 1, y: 6 },
    ],
    [
      { x: 5, y: 6 },
      { x: 5, y: 1 },
    ],
    [
      { x: 5, y: 1 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
    ],
  ]),

  T('crayon', [
    [
      { x: 3, y: 1 },
      { x: 5, y: 1 },
      { x: 5, y: 8 },
      { x: 4, y: 9 },
      { x: 3, y: 8 },
      { x: 3, y: 1 },
    ],
    [
      { x: 3, y: 2 },
      { x: 5, y: 2 },
    ],
    [
      { x: 3, y: 7 },
      { x: 5, y: 7 },
    ],
  ]),

  /** Vase (réf. image) — intersections entières. */
  T('vase', [
    [
      { x: 2, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 8 },
      { x: 8, y: 6 },
      { x: 8, y: 4 },
      { x: 7, y: 1 },
      { x: 3, y: 1 },
      { x: 2, y: 4 },
      { x: 2, y: 6 },
      { x: 3, y: 8 },
      { x: 2, y: 10 },
    ],
    [
      { x: 2, y: 6 },
      { x: 8, y: 6 },
    ],
    [
      { x: 2, y: 4 },
      { x: 8, y: 4 },
    ],
    [
      { x: 2, y: 4 },
      { x: 3, y: 6 },
      { x: 5, y: 4 },
      { x: 7, y: 6 },
      { x: 8, y: 4 },
    ],
  ], [{ x: 5, y: 9 }]),

  T('cygne', [
    [
      { x: 0, y: 7 },
      { x: 2, y: 8 },
      { x: 3, y: 7 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
      { x: 6, y: 4 },
      { x: 7, y: 3 },
      { x: 8, y: 4 },
      { x: 8, y: 3 },
      { x: 9, y: 3 },
      { x: 7, y: 1 },
      { x: 3, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 7 },
      { x: 0, y: 7 },
    ],
    [
      { x: 4, y: 2 },
      { x: 7, y: 2 },
    ],
  ], [{ x: 2, y: 7 }]),

  T('bonnet', [
    [
      { x: 1, y: 1 },
      { x: 9, y: 1 },
      { x: 9, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 1 },
    ],
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => [
      { x, y: 1 },
      { x, y: 3 },
    ]),
    [
      { x: 2, y: 3 },
      { x: 2, y: 5 },
      { x: 5, y: 8 },
      { x: 8, y: 5 },
      { x: 8, y: 3 },
    ],
    [
      { x: 2, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 4 },
      { x: 5, y: 5 },
      { x: 6, y: 4 },
      { x: 7, y: 5 },
      { x: 8, y: 4 },
    ],
    [
      { x: 5, y: 8 },
      { x: 6, y: 9 },
      { x: 5, y: 10 },
      { x: 4, y: 9 },
      { x: 5, y: 8 },
    ],
  ], [{ x: 5, y: 9 }]),

  T('lampe', [
    [
      { x: 2, y: 1 },
      { x: 8, y: 1 },
    ],
    [
      { x: 3, y: 1 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 3, y: 2 },
      { x: 3, y: 1 },
    ],
    [
      { x: 5, y: 2 },
      { x: 5, y: 6 },
    ],
    [
      { x: 2, y: 6 },
      { x: 8, y: 6 },
      { x: 7, y: 9 },
      { x: 3, y: 9 },
      { x: 2, y: 6 },
    ],
    [
      { x: 3, y: 8 },
      { x: 7, y: 8 },
    ],
  ], [{ x: 5, y: 7 }]),

  T('chateau', [
    [
      { x: 1, y: 1 },
      { x: 9, y: 1 },
      { x: 9, y: 5 },
      { x: 1, y: 5 },
      { x: 1, y: 1 },
    ],
    [
      { x: 1, y: 5 },
      { x: 1, y: 7 },
      { x: 2, y: 7 },
      { x: 2, y: 5 },
    ],
    [
      { x: 8, y: 5 },
      { x: 8, y: 7 },
      { x: 9, y: 7 },
      { x: 9, y: 5 },
    ],
    [
      { x: 4, y: 5 },
      { x: 4, y: 8 },
      { x: 6, y: 8 },
      { x: 6, y: 5 },
    ],
    [
      { x: 4, y: 8 },
      { x: 5, y: 10 },
      { x: 6, y: 8 },
    ],
    [
      { x: 4, y: 1 },
      { x: 4, y: 3 },
      { x: 6, y: 3 },
      { x: 6, y: 1 },
    ],
  ]),

  /** Girouette / moulin à vent (réf. image). */
  T('moulin', [
    [
      { x: 4, y: 5 },
      { x: 6, y: 5 },
      { x: 6, y: 7 },
      { x: 4, y: 7 },
      { x: 4, y: 5 },
    ],
    [
      { x: 5, y: 6 },
      { x: 4, y: 5 },
    ],
    [
      { x: 5, y: 6 },
      { x: 6, y: 5 },
    ],
    [
      { x: 5, y: 6 },
      { x: 6, y: 7 },
    ],
    [
      { x: 5, y: 6 },
      { x: 4, y: 7 },
    ],
    [
      { x: 4, y: 7 },
      { x: 5, y: 7 },
      { x: 5, y: 9 },
      { x: 4, y: 7 },
    ],
    [
      { x: 6, y: 7 },
      { x: 6, y: 6 },
      { x: 8, y: 6 },
      { x: 6, y: 7 },
    ],
    [
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 3 },
      { x: 6, y: 5 },
    ],
    [
      { x: 4, y: 5 },
      { x: 4, y: 6 },
      { x: 2, y: 6 },
      { x: 4, y: 5 },
    ],
    [
      { x: 5, y: 9 },
      { x: 5, y: 0 },
    ],
  ], [{ x: 5, y: 6 }]),

  T('lune', [
    [
      { x: 6, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 3 },
      { x: 1, y: 7 },
      { x: 3, y: 9 },
      { x: 6, y: 9 },
      { x: 4, y: 7 },
      { x: 4, y: 3 },
      { x: 6, y: 1 },
    ],
  ]),

  T('papillon', [
    [
      { x: 5, y: 2 },
      { x: 5, y: 8 },
    ],
    [
      { x: 5, y: 5 },
      { x: 1, y: 8 },
      { x: 1, y: 6 },
      { x: 5, y: 5 },
    ],
    [
      { x: 5, y: 5 },
      { x: 1, y: 4 },
      { x: 1, y: 2 },
      { x: 5, y: 5 },
    ],
    [
      { x: 5, y: 5 },
      { x: 9, y: 8 },
      { x: 9, y: 6 },
      { x: 5, y: 5 },
    ],
    [
      { x: 5, y: 5 },
      { x: 9, y: 4 },
      { x: 9, y: 2 },
      { x: 5, y: 5 },
    ],
  ]),

  T('robot', [
    [
      { x: 3, y: 6 },
      { x: 7, y: 6 },
      { x: 7, y: 9 },
      { x: 3, y: 9 },
      { x: 3, y: 6 },
    ],
    [
      { x: 2, y: 1 },
      { x: 8, y: 1 },
      { x: 8, y: 6 },
      { x: 2, y: 6 },
      { x: 2, y: 1 },
    ],
    [
      { x: 4, y: 7 },
      { x: 4, y: 8 },
    ],
    [
      { x: 6, y: 7 },
      { x: 6, y: 8 },
    ],
    [
      { x: 2, y: 4 },
      { x: 0, y: 4 },
      { x: 0, y: 2 },
    ],
    [
      { x: 8, y: 4 },
      { x: 9, y: 4 },
      { x: 9, y: 2 },
    ],
    [
      { x: 3, y: 1 },
      { x: 3, y: 0 },
    ],
    [
      { x: 7, y: 1 },
      { x: 7, y: 0 },
    ],
  ]),

  T('cloche', [
    [
      { x: 2, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 3 },
      { x: 7, y: 3 },
      { x: 7, y: 6 },
      { x: 5, y: 9 },
      { x: 3, y: 6 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 2 },
    ],
    [
      { x: 5, y: 9 },
      { x: 5, y: 10 },
    ],
    [
      { x: 4, y: 1 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
      { x: 4, y: 2 },
      { x: 4, y: 1 },
    ],
  ]),

  T('feuille', [
    [
      { x: 5, y: 0 },
      { x: 2, y: 2 },
      { x: 1, y: 5 },
      { x: 2, y: 8 },
      { x: 5, y: 10 },
      { x: 8, y: 8 },
      { x: 9, y: 5 },
      { x: 8, y: 2 },
      { x: 5, y: 0 },
    ],
    [
      { x: 5, y: 0 },
      { x: 5, y: 10 },
    ],
    [
      { x: 5, y: 5 },
      { x: 2, y: 6 },
    ],
    [
      { x: 5, y: 5 },
      { x: 8, y: 6 },
    ],
    [
      { x: 5, y: 3 },
      { x: 3, y: 3 },
    ],
    [
      { x: 5, y: 3 },
      { x: 7, y: 3 },
    ],
  ]),
]

export const SYMMETRY_FIGURE_LABELS: Record<string, string> = {
  bateau: 'bateau',
  maison: 'maison',
  arbre: 'arbre',
  fleche: 'flèche',
  cle: 'clé',
  eclair: 'éclair',
  coeur: 'cœur',
  etoile: 'étoile',
  parapluie: 'parapluie',
  crayon: 'crayon',
  vase: 'vase',
  cygne: 'cygne',
  bonnet: 'bonnet',
  lampe: 'lampe',
  chateau: 'château',
  moulin: 'girouette',
  lune: 'lune',
  papillon: 'papillon',
  robot: 'robot',
  cloche: 'cloche',
  feuille: 'feuille',
}

/** Symétrie orthogonale par rapport à la verticale x = axisX. */
export function mirrorPoint(p: GridPt, axisX: number): GridPt {
  return { x: 2 * axisX - p.x, y: p.y }
}

/** Rotation horaire autour de (cx, cy). */
export function rotatePoint(p: GridPt, deg: SymRotation, cx: number, cy: number): GridPt {
  if (deg === 0) return { ...p }
  const dx = p.x - cx
  const dy = p.y - cy
  if (deg === 90) return { x: cx + dy, y: cy - dx }
  if (deg === 180) return { x: cx - dx, y: cy - dy }
  return { x: cx - dy, y: cy + dx } // 270
}

function applyRotationPts(pts: GridPt[], deg: SymRotation, axisX: number, rows: number): GridPt[] {
  if (deg === 0) return pts.map((p) => ({ ...p }))
  const cx = axisX / 2
  const cy = rows / 2
  return pts.map((p) => rotatePoint(p, deg, cx, cy))
}

function applyRotation(
  polylines: GridPt[][],
  deg: SymRotation,
  axisX: number,
  rows: number,
): GridPt[][] {
  return polylines.map((poly) => applyRotationPts(poly, deg, axisX, rows))
}

/** Décalage entier pour centrer dans la moitié gauche (intersections). */
function leftHalfShift(pts: GridPt[], axisX: number, rows: number): { dx: number; dy: number } {
  if (pts.length === 0) return { dx: 0, dy: 0 }
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of pts) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  const maxAllowedX = axisX - 1
  const boxW = maxX - minX
  const boxH = maxY - minY
  const targetMinX = Math.round(Math.max(0, (maxAllowedX - boxW) / 2))
  const targetMinY = Math.round(Math.max(0, (rows - boxH) / 2))
  let dx = targetMinX - minX
  let dy = targetMinY - minY
  if (minX + dx < 0) dx = -minX
  if (maxX + dx > maxAllowedX) dx = maxAllowedX - maxX
  if (minY + dy < 0) dy = -minY
  if (maxY + dy > rows) dy = rows - maxY
  return { dx: Math.round(dx), dy: Math.round(dy) }
}

/** Identifiant de base (sans suffixe -droite éventuel). */
export function symmetryBaseId(id: string): string {
  return id.replace(/-droite$/, '')
}

/**
 * Construit une figure placée (côté + rotation) à partir du modèle de base.
 * Les polylignes résultantes sont déjà du bon côté de l’axe.
 */
export function buildSymmetryFigure(
  baseId: string,
  side: 'left' | 'right' = 'left',
  rotation: SymRotation = 0,
): SymmetryTemplate | undefined {
  const base = SYMMETRY_TEMPLATES.find((t) => t.id === symmetryBaseId(baseId))
  if (!base) return undefined
  let polylines = applyRotation(base.polylines, rotation, base.axisX, base.rows)
  let dots = base.dots
    ? applyRotationPts(base.dots, rotation, base.axisX, base.rows)
    : undefined
  const shiftPts = [...polylines.flat(), ...(dots ?? [])]
  const { dx, dy } = leftHalfShift(shiftPts, base.axisX, base.rows)
  polylines = polylines.map((poly) =>
    poly.map((p) => ({ x: Math.round(p.x + dx), y: Math.round(p.y + dy) })),
  )
  dots = dots?.map((p) => ({ x: Math.round(p.x + dx), y: Math.round(p.y + dy) }))
  if (side === 'right') {
    polylines = polylines.map((poly) => poly.map((p) => mirrorPoint(p, base.axisX)))
    dots = dots?.map((p) => mirrorPoint(p, base.axisX))
  }
  return {
    ...base,
    id: base.id,
    side,
    rotation,
    polylines,
    dots,
  }
}

export function pickSymmetryTemplate(rng: Rng): SymmetryTemplate {
  const base = pick(rng, SYMMETRY_TEMPLATES)
  const side: 'left' | 'right' = rng() < 0.5 ? 'left' : 'right'
  const rotation = pick(rng, ROTATIONS)
  return buildSymmetryFigure(base.id, side, rotation) ?? base
}
