import { useEffect, useState, type RefObject } from 'react'
import type { InstitutionalHeader } from '@/components/math/PrintDocumentChrome'
import type { ExerciseBlock, PreviewMode, WorksheetPage } from '@/math/types'

type OverflowDeps = {
  previewFrameRef: RefObject<HTMLDivElement | null>
  previewWorksheets: WorksheetPage[]
  pageIndex: number
  sheetIndex: number
  mode: PreviewMode
  seed: number
  activeBlock: ExerciseBlock
  extraBlocks: ExerciseBlock[] | undefined
  evalMode: boolean
  institutional: InstitutionalHeader
}

/**
 * Observe la fiche A4 et signale si le contenu déborde
 * (grille, corps, pied chevauché).
 */
export function useQuestionsOverflow({
  previewFrameRef,
  previewWorksheets,
  pageIndex,
  sheetIndex,
  mode,
  seed,
  activeBlock,
  extraBlocks,
  evalMode,
  institutional,
}: OverflowDeps): boolean {
  const [questionsOverflow, setQuestionsOverflow] = useState(false)

  useEffect(() => {
    const frame = previewFrameRef.current
    if (!frame) return

    const measure = () => {
      const sheet = frame.querySelector('.worksheet-sheet') as HTMLElement | null
      const body = frame.querySelector('.sheet-body') as HTMLElement | null
      const grid = frame.querySelector('.exercise-grid') as HTMLElement | null
      const footer = frame.querySelector('.doc-footer') as HTMLElement | null
      if (!sheet || !body || !grid) {
        setQuestionsOverflow(false)
        return
      }

      // Hauteur naturelle du contenu (sans compression) vs place disponible sous l'en-tête.
      const contentHeight = Math.max(grid.scrollHeight, grid.offsetHeight)
      const bodyLimit = body.clientHeight
      const sheetOverflow = sheet.scrollHeight > sheet.clientHeight + 2
      const bodyOverflow = body.scrollHeight > body.clientHeight + 2
      const gridOverflow = contentHeight > bodyLimit + 2

      // Pied chevauché / poussé hors feuille si le corps déborde.
      let footerClash = false
      if (footer) {
        const sheetBox = sheet.getBoundingClientRect()
        const footerBox = footer.getBoundingClientRect()
        footerClash = footerBox.bottom > sheetBox.bottom + 1
      }

      setQuestionsOverflow(sheetOverflow || bodyOverflow || gridOverflow || footerClash)
    }

    measure()
    const raf = requestAnimationFrame(measure)
    const observer = new ResizeObserver(measure)
    const sheet = frame.querySelector('.worksheet-sheet')
    const body = frame.querySelector('.sheet-body')
    const grid = frame.querySelector('.exercise-grid')
    if (sheet) observer.observe(sheet)
    if (body) observer.observe(body)
    if (grid) observer.observe(grid)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [
    previewFrameRef,
    previewWorksheets,
    pageIndex,
    sheetIndex,
    mode,
    seed,
    activeBlock.count,
    activeBlock.columns,
    activeBlock.exerciseType,
    activeBlock.coordLibre,
    activeBlock.coordCols,
    activeBlock.coordRows,
    activeBlock.coordAxis,
    activeBlock.coordRange,
    activeBlock.coordCellMm,
    activeBlock.coordUnitSquares,
    activeBlock.coordOriginCol,
    activeBlock.coordOriginRow,
    activeBlock.coordMarks,
    extraBlocks,
    evalMode,
    institutional,
  ])

  return questionsOverflow
}
