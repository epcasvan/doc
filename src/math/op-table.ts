import { fmt } from './column-arith'
import type { NumberRange } from './difficulty'
import { int, pick, shuffle, type Rng } from './rng'
import type { Difficulty, MathItem, OpTable, OpTableVariant } from './types'

const SIZE = 4

export function opTableCell(op: OpTable['op'], row: number, col: number): number {
  return op === '+' ? row + col : row - col
}

export function opTableAnswer(table: OpTable): string {
  const parts: string[] = []
  table.cols.forEach((col, c) => {
    if (table.colBlank[c]) parts.push(`colonne ${c + 1} : ${fmt(col)}`)
  })
  table.rows.forEach((row, r) => {
    if (table.rowBlank[r]) parts.push(`ligne ${r + 1} : ${fmt(row)}`)
  })
  for (let r = 0; r < table.rows.length; r++) {
    for (let c = 0; c < table.cols.length; c++) {
      if (!table.cellBlank[r]?.[c]) continue
      const row = table.rows[r]!
      const col = table.cols[c]!
      parts.push(`${fmt(row)} ${table.op} ${fmt(col)} = ${fmt(opTableCell(table.op, row, col))}`)
    }
  }
  return parts.join(' ; ')
}

export function opTableError(table: OpTable): string | undefined {
  if (table.op !== '−') return undefined
  for (const row of table.rows) {
    for (const col of table.cols) {
      if (row < col) {
        return 'Pour une soustraction, chaque nombre de ligne doit être au moins égal au nombre de colonne.'
      }
    }
  }
  return undefined
}

function limits(difficulty: Difficulty, range?: NumberRange): [number, number] {
  if (range && range.max > range.min) {
    return [Math.max(0, Math.round(range.min)), Math.round(range.max)]
  }
  if (difficulty === 'facile') return [1, 9]
  if (difficulty === 'moyen') return [4, 30]
  return [10, 60]
}

function uniqueInts(rng: Rng, count: number, min: number, max: number): number[] {
  const lo = Math.min(min, max)
  const hi = Math.max(min, max)
  const pool: number[] = []
  for (let n = lo; n <= hi; n++) pool.push(n)
  const out = shuffle(rng, pool).slice(0, count)
  while (out.length < count) out.push(int(rng, lo, hi))
  return out
}

function blankGrid(rows: number, cols: number, value: boolean): boolean[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => value))
}

function flags(n: number, value: boolean): boolean[] {
  return Array.from({ length: n }, () => value)
}

type Knowledge = { rows: boolean[]; cols: boolean[] }

function knowledge(table: OpTable): Knowledge {
  const rows = table.rowBlank.map((blank) => !blank)
  const cols = table.colBlank.map((blank) => !blank)
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < table.rows.length; r++) {
      for (let c = 0; c < table.cols.length; c++) {
        if (table.cellBlank[r]?.[c]) continue
        if (rows[r] && !cols[c]) {
          cols[c] = true
          changed = true
        } else if (cols[c] && !rows[r]) {
          rows[r] = true
          changed = true
        }
      }
    }
  }
  return { rows, cols }
}

function solved(know: Knowledge): boolean {
  return know.rows.every(Boolean) && know.cols.every(Boolean)
}

function indexes(known: boolean[], wantKnown: boolean): number[] {
  const out: number[] = []
  known.forEach((value, index) => {
    if (value === wantKnown) out.push(index)
  })
  return out
}

/** Ajoute des cases données jusqu’à ce que chaque en-tête caché se déduise. */
function addClues(table: OpTable, rng: Rng) {
  for (let guard = 0; guard < 24 && !solved(knowledge(table)); guard++) {
    const know = knowledge(table)
    const hiddenRows = indexes(know.rows, false)
    const hiddenCols = indexes(know.cols, false)
    const shownRows = indexes(know.rows, true)
    const shownCols = indexes(know.cols, true)
    const revealRow = hiddenRows.length > 0 && shownCols.length > 0 && (hiddenCols.length === 0 || rng() < 0.5)
    if (revealRow) {
      const r = pick(rng, hiddenRows)
      const c = pick(rng, shownCols)
      table.cellBlank[r]![c] = false
      continue
    }
    if (hiddenCols.length > 0 && shownRows.length > 0) {
      const c = pick(rng, hiddenCols)
      const r = pick(rng, shownRows)
      table.cellBlank[r]![c] = false
      continue
    }
    if (hiddenRows.length > 0) table.rowBlank[hiddenRows[0]!] = false
    else if (hiddenCols.length > 0) table.colBlank[hiddenCols[0]!] = false
  }
}

function hideSome(rng: Rng, n: number): boolean[] {
  const count = int(rng, 1, n - 1)
  const chosen = new Set(shuffle(rng, Array.from({ length: n }, (_, i) => i)).slice(0, count))
  return Array.from({ length: n }, (_, i) => chosen.has(i))
}

export function generateOpTableItem(
  op: OpTable['op'],
  variant: OpTableVariant,
  rng: Rng,
  difficulty: Difficulty,
  range?: NumberRange,
): MathItem {
  let [min, max] = limits(difficulty, range)
  if (max - min < SIZE - 1) max = min + SIZE + 4
  const colHi = op === '−' ? min + Math.max(SIZE - 1, Math.floor((max - min) / 2)) : max
  const cols = uniqueInts(rng, SIZE, min, Math.min(max, colHi))
  const rowLo = op === '−' ? Math.max(...cols) : min
  const rows = uniqueInts(rng, SIZE, rowLo, Math.max(max, rowLo + SIZE))
  const colBlank = flags(SIZE, false)
  const rowBlank = flags(SIZE, false)
  const cellBlank = blankGrid(SIZE, SIZE, true)

  if (variant === 'headers') {
    const hideRows = rng() < 0.5
    for (let i = 0; i < SIZE; i++) {
      if (hideRows) rowBlank[i] = true
      else colBlank[i] = true
      cellBlank[i]![i] = false
    }
  } else if (variant === 'mixed') {
    const nextRows = hideSome(rng, SIZE)
    const nextCols = hideSome(rng, SIZE)
    for (let i = 0; i < SIZE; i++) {
      rowBlank[i] = nextRows[i]!
      colBlank[i] = nextCols[i]!
    }
  }

  const table: OpTable = { op, variant, cols, rows, colBlank, rowBlank, cellBlank }
  if (variant === 'mixed') addClues(table, rng)

  return {
    layout: 'op-table',
    op,
    opTable: table,
    answer: opTableAnswer(table),
  }
}
