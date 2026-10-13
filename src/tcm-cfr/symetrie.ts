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
}

/** Grille 20 de long × 10 de haut, axe vertical au centre. */
const COLS = 20
const ROWS = 10
const AXIS = 10

const ROTATIONS: readonly SymRotation[] = [0, 90, 180, 270]

function T(id: string, polylines: GridPt[][]): SymmetryTemplate {
  return {
    id,
    cols: COLS,
    rows: ROWS,
    axisX: AXIS,
    side: 'left',
    rotation: 0,
    polylines,
  }
}

/**
 * 20 silhouettes d’objets (géométrie originale).
 * Toutes définies à gauche de l’axe, sans le toucher (x max ≤ 9).
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
      { x: 8, y: 1 },
      { x: 8, y: 5 },
      { x: 1, y: 5 },
      { x: 1, y: 1 },
    ],
    [
      { x: 1, y: 5 },
      { x: 4.5, y: 9 },
      { x: 8, y: 5 },
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
      { x: 7, y: 4 },
      { x: 7, y: 3 },
      { x: 6, y: 3 },
    ],
  ]),

  T('arbre', [
    [
      { x: 4, y: 1 },
      { x: 4, y: 4 },
    ],
    [
      { x: 3, y: 1 },
      { x: 5, y: 1 },
    ],
    [
      { x: 1, y: 4 },
      { x: 7, y: 4 },
      { x: 6, y: 6 },
      { x: 4, y: 9 },
      { x: 2, y: 6 },
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

  T('escaliers', [
    [
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 3, y: 3 },
      { x: 5, y: 3 },
      { x: 5, y: 5 },
      { x: 7, y: 5 },
      { x: 7, y: 7 },
      { x: 9, y: 7 },
      { x: 9, y: 9 },
    ],
  ]),

  T('drapeau', [
    [
      { x: 2, y: 1 },
      { x: 2, y: 9 },
    ],
    [
      { x: 2, y: 9 },
      { x: 8, y: 9 },
      { x: 8, y: 6 },
      { x: 2, y: 6 },
    ],
  ]),

  T('fusee', [
    [
      { x: 3, y: 2 },
      { x: 6, y: 2 },
      { x: 6, y: 7 },
      { x: 4.5, y: 9 },
      { x: 3, y: 7 },
      { x: 3, y: 2 },
    ],
    [
      { x: 3, y: 2 },
      { x: 1, y: 1 },
      { x: 3, y: 1 },
    ],
    [
      { x: 6, y: 2 },
      { x: 8, y: 1 },
      { x: 6, y: 1 },
    ],
    [
      { x: 4.5, y: 4 },
      { x: 4.5, y: 6 },
    ],
  ]),

  T('poisson', [
    [
      { x: 1, y: 5 },
      { x: 3, y: 7 },
      { x: 6, y: 8 },
      { x: 8, y: 6 },
      { x: 9, y: 5 },
      { x: 8, y: 4 },
      { x: 6, y: 2 },
      { x: 3, y: 3 },
      { x: 1, y: 5 },
    ],
    [
      { x: 1, y: 5 },
      { x: 0, y: 7 },
      { x: 0, y: 3 },
      { x: 1, y: 5 },
    ],
    [
      { x: 7, y: 5.5 },
      { x: 7.5, y: 5.5 },
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
      { x: 5, y: 1 },
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 6, y: 2 },
      { x: 6, y: 1.5 },
    ],
  ]),

  T('chapeau', [
    [
      { x: 0, y: 3 },
      { x: 9, y: 3 },
    ],
    [
      { x: 2, y: 3 },
      { x: 2, y: 6 },
      { x: 3, y: 8 },
      { x: 6, y: 8 },
      { x: 7, y: 6 },
      { x: 7, y: 3 },
    ],
  ]),

  T('oiseau', [
    [
      { x: 1, y: 5 },
      { x: 3, y: 7 },
      { x: 5, y: 7 },
      { x: 7, y: 5 },
      { x: 8, y: 4 },
      { x: 6, y: 4 },
      { x: 5, y: 2 },
      { x: 3, y: 4 },
      { x: 1, y: 5 },
    ],
    [
      { x: 5, y: 7 },
      { x: 5, y: 9 },
      { x: 6, y: 9 },
    ],
    [
      { x: 1, y: 5 },
      { x: 0, y: 6 },
    ],
  ]),

  T('voiture', [
    [
      { x: 1, y: 2 },
      { x: 8, y: 2 },
      { x: 8, y: 4 },
      { x: 6, y: 4 },
      { x: 5, y: 6 },
      { x: 3, y: 6 },
      { x: 2, y: 4 },
      { x: 1, y: 4 },
      { x: 1, y: 2 },
    ],
    [
      { x: 2.5, y: 2 },
      { x: 2.5, y: 1 },
    ],
    [
      { x: 6.5, y: 2 },
      { x: 6.5, y: 1 },
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
      { x: 4.5, y: 1 },
      { x: 1, y: 4 },
      { x: 1, y: 6 },
      { x: 2.5, y: 8 },
      { x: 4.5, y: 6.5 },
      { x: 6.5, y: 8 },
      { x: 8, y: 6 },
      { x: 8, y: 4 },
      { x: 4.5, y: 1 },
    ],
  ]),

  T('etoile', [
    [
      { x: 4.5, y: 9 },
      { x: 5.2, y: 6 },
      { x: 8, y: 6 },
      { x: 5.8, y: 4.2 },
      { x: 6.8, y: 1 },
      { x: 4.5, y: 2.8 },
      { x: 2.2, y: 1 },
      { x: 3.2, y: 4.2 },
      { x: 1, y: 6 },
      { x: 3.8, y: 6 },
      { x: 4.5, y: 9 },
    ],
  ]),

  T('champignon', [
    [
      { x: 1, y: 5 },
      { x: 8, y: 5 },
      { x: 8, y: 7 },
      { x: 6, y: 9 },
      { x: 3, y: 9 },
      { x: 1, y: 7 },
      { x: 1, y: 5 },
    ],
    [
      { x: 3.5, y: 1 },
      { x: 3.5, y: 5 },
      { x: 5.5, y: 5 },
      { x: 5.5, y: 1 },
      { x: 3.5, y: 1 },
    ],
  ]),

  T('ancre', [
    [
      { x: 4.5, y: 9 },
      { x: 4.5, y: 2 },
    ],
    [
      { x: 3, y: 8 },
      { x: 6, y: 8 },
    ],
    [
      { x: 2, y: 3 },
      { x: 2, y: 1 },
      { x: 4.5, y: 2 },
      { x: 7, y: 1 },
      { x: 7, y: 3 },
    ],
    [
      { x: 3.5, y: 9 },
      { x: 5.5, y: 9 },
      { x: 5.5, y: 8 },
      { x: 3.5, y: 8 },
      { x: 3.5, y: 9 },
    ],
  ]),

  T('parapluie', [
    [
      { x: 1, y: 6 },
      { x: 4.5, y: 9 },
      { x: 8, y: 6 },
      { x: 1, y: 6 },
    ],
    [
      { x: 4.5, y: 6 },
      { x: 4.5, y: 1 },
    ],
    [
      { x: 4.5, y: 1 },
      { x: 6, y: 1 },
      { x: 6, y: 2 },
    ],
  ]),

  T('tasse', [
    [
      { x: 2, y: 1 },
      { x: 6, y: 1 },
      { x: 6, y: 7 },
      { x: 2, y: 7 },
      { x: 2, y: 1 },
    ],
    [
      { x: 6, y: 5 },
      { x: 8, y: 5 },
      { x: 8, y: 3 },
      { x: 6, y: 3 },
    ],
    [
      { x: 1, y: 7 },
      { x: 7, y: 7 },
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
]

export const SYMMETRY_FIGURE_LABELS: Record<string, string> = {
  bateau: 'bateau',
  maison: 'maison',
  arbre: 'arbre',
  fleche: 'flèche',
  escaliers: 'escaliers',
  drapeau: 'drapeau',
  fusee: 'fusée',
  poisson: 'poisson',
  cle: 'clé',
  chapeau: 'chapeau',
  oiseau: 'oiseau',
  voiture: 'voiture',
  eclair: 'éclair',
  coeur: 'cœur',
  etoile: 'étoile',
  champignon: 'champignon',
  ancre: 'ancre',
  parapluie: 'parapluie',
  tasse: 'tasse',
  crayon: 'crayon',
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

function applyRotation(
  polylines: GridPt[][],
  deg: SymRotation,
  axisX: number,
  rows: number,
): GridPt[][] {
  if (deg === 0) return polylines.map((poly) => poly.map((p) => ({ ...p })))
  const cx = axisX / 2
  const cy = rows / 2
  return polylines.map((poly) => poly.map((p) => rotatePoint(p, deg, cx, cy)))
}

/** Replace la figure dans la moitié gauche (marge avant l’axe). */
function fitInLeftHalf(polylines: GridPt[][], axisX: number, rows: number): GridPt[][] {
  const pts = polylines.flat()
  if (pts.length === 0) return polylines
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
  const minAllowedX = 0
  const minAllowedY = 0
  const maxAllowedY = rows
  const boxW = maxX - minX
  const boxH = maxY - minY
  // Centrer dans la moitié gauche disponible.
  const targetMinX = minAllowedX + Math.max(0, (maxAllowedX - minAllowedX - boxW) / 2)
  const targetMinY = minAllowedY + Math.max(0, (maxAllowedY - minAllowedY - boxH) / 2)
  let dx = targetMinX - minX
  let dy = targetMinY - minY
  // Garde-fous si le cadrage déborde encore.
  if (minX + dx < minAllowedX) dx = minAllowedX - minX
  if (maxX + dx > maxAllowedX) dx = maxAllowedX - maxX
  if (minY + dy < minAllowedY) dy = minAllowedY - minY
  if (maxY + dy > maxAllowedY) dy = maxAllowedY - maxY
  return polylines.map((poly) => poly.map((p) => ({ x: p.x + dx, y: p.y + dy })))
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
  polylines = fitInLeftHalf(polylines, base.axisX, base.rows)
  if (side === 'right') {
    polylines = polylines.map((poly) => poly.map((p) => mirrorPoint(p, base.axisX)))
  }
  return {
    ...base,
    id: base.id,
    side,
    rotation,
    polylines,
  }
}

export function pickSymmetryTemplate(rng: Rng): SymmetryTemplate {
  const base = pick(rng, SYMMETRY_TEMPLATES)
  const side: 'left' | 'right' = rng() < 0.5 ? 'left' : 'right'
  const rotation = pick(rng, ROTATIONS)
  return buildSymmetryFigure(base.id, side, rotation) ?? base
}
