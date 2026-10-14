import type { RefObject } from 'react'
import { FormesPalette } from '@/components/generator/FormesPalette'
import { WorksheetSheet } from '@/components/generator/WorksheetSheet'
import { isOralComprehensionExercise, isProblemExercise } from '@/components/generator/page-helpers'
import type { InstitutionalHeader } from '@/components/math/PrintDocumentChrome'
import type {
  CoordShape,
  ExerciseBlock,
  PreviewMode,
  WorksheetPage,
} from '@/math/types'
import type { TcfTypeReponse } from '@/tcf/types'

export type ResultPanelProps = {
  libreMode: boolean
  validateManual: () => void
  isTcf: boolean
  isTcmCfr: boolean
  isSoutienFr: boolean
  isAlphabetisation: boolean
  isSoutienMots: boolean
  isSoutienCompleter: boolean
  isSoutienEcouter: boolean
  soutienKind: string | undefined
  downloadActiveTcfAudios: () => void | Promise<void>
  downloadActiveTcmCfrAudios: () => void | Promise<void>
  downloadActiveSoutienCompleterAudio: () => void | Promise<void>
  downloadActiveSoutienEcouterAudio: () => void | Promise<void>
  downloadActiveSoutienMotsAudio: () => void | Promise<void>
  downloadActiveSoutienPhrases: () => void
  drawTcfTest: () => void
  drawSoutienSeries: () => void
  drawAlphaSeries: () => void
  generate: () => void
  printAll: () => void
  exportWord: () => void
  isCalliDomain: boolean
  isJeuxDomain: boolean
  jeuxPreviewSheets: Array<{ sheet: WorksheetPage; index: number }> | null
  previewFrameRef: RefObject<HTMLDivElement | null>
  seed: number
  previewWorksheets: WorksheetPage[]
  sheetProps: {
    mode: PreviewMode
    institutional: InstitutionalHeader
    evalMode: boolean
    documentTotalPoints: number
    pointsPerQuestion: number
    onRegenerateBlock: (targetBlock: number) => void
    showExerciseRefresh?: boolean
  }
  chromeProps: {
    institutional: InstitutionalHeader
    evalMode: boolean
    documentTotalPoints: number
    pointsPerQuestion: number
  }
  previewSheet: WorksheetPage | undefined
  safeSheetIndex: number
  pageExerciseBlocks: ExerciseBlock[]
  activeBlock: ExerciseBlock
  toggleDraftGrid: (itemIndex: number, targetBlock?: number) => void
  cycleOralAnswerMode: (itemIndex: number, targetBlock?: number) => void
  selectTcfForm: (itemIndex: number, form: TcfTypeReponse, targetBlock?: number) => void
  toggleTcfPageBreak: (itemIndex: number, targetBlock?: number) => void
  isFormes: boolean
  isCadrans: boolean
  isTransform: boolean
  isComposer: boolean
  coordTool: string
  selectedCoordShape: CoordShape | null
  setSelectedCoordShape: (kind: CoordShape | null) => void
  placeCoordMark: (x: number, y: number, kind: CoordShape) => void
  placeOrigin: (col: number, row: number) => void
  removeCoordMark: (x: number, y: number) => void
}

export function ResultPanel({
  libreMode,
  validateManual,
  isTcf,
  isTcmCfr,
  isSoutienFr,
  isAlphabetisation,
  isSoutienMots,
  isSoutienCompleter,
  isSoutienEcouter,
  soutienKind,
  downloadActiveTcfAudios,
  downloadActiveTcmCfrAudios,
  downloadActiveSoutienCompleterAudio,
  downloadActiveSoutienEcouterAudio,
  downloadActiveSoutienMotsAudio,
  downloadActiveSoutienPhrases,
  drawTcfTest,
  drawSoutienSeries,
  drawAlphaSeries,
  generate,
  printAll,
  exportWord,
  isCalliDomain,
  isJeuxDomain,
  jeuxPreviewSheets,
  previewFrameRef,
  seed,
  previewWorksheets,
  sheetProps,
  chromeProps,
  previewSheet,
  safeSheetIndex,
  pageExerciseBlocks,
  activeBlock,
  toggleDraftGrid,
  cycleOralAnswerMode,
  selectTcfForm,
  toggleTcfPageBreak,
  isFormes,
  isCadrans,
  isTransform,
  isComposer,
  coordTool,
  selectedCoordShape,
  setSelectedCoordShape,
  placeCoordMark,
  placeOrigin,
  removeCoordMark,
}: ResultPanelProps) {
  return (
          <section className="result-panel">
            <div className="result-head">
              <div>
                <p className="eyebrow">Aperçu</p>
                <h2>Votre activité est prête.</h2>
              </div>
              <div className="result-head-actions no-print">
                {!libreMode ? null : (
                  <button
                    className="print-chip is-icon is-validate"
                    type="button"
                    onClick={validateManual}
                    aria-label="Valider les changements"
                    title="Valider les changements"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
                      />
                    </svg>
                  </button>
                )}
                {isTcf ||
                isTcmCfr ||
                ((isSoutienFr || isAlphabetisation) &&
                  (isSoutienMots || isSoutienCompleter || isSoutienEcouter)) ? (
                  <button
                    className="print-chip is-icon is-generate"
                    type="button"
                    onClick={() =>
                      void (isTcf
                        ? downloadActiveTcfAudios()
                        : isTcmCfr
                          ? downloadActiveTcmCfrAudios()
                          : isSoutienCompleter
                            ? downloadActiveSoutienCompleterAudio()
                            : isSoutienEcouter
                              ? downloadActiveSoutienEcouterAudio()
                              : downloadActiveSoutienMotsAudio())
                    }
                    aria-label="Télécharger les audios de la fiche"
                    title={
                      isTcf
                        ? 'Télécharger les audios de la fiche'
                        : isTcmCfr
                          ? 'Télécharger les audios (nombres ou multiplications)'
                          : isSoutienCompleter
                            ? 'Télécharger l’audio (Écoutez et complétez + mots, 6 s)'
                            : isSoutienEcouter
                              ? soutienKind === 'syllabe-son' ||
                                soutienKind === 'syllabe-son-qr'
                                ? 'Télécharger l’audio (syllabe du son + Numéro + mots, 6 s)'
                                : soutienKind === 'lettres-phrase'
                                  ? 'Télécharger l’audio (phrases + Numéro, 6 s)'
                                  : 'Télécharger l’audio (consigne + Numéro + mots, 6 s)'
                              : 'Télécharger l’audio (consigne + mots, 6 s)'
                    }
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.42L11 13.59V4a1 1 0 0 1 1-1zM5 18a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z"
                      />
                    </svg>
                  </button>
                ) : null}
                {isSoutienFr &&
                (soutienKind === 'lettres-phrase' ||
                  soutienKind === 'determinants' ||
                  soutienKind === 'compter' ||
                  soutienKind === 'lire') ? (
                  <button
                    className="print-chip is-icon is-generate"
                    type="button"
                    onClick={downloadActiveSoutienPhrases}
                    aria-label="Télécharger les phrases (JSON)"
                    title={
                      soutienKind === 'lettres-phrase'
                        ? 'Télécharger les phrases type 9 (JSON à corriger)'
                        : soutienKind === 'determinants'
                          ? 'Télécharger les phrases type 10 (JSON à corriger)'
                          : soutienKind === 'compter'
                            ? 'Télécharger les phrases type 12 (JSON à corriger)'
                            : 'Télécharger les phrases type 14 (JSON à corriger)'
                    }
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 7V3.5L18.5 9H15zM8 13h8v2H8v-2zm0 4h8v2H8v-2z"
                      />
                    </svg>
                  </button>
                ) : null}
                {libreMode ? null : (
                  <button
                    className="print-chip is-icon is-generate"
                    type="button"
                    onClick={
                      isTcf
                        ? drawTcfTest
                        : isSoutienFr
                          ? drawSoutienSeries
                          : isAlphabetisation
                            ? drawAlphaSeries
                            : generate
                    }
                    aria-label={
                      isTcf
                        ? 'Tirer un test au hasard'
                        : isSoutienFr || isAlphabetisation
                          ? 'Préparer toutes les fiches du son'
                          : 'Générer'
                    }
                    title={
                      isTcf
                        ? 'Tirer un test au hasard'
                        : isSoutienFr || isAlphabetisation
                          ? 'Préparer toutes les fiches du son'
                          : 'Générer'
                    }
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                      />
                    </svg>
                  </button>
                )}
                <button
                  className="print-chip is-icon is-generate"
                  type="button"
                  onClick={exportWord}
                  aria-label={
                    isCalliDomain || isJeuxDomain
                      ? 'Exporter la fiche en Word'
                      : 'Exporter la fiche et le corrigé en Word'
                  }
                  title={
                    isCalliDomain || isJeuxDomain
                      ? 'Exporter la fiche en Word'
                      : 'Exporter la fiche et le corrigé en Word'
                  }
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 7V3.5L18.5 9H15zM8 12.5h8v1.5H8v-1.5zm0 3h8V17H8v-1.5zm0 3h5V20H8v-1.5z"
                    />
                  </svg>
                </button>
                <button
                  className="print-chip is-icon is-generate"
                  type="button"
                  onClick={printAll}
                  aria-label={
                    isCalliDomain || isJeuxDomain
                      ? 'Imprimer la fiche'
                      : 'Imprimer la fiche et le corrigé'
                  }
                  title={
                    isCalliDomain || isJeuxDomain
                      ? 'Imprimer la fiche'
                      : 'Imprimer la fiche et le corrigé'
                  }
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M18 3H6v4h12V3zm1 6H5a3 3 0 0 0-3 3v5h4v4h12v-4h4v-5a3 3 0 0 0-3-3zm-3 11H8v-5h8v5zm3-7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="sheet-preview-wrap no-print-nav">
              <div className="sheet-preview-cluster">
                <div className={`sheet-preview-row${jeuxPreviewSheets && jeuxPreviewSheets.length > 1 ? ' is-jeux-duplex' : ''}`}>
                  {jeuxPreviewSheets && jeuxPreviewSheets.length > 1 ? (
                    <div className="sheet-stage is-jeux-stack">
                      {jeuxPreviewSheets.map(({ sheet, index }, stackIdx) => (
                        <div
                          className="a4-frame"
                          key={`jeux-prev-${sheet.exerciseType}-${seed}-${index}`}
                          ref={stackIdx === 0 ? previewFrameRef : undefined}
                        >
                          <WorksheetSheet
                            page={sheet}
                            pageNumber={index + 1}
                            sheetIndex={index + 1}
                            total={previewWorksheets.length}
                            {...sheetProps}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                  <div className="sheet-stage">
                    <div className="a4-frame" ref={previewFrameRef}>
                      <WorksheetSheet
                        key={`${previewSheet?.exerciseType}-${seed}-${safeSheetIndex}-${pageExerciseBlocks.length}`}
                        page={previewSheet!}
                        pageNumber={safeSheetIndex + 1}
                        sheetIndex={safeSheetIndex + 1}
                        total={previewWorksheets.length}
                        interactiveDraftGrids={pageExerciseBlocks.some((b) =>
                          isProblemExercise(b.exerciseType),
                        )}
                        onToggleDraftGrid={toggleDraftGrid}
                        interactiveOralModes={isOralComprehensionExercise(activeBlock.exerciseType)}
                        onCycleOralAnswerMode={cycleOralAnswerMode}
                        interactiveTcfOptions={isTcf}
                        onSelectTcfForm={selectTcfForm}
                        onToggleTcfPageBreak={toggleTcfPageBreak}
                        coordEdit={
                          (isFormes && activeBlock.coordLibre) ||
                          (isCadrans && activeBlock.coordLibre) ||
                          (isTransform && activeBlock.coordLibre)
                            ? {
                                selectedKind: selectedCoordShape,
                                placingOrigin: isComposer && coordTool === 'origin',
                                onPlace: placeCoordMark,
                                onPlaceOrigin: placeOrigin,
                                onRemove: removeCoordMark,
                              }
                            : undefined
                        }
                        {...sheetProps}
                      />
                    </div>
                  </div>
                  )}
                  {isFormes && activeBlock.coordLibre ? (
                    <aside className="coord-page-palette no-print">
                      <b>Formes</b>
                      <FormesPalette
                        marks={activeBlock.coordMarks ?? []}
                        selectedKind={selectedCoordShape}
                        onSelect={setSelectedCoordShape}
                      />
                    </aside>
                  ) : null}
                </div>
              </div>
            </div>
            {/* Impression : fiches élèves ; corrigés seulement s’il y en a */}
            <div className="sheet-stage print-only-sheets" aria-hidden>
              {previewWorksheets.map((page, index) => (
                <WorksheetSheet
                  key={`print-student-${page.exerciseType}-${seed}-${index}`}
                  page={page}
                  pageNumber={index + 1}
                  sheetIndex={index + 1}
                  total={previewWorksheets.length}
                  {...chromeProps}
                  mode="student"
                />
              ))}
              {isCalliDomain || isJeuxDomain
                ? null
                : previewWorksheets.map((page, index) => (
                    <WorksheetSheet
                      key={`print-answers-${page.exerciseType}-${seed}-${index}`}
                      page={page}
                      pageNumber={index + 1}
                      sheetIndex={previewWorksheets.length + index + 1}
                      total={previewWorksheets.length}
                      {...chromeProps}
                      mode="answers"
                    />
                  ))}
            </div>
          </section>

  )
}
