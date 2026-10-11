import { useState } from 'react'
import {
  COORD_LETTER_MAX,
  COORD_SHAPES,
  clampFormesCellMm,
  clampFormesCols,
  clampFormesRows,
  clampOrigin,
  coordSizeFor,
  ensureGivenMark,
  markOnGrid,
  nextPointLabel,
  remapMarksToOrigin,
  resolveAxesGrid,
} from '@/math/coord-reperage'
import {
  TRANSFORM_LABELS,
  TRANSFORM_MAX_POINTS,
} from '@/math/coord-transformations'
import type {
  CoordShape,
  Difficulty,
  ExerciseBlock,
  PageConfig,
} from '@/math/types'

export type CoordTool = 'origin' | 'given' | 'points' | 'center'

export type UseCoordEditingParams = {
  activeBlock: ExerciseBlock
  activeAsPage: PageConfig
  updatePage: (patch: Partial<ExerciseBlock>) => void
  isCadrans: boolean
  isComposer: boolean
  isTransform: boolean
  isTransformCentrale: boolean
}

export function useCoordEditing({
  activeBlock,
  activeAsPage,
  updatePage,
  isCadrans,
  isComposer,
  isTransform,
  isTransformCentrale,
}: UseCoordEditingParams) {
  const [coordTool, setCoordTool] = useState<CoordTool>('origin')

  const axesGrid = resolveAxesGrid(activeAsPage, activeBlock.difficulty)

  const updateAxesGrid = (patch: Partial<ExerciseBlock>) => {
    const next = { ...activeBlock, ...patch }
    const grid = resolveAxesGrid({ ...activeAsPage, ...next }, next.difficulty)
    updatePage({
      ...patch,
      coordCols: grid.cols,
      coordRows: grid.rows,
      coordCellMm: grid.cellMm,
      coordUnitSquares: grid.unitSquares,
      coordMarks: isCadrans
        ? (next.coordMarks ?? []).filter((mark) =>
            markOnGrid(
              mark,
              {
                col: next.coordOriginCol ?? grid.cols / 2,
                row: next.coordOriginRow ?? grid.rows / 2,
              },
              grid.cols,
              grid.rows,
              grid.unitSquares,
            ),
          )
        : next.coordMarks,
    })
  }

  const placeOrigin = (col: number, row: number) => {
    const grid = resolveAxesGrid(activeAsPage, activeBlock.difficulty)
    const from = {
      col: activeBlock.coordOriginCol ?? grid.cols / 2,
      row: activeBlock.coordOriginRow ?? grid.rows / 2,
    }
    const to = clampOrigin(col, row, grid.cols, grid.rows)
    const remapped = remapMarksToOrigin(activeBlock.coordMarks ?? [], from, to, grid.unitSquares).filter((mark) =>
      markOnGrid(mark, to, grid.cols, grid.rows, grid.unitSquares),
    )
    updatePage({
      coordLibre: true,
      coordOriginCol: to.col,
      coordOriginRow: to.row,
      coordCols: grid.cols,
      coordRows: grid.rows,
      coordCellMm: grid.cellMm,
      coordUnitSquares: grid.unitSquares,
      coordMarks: isComposer ? ensureGivenMark(remapped) : remapped,
    })
  }

  const placeCoordMark = (x: number, y: number, kind: CoordShape) => {
    if (isTransform && activeBlock.coordLibre) {
      const grid = resolveAxesGrid(activeAsPage, activeBlock.difficulty)
      const origin = { col: grid.cols / 2, row: grid.rows / 2 }
      if (!markOnGrid({ x, y, kind: 'point' }, origin, grid.cols, grid.rows, grid.unitSquares)) return
      const current = activeBlock.coordMarks ?? []
      const omega = current.find((mark) => mark.label === 'Ω')
      const figure = current.filter((mark) => mark.label !== 'Ω')
      const maxPts = Math.min(activeBlock.count, TRANSFORM_MAX_POINTS)
      const placeCenter = isTransformCentrale && coordTool === 'center'

      if (placeCenter) {
        const withoutOmega = figure.filter((mark) => !(mark.x === x && mark.y === y))
        updatePage({
          coordLibre: true,
          coordCols: grid.cols,
          coordRows: grid.rows,
          coordCellMm: grid.cellMm,
          coordUnitSquares: grid.unitSquares,
          coordMarks: [
            ...withoutOmega,
            { x, y, kind: 'point', label: 'Ω', given: true, showCoord: true },
          ],
        })
        return
      }

      const hit = current.find((mark) => mark.x === x && mark.y === y)
      if (hit) {
        updatePage({
          coordLibre: true,
          coordMarks: current.filter((mark) => !(mark.x === x && mark.y === y)),
        })
        return
      }
      if (figure.length >= maxPts) return
      const used = new Set(figure.map((mark) => mark.label))
      const label = TRANSFORM_LABELS.find((name) => !used.has(name)) ?? `P${figure.length + 1}`
      const nextFigure = [...figure, { x, y, kind: 'point' as const, label }]
      updatePage({
        coordLibre: true,
        coordCols: grid.cols,
        coordRows: grid.rows,
        coordCellMm: grid.cellMm,
        coordUnitSquares: grid.unitSquares,
        coordMarks: omega ? [...nextFigure, omega] : nextFigure,
        count: Math.max(activeBlock.count, nextFigure.length),
      })
      return
    }
    if (isCadrans) {
      const grid = resolveAxesGrid(activeAsPage, activeBlock.difficulty)
      const origin = {
        col: activeBlock.coordOriginCol ?? grid.cols / 2,
        row: activeBlock.coordOriginRow ?? grid.rows / 2,
      }
      if (!markOnGrid({ x, y, kind: 'point' }, origin, grid.cols, grid.rows, grid.unitSquares)) return
      if (x === 0 && y === 0 && isComposer) return
      const without = (activeBlock.coordMarks ?? []).filter((mark) => !(mark.x === x && mark.y === y))
      const current = (activeBlock.coordMarks ?? []).find((mark) => mark.x === x && mark.y === y)
      const others = without.filter((mark) => !mark.given)
      const asGiven = isComposer && (coordTool === 'given' || !without.some((mark) => mark.given))
      if (!current && !asGiven && others.length >= activeBlock.count) return
      if (!current && asGiven && without.length + 1 > COORD_LETTER_MAX) return
      const nextMarks = [
        ...without.map((mark) => (asGiven ? { ...mark, given: false, showCoord: false } : mark)),
        {
          x,
          y,
          kind: 'point' as const,
          label: current?.label ?? nextPointLabel(without),
          given: asGiven,
          showCoord: asGiven,
        },
      ]
      updatePage({
        coordLibre: true,
        coordCols: grid.cols,
        coordRows: grid.rows,
        coordCellMm: grid.cellMm,
        coordUnitSquares: grid.unitSquares,
        coordOriginCol: isComposer ? origin.col : activeBlock.coordOriginCol,
        coordOriginRow: isComposer ? origin.row : activeBlock.coordOriginRow,
        coordMarks: isComposer ? ensureGivenMark(nextMarks) : nextMarks,
      })
      return
    }
    const cellMm = clampFormesCellMm(activeBlock.coordCellMm)
    const cols = clampFormesCols(activeBlock.coordCols ?? coordSizeFor(activeBlock.difficulty as Difficulty).cols, cellMm)
    const rows = clampFormesRows(activeBlock.coordRows ?? coordSizeFor(activeBlock.difficulty as Difficulty).rows, cellMm)
    if (x < 1 || y < 1 || x > cols || y > rows) return
    const without = (activeBlock.coordMarks ?? []).filter(
      (mark) => !(mark.x === x && mark.y === y) && mark.kind !== kind,
    )
    if (without.length >= COORD_SHAPES.length) return
    const nextMarks = [...without, { x, y, kind }]
    updatePage({
      coordLibre: true,
      coordCols: cols,
      coordRows: rows,
      coordCellMm: cellMm,
      coordAxis: activeBlock.coordAxis ?? 'letters',
      coordMarks: nextMarks,
      count: Math.max(activeBlock.count, nextMarks.length),
    })
  }

  const removeCoordMark = (x: number, y: number) => {
    updatePage({
      coordMarks: (activeBlock.coordMarks ?? []).filter((mark) => !(mark.x === x && mark.y === y)),
    })
  }

  const placingOrigin = isComposer && coordTool === 'origin'

  return {
    coordTool,
    setCoordTool,
    placingOrigin,
    axesGrid,
    updateAxesGrid,
    placeOrigin,
    placeCoordMark,
    removeCoordMark,
  }
}
