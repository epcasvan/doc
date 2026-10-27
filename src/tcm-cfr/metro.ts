/**
 * Plans de métro TCM CFR — grilles lettres × numéros, lignes colorées,
 * gares du Valais central (liste fixée).
 */
import { pick, shuffle, type Rng } from '@/math/rng'

export type MetroCell = string // ex. "E6"

export type MetroLine = {
  id: string
  name: string
  color: string
  cells: MetroCell[]
}

export type MetroMap = {
  id: string
  cols: string[]
  rows: number[]
  lines: MetroLine[]
}

export type MetroQuestionKind =
  | 'crossing'
  | 'gare-where'
  | 'gare-which'
  | 'path'
  | 'termini'

export type MetroQuestion = {
  prompt: string
  answer: string
  kind?: MetroQuestionKind
  /** Noms de métros / gares (1 ou 2 selon le type). */
  lineNames?: string[]
  /** Case (question « Quelle gare se trouve dans la case … »). */
  cell?: string
}

export function metroMapLabel(map: MetroMap, index = METRO_MAPS.findIndex((m) => m.id === map.id)): string {
  const n = index >= 0 ? index + 1 : 1
  return `Plan ${n}`
}

export function allMetroCells(map: MetroMap): MetroCell[] {
  const out: MetroCell[] = []
  for (const row of map.rows) {
    for (const col of map.cols) out.push(`${col}${row}`)
  }
  return out
}

function lineByName(map: MetroMap, name: string): MetroLine | undefined {
  return map.lines.find((l) => l.name === name)
}

/** Reconstruit énoncé + corrigé à partir du type et des sélections. */
export function buildMetroQuestion(
  kind: MetroQuestionKind,
  map: MetroMap,
  params: { lineNames?: string[]; cell?: string } = {},
): MetroQuestion {
  const names = params.lineNames ?? []
  if (kind === 'crossing') {
    const a = lineByName(map, names[0] ?? '') ?? map.lines[0]!
    let b = lineByName(map, names[1] ?? '') ?? map.lines[1] ?? map.lines[0]!
    if (b.id === a.id) b = map.lines.find((l) => l.id !== a.id) ?? b
    const cells = findIntersections(a, b)
    const cell = cells.length === 1 ? cells[0]! : (cells[0] ?? '—')
    return {
      kind,
      lineNames: [a.name, b.name],
      prompt: `Dans quelle case se croisent les métros de ${a.name} et de ${b.name} ?`,
      answer: cell,
    }
  }
  if (kind === 'gare-where') {
    const line = lineByName(map, names[0] ?? '') ?? map.lines[0]!
    return {
      kind,
      lineNames: [line.name],
      prompt: `Où se trouve la gare de ${line.name} ?`,
      answer: labelCell(line),
    }
  }
  if (kind === 'gare-which') {
    const cell = params.cell ?? labelCell(map.lines[0]!)
    const line = map.lines.find((l) => labelCell(l) === cell)
    return {
      kind,
      cell,
      prompt: `Quelle gare se trouve dans la case ${cell} ?`,
      answer: line?.name ?? '—',
    }
  }
  if (kind === 'path') {
    const line = lineByName(map, names[0] ?? '') ?? map.lines[0]!
    return {
      kind,
      lineNames: [line.name],
      prompt: `Par quelles cases passe le métro de ${line.name} ?`,
      answer: formatCellList(line.cells),
    }
  }
  const line = lineByName(map, names[0] ?? '') ?? map.lines[0]!
  const start = line.cells[0]!
  const end = line.cells[line.cells.length - 1]!
  return {
    kind,
    lineNames: [line.name],
    prompt: `Dans quelles cases se trouvent les stations de départ et d'arrivée du métro de ${line.name} ?`,
    answer: `${start} et ${end}`,
  }
}

/** Déduit le type si les questions générées avant n’ont pas encore `kind`. */
export function inferMetroQuestionKind(q: MetroQuestion): MetroQuestionKind {
  if (q.kind) return q.kind
  const p = q.prompt ?? ''
  if (/se croisent/i.test(p)) return 'crossing'
  if (/Où se trouve la gare/i.test(p)) return 'gare-where'
  if (/Quelle gare se trouve dans la case/i.test(p)) return 'gare-which'
  if (/Par quelles cases passe/i.test(p)) return 'path'
  return 'termini'
}

/** Complète kind / lineNames / cell à partir de l’énoncé (fiches déjà générées). */
export function hydrateMetroQuestion(q: MetroQuestion, map: MetroMap): MetroQuestion {
  const kind = inferMetroQuestionKind(q)
  if (q.kind && (q.lineNames?.length || q.cell)) {
    return { ...q, kind }
  }
  const p = q.prompt ?? ''
  if (kind === 'crossing') {
    const m = /métros de (.+?) et de (.+?) \?/.exec(p)
    return buildMetroQuestion('crossing', map, {
      lineNames: [m?.[1] ?? map.lines[0]!.name, m?.[2] ?? map.lines[1]?.name ?? map.lines[0]!.name],
    })
  }
  if (kind === 'gare-where') {
    const m = /gare de (.+?) \?/.exec(p)
    return buildMetroQuestion('gare-where', map, {
      lineNames: [m?.[1] ?? map.lines[0]!.name],
    })
  }
  if (kind === 'gare-which') {
    const m = /case ([A-K]\d+)/i.exec(p)
    return buildMetroQuestion('gare-which', map, {
      cell: m?.[1] ?? labelCell(map.lines[0]!),
    })
  }
  if (kind === 'path') {
    const m = /métro de (.+?) \?/.exec(p)
    return buildMetroQuestion('path', map, {
      lineNames: [m?.[1] ?? map.lines[0]!.name],
    })
  }
  const m = /métro de (.+?) \?/.exec(p)
  return buildMetroQuestion('termini', map, {
    lineNames: [m?.[1] ?? map.lines[0]!.name],
  })
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] as const
const ROWS = [1, 2, 3, 4, 5, 6, 7] as const

/** Couleurs imposées : jaune, vert, rouge, bleu, orange, violet, rose, cyan. */
const C = {
  yellow: '#ca8a04',
  green: '#18a66a',
  red: '#dc2626',
  blue: '#2563eb',
  orange: '#c45c12',
  violet: '#7c3aed',
  rose: '#be185d',
  cyan: '#0891b2',
} as const

function line(
  id: string,
  name: string,
  color: string,
  cells: MetroCell[],
): MetroLine {
  return { id, name, color, cells }
}

/**
 * Plans distincts (A–K × 1–7). Étiquette = première case.
 * 4 lignes coudées à 10 cellules ; autres traits 6–8 cellules.
 * Deux lignes partagent au plus une case (croisement unique).
 * Gares : Monthey, Vouvry, Martigny, Sion, Sierre, Vétroz, Ardon, Botza,
 * Synecom, Fully, Riddes, Saillon.
 */
export const METRO_MAPS: readonly MetroMap[] = [
  {
    id: 'metro-valais-1',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('monthey_1', 'Monthey', C.blue, ['B7', 'C6', 'D5', 'E5', 'F5', 'G5', 'H5', 'I6', 'J7', 'K7']),
      line('vouvry_1', 'Vouvry', C.orange, ['A1', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'H4', 'I5', 'J6']),
      line('martigny_1', 'Martigny', C.green, ['A3', 'B4', 'C5', 'D6', 'E6', 'F6', 'G6', 'H5', 'I4', 'J3']),
      line('sion_1', 'Sion', C.rose, ['K7', 'K6', 'K5', 'J4', 'I3', 'H2', 'G1', 'F1', 'E1', 'D1']),
      line('sierre_1', 'Sierre', C.cyan, ['A2', 'B2', 'C2', 'D2', 'E2', 'F2']),
      line('vetroz_1', 'Vétroz', C.red, ['F2', 'G2', 'H2', 'I2', 'J2', 'K2']),
      line('ardon_1', 'Ardon', C.yellow, ['A4', 'B4', 'C4', 'D4', 'E4', 'F4']),
      line('botza_1', 'Botza', C.violet, ['F4', 'G4', 'H4', 'I4', 'J4', 'K4']),
    ],
  },
  {
    id: 'metro-valais-2',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('vouvry_2', 'Vouvry', C.blue, ['J6', 'I5', 'H4', 'G3', 'F3', 'E3', 'D3', 'C3', 'B2', 'A1']),
      line('martigny_2', 'Martigny', C.orange, ['J2', 'I3', 'H4', 'G5', 'F5', 'E5', 'D5', 'C5', 'B6', 'A7']),
      line('sion_2', 'Sion', C.green, ['J7', 'I6', 'H5', 'G4', 'F4', 'E4', 'D4', 'C4', 'B5', 'A6']),
      line('sierre_2', 'Sierre', C.rose, ['J3', 'I4', 'H5', 'G6', 'F6', 'E6', 'D6', 'C5', 'B4', 'A3']),
      line('vetroz_2', 'Vétroz', C.cyan, ['G1', 'F1', 'E1', 'D1', 'C1', 'B1', 'A1']),
      line('ardon_2', 'Ardon', C.red, ['A2', 'B2', 'C2', 'D2', 'E2', 'F2']),
      line('botza_2', 'Botza', C.yellow, ['F2', 'G2', 'H2', 'I2', 'J2', 'K2']),
      line('synecom_2', 'Synecom', C.violet, ['A7', 'B7', 'C7', 'D7', 'E7', 'F7']),
    ],
  },
  {
    id: 'metro-valais-3',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('martigny_3', 'Martigny', C.blue, ['A1', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'H4', 'I5', 'J6']),
      line('sion_3', 'Sion', C.orange, ['A7', 'B6', 'C5', 'D5', 'E5', 'F5', 'G5', 'H4', 'I3', 'J2']),
      line('sierre_3', 'Sierre', C.green, ['A6', 'B5', 'C4', 'D4', 'E4', 'F4', 'G4', 'H3', 'I2', 'J1']),
      line('vetroz_3', 'Vétroz', C.rose, ['K4', 'J4', 'I4', 'H5', 'G6', 'F7', 'E7', 'D7', 'C6', 'B5']),
      line('ardon_3', 'Ardon', C.cyan, ['B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2']),
      line('botza_3', 'Botza', C.red, ['A6', 'B6', 'C6', 'D6', 'E6', 'F6']),
      line('synecom_3', 'Synecom', C.yellow, ['F6', 'G6', 'H6', 'I6', 'J6', 'K6']),
      line('fully_3', 'Fully', C.violet, ['F7', 'G7', 'H7', 'I7', 'J7', 'K7']),
    ],
  },
  {
    id: 'metro-valais-4',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('sion_4', 'Sion', C.blue, ['J2', 'I3', 'H4', 'G5', 'F5', 'E5', 'D5', 'C5', 'B6', 'A7']),
      line('sierre_4', 'Sierre', C.orange, ['J6', 'I6', 'H6', 'G6', 'F5', 'E4', 'D3', 'C2', 'B2', 'A2']),
      line('vetroz_4', 'Vétroz', C.green, ['K5', 'J5', 'I5', 'H5', 'G4', 'F3', 'E2', 'D1', 'C1', 'B1']),
      line('ardon_4', 'Ardon', C.rose, ['J5', 'I6', 'H7', 'G7', 'F7', 'E6', 'D5', 'C4', 'B4', 'A4']),
      line('botza_4', 'Botza', C.cyan, ['I2', 'H2', 'G2', 'F2', 'E2', 'D2']),
      line('synecom_4', 'Synecom', C.red, ['A3', 'B3', 'C3', 'D3', 'E3', 'F3']),
      line('fully_4', 'Fully', C.yellow, ['F3', 'G3', 'H3', 'I3', 'J3', 'K3']),
      line('riddes_4', 'Riddes', C.violet, ['C4', 'D4', 'E4', 'F4', 'G4', 'H4']),
    ],
  },
  {
    id: 'metro-valais-5',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('sierre_5', 'Sierre', C.blue, ['K7', 'J6', 'I5', 'H5', 'G5', 'F5', 'E5', 'D4', 'C3', 'B2']),
      line('vetroz_5', 'Vétroz', C.orange, ['K6', 'J5', 'I4', 'H4', 'G4', 'F4', 'E4', 'D3', 'C2', 'B1']),
      line('ardon_5', 'Ardon', C.green, ['A4', 'B4', 'C4', 'D5', 'E6', 'F7', 'G7', 'H7', 'I6', 'J5']),
      line('botza_5', 'Botza', C.rose, ['K2', 'J2', 'I2', 'H3', 'G4', 'F5', 'E6', 'D6', 'C6', 'B6']),
      line('synecom_5', 'Synecom', C.cyan, ['C3', 'D3', 'E3', 'F3', 'G3', 'H3', 'I3', 'J3']),
      line('fully_5', 'Fully', C.red, ['F6', 'G6', 'H6', 'I6', 'J6', 'K6']),
      line('riddes_5', 'Riddes', C.yellow, ['A7', 'B7', 'C7', 'D7', 'E7', 'F7']),
      line('saillon_5', 'Saillon', C.violet, ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']),
    ],
  },
  {
    id: 'metro-valais-6',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('vetroz_6', 'Vétroz', C.blue, ['B6', 'C6', 'D6', 'E6', 'F5', 'G4', 'H3', 'I2', 'J2', 'K2']),
      line('ardon_6', 'Ardon', C.orange, ['A5', 'B5', 'C5', 'D5', 'E4', 'F3', 'G2', 'H1', 'I1', 'J1']),
      line('botza_6', 'Botza', C.green, ['B5', 'C6', 'D7', 'E7', 'F7', 'G6', 'H5', 'I4', 'J4', 'K4']),
      line('synecom_6', 'Synecom', C.rose, ['J6', 'I6', 'H6', 'G6', 'F5', 'E4', 'D3', 'C2', 'B2', 'A2']),
      line('fully_6', 'Fully', C.cyan, ['J3', 'I3', 'H3', 'G3', 'F3', 'E3', 'D3']),
      line('riddes_6', 'Riddes', C.red, ['A4', 'B4', 'C4', 'D4', 'E4', 'F4']),
      line('saillon_6', 'Saillon', C.yellow, ['D5', 'E5', 'F5', 'G5', 'H5', 'I5']),
      line('monthey_6', 'Monthey', C.violet, ['F7', 'G7', 'H7', 'I7', 'J7', 'K7']),
    ],
  },
  {
    id: 'metro-valais-7',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('ardon_7', 'Ardon', C.blue, ['K6', 'J5', 'I4', 'H4', 'G4', 'F4', 'E4', 'D3', 'C2', 'B1']),
      line('botza_7', 'Botza', C.orange, ['A4', 'B4', 'C4', 'D5', 'E6', 'F7', 'G7', 'H7', 'I6', 'J5']),
      line('synecom_7', 'Synecom', C.green, ['K2', 'J2', 'I2', 'H3', 'G4', 'F5', 'E6', 'D6', 'C6', 'B6']),
      line('fully_7', 'Fully', C.rose, ['K1', 'J1', 'I1', 'H2', 'G3', 'F4', 'E5', 'D5', 'C5', 'B5']),
      line('riddes_7', 'Riddes', C.cyan, ['E5', 'F5', 'G5', 'H5', 'I5', 'J5']),
      line('saillon_7', 'Saillon', C.red, ['F6', 'G6', 'H6', 'I6', 'J6', 'K6']),
      line('monthey_7', 'Monthey', C.yellow, ['A7', 'B7', 'C7', 'D7', 'E7', 'F7']),
      line('vouvry_7', 'Vouvry', C.violet, ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']),
    ],
  },
  {
    id: 'metro-valais-8',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('botza_8', 'Botza', C.blue, ['J7', 'I6', 'H5', 'G4', 'F4', 'E4', 'D4', 'C4', 'B5', 'A6']),
      line('synecom_8', 'Synecom', C.orange, ['B6', 'C6', 'D6', 'E6', 'F5', 'G4', 'H3', 'I2', 'J2', 'K2']),
      line('fully_8', 'Fully', C.green, ['H7', 'G7', 'F7', 'E7', 'D6', 'C5', 'B4', 'A3', 'A2', 'A1']),
      line('riddes_8', 'Riddes', C.rose, ['D1', 'E1', 'F1', 'G1', 'H2', 'I3', 'J4', 'K5', 'K6', 'K7']),
      line('saillon_8', 'Saillon', C.cyan, ['A5', 'B5', 'C5', 'D5', 'E5', 'F5']),
      line('monthey_8', 'Monthey', C.red, ['F5', 'G5', 'H5', 'I5', 'J5', 'K5']),
      line('vouvry_8', 'Vouvry', C.yellow, ['E6', 'F6', 'G6', 'H6', 'I6', 'J6']),
      line('martigny_8', 'Martigny', C.violet, ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']),
    ],
  },
  {
    id: 'metro-valais-9',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('synecom_9', 'Synecom', C.blue, ['J1', 'I1', 'H1', 'G2', 'F3', 'E4', 'D5', 'C5', 'B5', 'A5']),
      line('fully_9', 'Fully', C.orange, ['K4', 'J4', 'I4', 'H5', 'G6', 'F7', 'E7', 'D7', 'C6', 'B5']),
      line('riddes_9', 'Riddes', C.green, ['A2', 'B2', 'C2', 'D3', 'E4', 'F5', 'G6', 'H6', 'I6', 'J6']),
      line('saillon_9', 'Saillon', C.rose, ['A1', 'B1', 'C1', 'D2', 'E3', 'F4', 'G5', 'H5', 'I5', 'J5']),
      line('monthey_9', 'Monthey', C.cyan, ['A6', 'B6', 'C6', 'D6', 'E6', 'F6']),
      line('vouvry_9', 'Vouvry', C.red, ['F7', 'G7', 'H7', 'I7', 'J7', 'K7']),
      line('martigny_9', 'Martigny', C.yellow, ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']),
      line('sion_9', 'Sion', C.violet, ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']),
    ],
  },
  {
    id: 'metro-valais-10',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('fully_10', 'Fully', C.blue, ['J5', 'I6', 'H7', 'G7', 'F7', 'E6', 'D5', 'C4', 'B4', 'A4']),
      line('riddes_10', 'Riddes', C.orange, ['B6', 'C6', 'D6', 'E6', 'F5', 'G4', 'H3', 'I2', 'J2', 'K2']),
      line('saillon_10', 'Saillon', C.green, ['B5', 'C5', 'D5', 'E5', 'F4', 'G3', 'H2', 'I1', 'J1', 'K1']),
      line('monthey_10', 'Monthey', C.rose, ['D1', 'E1', 'F1', 'G1', 'H2', 'I3', 'J4', 'K5', 'K6', 'K7']),
      line('vouvry_10', 'Vouvry', C.cyan, ['F6', 'G6', 'H6', 'I6', 'J6', 'K6']),
      line('martigny_10', 'Martigny', C.red, ['A7', 'B7', 'C7', 'D7', 'E7', 'F7']),
      line('sion_10', 'Sion', C.yellow, ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']),
      line('sierre_10', 'Sierre', C.violet, ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']),
    ],
  },
  {
    id: 'metro-valais-11',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('riddes_11', 'Riddes', C.blue, ['K2', 'J2', 'I2', 'H3', 'G4', 'F5', 'E6', 'D6', 'C6', 'B6']),
      line('saillon_11', 'Saillon', C.orange, ['K1', 'J1', 'I1', 'H2', 'G3', 'F4', 'E5', 'D5', 'C5', 'B5']),
      line('monthey_11', 'Monthey', C.green, ['A1', 'A2', 'A3', 'B4', 'C5', 'D6', 'E7', 'F7', 'G7', 'H7']),
      line('vouvry_11', 'Vouvry', C.rose, ['K7', 'K6', 'K5', 'J4', 'I3', 'H2', 'G1', 'F1', 'E1', 'D1']),
      line('martigny_11', 'Martigny', C.cyan, ['J6', 'I6', 'H6', 'G6', 'F6', 'E6']),
      line('sion_11', 'Sion', C.red, ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']),
      line('sierre_11', 'Sierre', C.yellow, ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']),
      line('vetroz_11', 'Vétroz', C.violet, ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']),
    ],
  },
  {
    id: 'metro-valais-12',
    cols: [...COLS],
    rows: [...ROWS],
    lines: [
      line('saillon_12', 'Saillon', C.blue, ['B3', 'C4', 'D5', 'E6', 'F6', 'G6', 'H6', 'I5', 'J4', 'K3']),
      line('monthey_12', 'Monthey', C.orange, ['J5', 'I5', 'H5', 'G5', 'F4', 'E3', 'D2', 'C1', 'B1', 'A1']),
      line('vouvry_12', 'Vouvry', C.green, ['H1', 'G1', 'F1', 'E1', 'D2', 'C3', 'B4', 'A5', 'A6', 'A7']),
      line('martigny_12', 'Martigny', C.rose, ['A6', 'B5', 'C4', 'D4', 'E4', 'F4', 'G4', 'H3', 'I2', 'J1']),
      line('sion_12', 'Sion', C.cyan, ['C7', 'D7', 'E7', 'F7', 'G7', 'H7', 'I7']),
      line('sierre_12', 'Sierre', C.red, ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']),
      line('vetroz_12', 'Vétroz', C.yellow, ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']),
      line('ardon_12', 'Ardon', C.violet, ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']),
    ],
  },
]

export function pickMetroMap(rng: Rng): MetroMap {
  return pick(rng, METRO_MAPS)
}

/** Première case = emplacement du nom (étiquette). */
export function labelCell(line: MetroLine): MetroCell {
  return line.cells[0]!
}

export function findIntersections(a: MetroLine, b: MetroLine): MetroCell[] {
  const setB = new Set(b.cells)
  return a.cells.filter((c) => setB.has(c))
}

/** Message si la paire ne convient pas pour une question de croisement. */
export function metroCrossingWarning(
  map: MetroMap,
  nameA: string,
  nameB: string,
): string | undefined {
  const a = lineByName(map, nameA)
  const b = lineByName(map, nameB)
  if (!a || !b) return undefined
  if (a.id === b.id) {
    return 'Choisissez deux métros différents.'
  }
  const cells = findIntersections(a, b)
  if (cells.length === 0) {
    return `Les métros de ${a.name} et de ${b.name} ne se croisent pas sur ce plan.`
  }
  return undefined
}

type Crossing = { a: MetroLine; b: MetroLine; cell: MetroCell }

/** Croisements à un seul point (pas de chevauchement de segments). */
function singlePointCrossings(map: MetroMap): Crossing[] {
  const out: Crossing[] = []
  for (let i = 0; i < map.lines.length; i++) {
    for (let j = i + 1; j < map.lines.length; j++) {
      const a = map.lines[i]!
      const b = map.lines[j]!
      const cells = findIntersections(a, b)
      if (cells.length === 1) {
        out.push({ a, b, cell: cells[0]! })
      }
    }
  }
  return out
}

function formatCellList(cells: MetroCell[]): string {
  return cells.join(', ')
}

/**
 * Exactement 5 questions, ordre mélangé, libellés « gare » / « métro de ».
 * La question de croisement n’utilise que des paires à un seul point commun.
 */
export function generateMetroQuestions(rng: Rng, map: MetroMap): MetroQuestion[] {
  const lines = shuffle(rng, map.lines)
  const crossings = shuffle(rng, singlePointCrossings(map))

  const lineForLabel = lines[0]!
  const crossing =
    crossings[0] ??
    (() => {
      // Repli : première intersection trouvée (ne devrait pas arriver).
      for (let i = 0; i < map.lines.length; i++) {
        for (let j = i + 1; j < map.lines.length; j++) {
          const a = map.lines[i]!
          const b = map.lines[j]!
          const cells = findIntersections(a, b)
          if (cells.length === 1) return { a, b, cell: cells[0]! }
        }
      }
      const a = map.lines[0]!
      const b = map.lines[1]!
      return { a, b, cell: a.cells.find((c) => b.cells.includes(c)) ?? a.cells[0]! }
    })()

  const labeledLine = pick(rng, map.lines)
  const labelOf = labelCell(labeledLine)

  const pathLine = lines[1] ?? lines[0]!
  const terminiLine = lines[2] ?? lines[0]!

  const questions: MetroQuestion[] = [
    buildMetroQuestion('gare-where', map, { lineNames: [lineForLabel.name] }),
    buildMetroQuestion('crossing', map, {
      lineNames: [crossing.a.name, crossing.b.name],
    }),
    buildMetroQuestion('gare-which', map, { cell: labelOf }),
    buildMetroQuestion('path', map, { lineNames: [pathLine.name] }),
    buildMetroQuestion('termini', map, { lineNames: [terminiLine.name] }),
  ]
  return shuffle(rng, questions)
}
