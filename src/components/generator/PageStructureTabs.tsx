import { TabRemoveButton } from '@/components/generator/TabRemoveButton'
import { removePageBlock } from '@/math/page-model'
import type { Dispatch, SetStateAction } from 'react'
import type { ExerciseBlock, PageConfig, WorksheetPage } from '@/math/types'

export type PageStructureTabsProps = {
  worksheets: WorksheetPage[]
  pages: PageConfig[]
  safeSheetIndex: number
  setSheetIndex: Dispatch<SetStateAction<number>>
  setBlockIndex: Dispatch<SetStateAction<number>>
  setPages: Dispatch<SetStateAction<PageConfig[]>>
  pageIndex: number
  pageExerciseBlocks: ExerciseBlock[]
  safeBlockIndex: number
  activeSheet: WorksheetPage | undefined
  firstExerciseNo: number
  isTcmLike: boolean
  addPage: () => void
  addExerciseOnPage: () => void
  removePage: (configIdx: number) => void
}

export function PageStructureTabs({
  worksheets,
  pages,
  safeSheetIndex,
  setSheetIndex,
  setBlockIndex,
  setPages,
  pageIndex,
  pageExerciseBlocks,
  safeBlockIndex,
  activeSheet,
  firstExerciseNo,
  isTcmLike,
  addPage,
  addExerciseOnPage,
  removePage,
}: PageStructureTabsProps) {
  return (
    <>
            <div className="panel-title">
              <h3>Paramètres de l’activité</h3>
            </div>
            <div className="mode-toggle is-tabs page-tabs" role="tablist" aria-label="Feuilles">
              {worksheets.map((sheet, index) => {
                const sideLabel = sheet.title?.includes('—')
                  ? sheet.title.split('—').pop()?.trim()
                  : undefined
                const tabLabel =
                  sheet.domain === 'jeux' && sideLabel
                    ? sideLabel
                    : sheet.isContinuation
                      ? 'suite'
                      : String(index + 1)
                return (
                <button
                  key={`${sheet.configIndex ?? index}-${sheet.isContinuation ? 'suite' : 'main'}-${index}`}
                  type="button"
                  className={safeSheetIndex === index ? 'active' : ''}
                  onClick={() => {
                    setSheetIndex(index)
                    setBlockIndex(0)
                  }}
                  aria-label={
                    sheet.domain === 'jeux' && sideLabel
                      ? sideLabel
                      : sheet.isContinuation
                        ? `Page ${index + 1} (suite)`
                        : `Page ${index + 1}`
                  }
                >
                  <span className="tab-number">{tabLabel}</span>
                  {!isTcmLike &&
                  pages.length > 1 &&
                  !sheet.isContinuation &&
                  (sheet.configIndex ?? index) === pageIndex &&
                  safeSheetIndex === index ? (
                    <TabRemoveButton
                      label="Retirer cette page"
                      onRemove={() => removePage(sheet.configIndex ?? index)}
                    />
                  ) : null}
                </button>
                )
              })}
            </div>
            {isTcmLike ? null : (
              <div className="page-structure-actions">
                <button className="button secondary" type="button" onClick={addPage}>
                  + Page
                </button>
                <button className="button secondary" type="button" onClick={addExerciseOnPage}>
                  + Exercice
                </button>
              </div>
            )}
            {pageExerciseBlocks.length > 1 ? (
              <div className="mode-toggle is-tabs page-tabs exercise-tabs" role="tablist" aria-label="Exercices de la page">
                {pageExerciseBlocks.map((_, index) => {
                  const tabNo =
                    activeSheet?.blocks?.[index]?.exerciseIndex ?? firstExerciseNo + index
                  return (
                  <button
                    key={index}
                    type="button"
                    className={safeBlockIndex === index ? 'active' : ''}
                    onClick={() => setBlockIndex(index)}
                    aria-label={`Exercice ${tabNo}`}
                  >
                    <span className="tab-number">{tabNo}</span>
                    {!isTcmLike && pageExerciseBlocks.length > 1 && index === safeBlockIndex ? (
                      <TabRemoveButton
                        label="Retirer cet exercice"
                        onRemove={() => {
                          setPages((current) =>
                            current.map((page, pageIdx) =>
                              pageIdx === pageIndex ? removePageBlock(page, index) : page,
                            ),
                          )
                          setBlockIndex(Math.max(0, index - 1))
                        }}
                      />
                    ) : null}
                  </button>
                  )
                })}
              </div>
            ) : null}

    </>
  )
}
