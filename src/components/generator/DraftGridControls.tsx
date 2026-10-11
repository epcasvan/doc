import { isDraftPadExercise } from '@/math/catalog'
import { isProblemExercise, resizeDraftGrids } from '@/components/generator/page-helpers'
import { pageBlocks } from '@/math/page-model'
import { isTcmDomain } from '@/tcm/test'
import { isTcmCfrDomain } from '@/tcm-cfr/test'
import type { ExerciseBlock, PageConfig } from '@/math/types'

export type DraftGridControlsProps = {
  isTcmLike: boolean
  pages: PageConfig[]
  pageExerciseBlocks: ExerciseBlock[]
  activeBlock: ExerciseBlock
  setAllTcmDraftGrids: (value: boolean) => void
  setAllDraftGrids: (value: boolean) => void
}

export function DraftGridControls({
  isTcmLike,
  pages,
  pageExerciseBlocks,
  activeBlock,
  setAllTcmDraftGrids,
  setAllDraftGrids,
}: DraftGridControlsProps) {
  return (
    <>
              {isTcmLike ? (
                <div className="mode-toggle-block">
                  <b>Grilles de calcul</b>
                  <div className="mode-toggle" role="group" aria-label="Grilles de calcul de toute la fiche">
                    {(() => {
                      const draftBlocks = pages.flatMap((page) =>
                        (isTcmDomain(page.domain) || isTcmCfrDomain(page.domain))
                          ? pageBlocks(page).filter((b) => isDraftPadExercise(b.exerciseType))
                          : [],
                      )
                      const allOn =
                        draftBlocks.length > 0 &&
                        draftBlocks.every((b) =>
                          resizeDraftGrids(b.problemDraftGrids, b.count).every(Boolean),
                        )
                      const allOff =
                        draftBlocks.length > 0 &&
                        draftBlocks.every((b) =>
                          resizeDraftGrids(b.problemDraftGrids, b.count).every((v) => !v),
                        )
                      return (
                        <>
                          <button
                            type="button"
                            className={allOn ? 'active' : ''}
                            onClick={() => setAllTcmDraftGrids(true)}
                          >
                            Afficher
                          </button>
                          <button
                            type="button"
                            className={allOff ? 'active' : ''}
                            onClick={() => setAllTcmDraftGrids(false)}
                          >
                            Masquer
                          </button>
                        </>
                      )
                    })()}
                  </div>
                  <small className="muted">Toutes les grilles de toutes les pages.</small>
                </div>
              ) : pageExerciseBlocks.some((b) => isProblemExercise(b.exerciseType)) ? (
                <div className="mode-toggle draft-grid-page-toggle" role="group" aria-label="Grille de brouillon">
                  {(() => {
                    const grids = resizeDraftGrids(activeBlock.problemDraftGrids, activeBlock.count)
                    const allOn = grids.every(Boolean)
                    const allOff = grids.every((v) => !v)
                    return (
                      <>
                        <button
                          type="button"
                          className={allOn ? 'active' : ''}
                          onClick={() => setAllDraftGrids(true)}
                        >
                          Grille 4×4
                        </button>
                        <button
                          type="button"
                          className={allOff ? 'active' : ''}
                          onClick={() => setAllDraftGrids(false)}
                        >
                          Cadre seul
                        </button>
                      </>
                    )
                  })()}
                </div>
              ) : null}

    </>
  )
}
