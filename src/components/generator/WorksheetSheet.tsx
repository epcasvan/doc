import { type CSSProperties, type ReactNode } from 'react'
import { ItemView, tokenizeAlgebra } from '@/components/ItemView'
import {
  DocumentFooter,
  InstitutionalDocumentHeader,
  SheetBody,
  type InstitutionalHeader,
} from '@/components/math/PrintDocumentChrome'
import { isDraftPadExercise } from '@/math/catalog'
import { TCF_DOMAIN } from '@/tcf/catalog'
import { blockPointsTotal, formatPointsLabel, isTcmDomain } from '@/tcm/test'
import { isTcmCfrDomain } from '@/tcm-cfr/test'
import { isReperageConstruire } from '@/math/coord-reperage'
import type {
  CoordReply,
  CoordShape,
  PreviewMode,
  WorksheetBlock,
  WorksheetPage,
} from '@/math/types'
import type { TcfTypeReponse } from '@/tcf/types'

export function defaultCoordQuestionReply(exerciseType: string): CoordReply {
  return isReperageConstruire(exerciseType) ? 'draw' : 'text'
}

export function fallbackBlocks(page: WorksheetPage): WorksheetBlock[] {
  return [
    {
      exerciseIndex: 1,
      title: 'Exercice 1',
      instruction: page.instruction,
      items: page.items,
      columns: page.columns,
      exerciseType: page.exerciseType,
      givens: page.givens,
      problemDraftGrids: page.problemDraftGrids,
      oralAnswerModes: page.oralAnswerModes,
    },
  ]
}

/** Consigne type 10 : l’ / le / la / les en gras + couleur thème. */
export function renderSoutienInstruction(text: string): ReactNode {
  const marker = 'Complétez avec les déterminants '
  if (!text.startsWith(marker)) return text
  return (
    <>
      {marker}
      <span className="det-choice">l’</span>, <span className="det-choice">le</span>,{' '}
      <span className="det-choice">la</span> ou <span className="det-choice">les</span>.
    </>
  )
}

export function RefreshIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M13.5 2.5a.75.75 0 0 0-1.5 0v1.2A5.5 5.5 0 1 0 13.4 10a.75.75 0 1 0-1.3-.75 4 4 0 1 1-1.05-3.7H9.25a.75.75 0 0 0 0 1.5h3.5A.75.75 0 0 0 13.5 6V2.5Z"
      />
    </svg>
  )
}

export function WorksheetSheet({
  page,
  mode,
  institutional,
  evalMode,
  pageNumber,
  total,
  sheetIndex,
  documentTotalPoints,
  pointsPerQuestion = 1,
  interactiveDraftGrids = false,
  onToggleDraftGrid,
  interactiveOralModes = false,
  onCycleOralAnswerMode,
  interactiveTcfOptions = false,
  onSelectTcfForm,
  onToggleTcfPageBreak,
  onRegenerateBlock,
  showExerciseRefresh = true,
  coordEdit,
}: {
  page: WorksheetPage
  mode: PreviewMode
  institutional: InstitutionalHeader
  evalMode: boolean
  pageNumber: number
  total: number
  /** Rang physique dans la pile imprimée (1 = première feuille). Sert aux marges miroir. */
  sheetIndex: number
  /** Total de points de toute la fiche (toutes les pages). */
  documentTotalPoints: number
  pointsPerQuestion?: number
  /** Affiche le bouton grille / sans grille sur chaque problème (aperçu seulement). */
  interactiveDraftGrids?: boolean
  onToggleDraftGrid?: (index: number, blockIndex?: number) => void
  /** Pastille QCM / texte / images pour la compréhension orale. */
  interactiveOralModes?: boolean
  onCycleOralAnswerMode?: (index: number, blockIndex?: number) => void
  /** TCF : formes Texte/Image/Phrase + saut de page en marge. */
  interactiveTcfOptions?: boolean
  onSelectTcfForm?: (index: number, form: TcfTypeReponse, blockIndex?: number) => void
  onToggleTcfPageBreak?: (index: number, blockIndex?: number) => void
  /** Bouton refresh : régénère uniquement cet exercice. */
  onRegenerateBlock?: (blockIndex: number) => void
  /** Afficher le refresh à côté du titre (désactivé en mode libre). */
  showExerciseRefresh?: boolean
  coordEdit?: {
    selectedKind: CoordShape | null
    placingOrigin?: boolean
    onPlace: (x: number, y: number, kind: CoordShape) => void
    onPlaceOrigin?: (col: number, row: number) => void
    onRemove: (x: number, y: number) => void
  }
}) {
  const sheetTitle = institutional.documentTitle.trim()
  const isJeuxSheet = page.domain === 'jeux'
  const multiExercisePage =
    (page.blocks?.length ?? 0) > 1 ||
    isTcmDomain(page.domain) ||
    isTcmCfrDomain(page.domain) ||
    page.domain === TCF_DOMAIN ||
    page.domain === 'soutien-fr' ||
    page.domain === 'alphabetisation'
  const showHeader = pageNumber === 1 && !isJeuxSheet
  const parity = sheetIndex % 2 === 1 ? 'sheet-odd' : 'sheet-even'
  const isDraftPadPage = page.items.some(
    (item) =>
      item.layout === 'equation' ||
      item.layout === 'algebra' ||
      (item.layout === 'geo' && Boolean(item.calcAnswer || item.responseAnswer)) ||
      (item.layout === 'text' && Boolean(item.calcAnswer || item.responseAnswer)),
  )
  /** Soutien FR : Colonnes = grille interne ; la feuille A4 reste 1 colonne. */
  const sheetColumns = page.items.some((item) =>
    [
      'vocab-table',
      'letter-grid',
      'syllable-table',
      'vocab-match',
      'syllable-complete',
      'listen-check',
      'syllable-sound',
      'syllable-pronounce',
      'mark-letter',
      'phrase-scramble',
      'determinant-fill',
      'dictee-grid',
      'count-sound',
      'read-phrases',
      'audio-match',
      'audio-order',
      'word-search',
    ].includes(item.layout),
  )
    ? 1
    : page.columns
  const isSoutienFr = page.domain === 'soutien-fr'
  const isAlphabetisation = page.domain === 'alphabetisation'
  return (
    <article
      className={`worksheet-sheet ${parity}${isJeuxSheet ? ' is-jeux' : ''}${isSoutienFr ? ' is-soutien-fr' : ''}${isAlphabetisation ? ' is-alphabetisation' : ''}${evalMode ? ' is-eval' : ''}`}
      style={{ '--sheet-columns': sheetColumns } as CSSProperties}
    >
      {showHeader ? (
        <InstitutionalDocumentHeader
          config={institutional}
          evalMode={evalMode}
          totalPoints={evalMode ? documentTotalPoints : undefined}
          fallbackTitle={page.title}
        />
      ) : null}
      <SheetBody>
        {(page.blocks.length > 0 ? page.blocks : fallbackBlocks(page)).map((block, blockIndex) => {
          const algebraItems = block.items.filter((item) => item.layout === 'algebra')
          const maxTokens =
            algebraItems.length > 0
              ? Math.max(...algebraItems.map((item) => tokenizeAlgebra(item.prompt ?? '').length))
              : 0
          const blockDraft = block.items.some(
            (item) =>
              item.layout === 'equation' ||
              item.layout === 'algebra' ||
              (item.layout === 'geo' && Boolean(item.calcAnswer || item.responseAnswer)) ||
              (item.layout === 'text' && Boolean(item.calcAnswer || item.responseAnswer)),
          )
          const blockHeading = multiExercisePage ? block.title : sheetTitle || block.title
          const perQ = block.pointsPerQuestion ?? pointsPerQuestion
          const blockPts = blockPointsTotal(block.items, perQ)
          const pointsBadge = formatPointsLabel(blockPts)
          return (
            <section className="exercise-block" key={`${block.exerciseType}-${block.exerciseIndex}`}>
              {isJeuxSheet ? null : (
              <header className="exercise-heading">
                <div className="exercise-heading-main">
                  <div className="exercise-heading-title-row">
                    <h3>{blockHeading}</h3>
                    {onRegenerateBlock && showExerciseRefresh ? (
                      <button
                        type="button"
                        className="no-print exercise-refresh-btn"
                        aria-label="Régénérer cet exercice"
                        title="Régénérer cet exercice"
                        onClick={() => onRegenerateBlock(blockIndex)}
                      >
                        <RefreshIcon />
                      </button>
                    ) : null}
                  </div>
                  {block.instruction ? <p>{renderSoutienInstruction(block.instruction)}</p> : null}
                  {block.givens && block.givens.length > 0 ? (
                    <p className="sheet-givens" aria-label="Valeurs des variables">
                      {block.givens.map((given, index) => (
                        <span key={given.letter}>
                          {index > 0 ? <span className="given-sep"> · </span> : null}
                          <span className="given-letter">{given.letter}</span>
                          {' = '}
                          <span className="given-value">{String(given.value).replace('.', ',')}</span>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
                {evalMode && blockPts > 0 ? (
                  <span className="instruction-points">{pointsBadge}</span>
                ) : null}
              </header>
              )}
              {block.document ? (
                <div className={`exercise-document is-${block.document.kind}`}>
                  {block.document.title ? <p className="exercise-document-title">{block.document.title}</p> : null}
                  {block.document.audioSrc ? (
                    <audio className="oral-audio" controls preload="none" src={block.document.audioSrc}>
                      Écoutez l’enregistrement.
                    </audio>
                  ) : null}
                  {block.document.kind === 'written' || mode === 'answers' ? (
                    <p className="exercise-document-text">{block.document.text}</p>
                  ) : (
                    <p className="exercise-document-listen">Écoutez le dialogue. La transcription figure au corrigé.</p>
                  )}
                </div>
              ) : null}
              <div
                className={`exercise-grid${
                  block.items.every((item) => item.layout === 'algebra')
                    ? ' algebra-grid'
                    : block.items.every((item) => item.layout === 'theory')
                      ? ' theory-grid'
                      : blockDraft || isDraftPadPage
                        ? ' problem-grid'
                        : ''
                }`}
                style={
                  {
                    /* Soutien FR : Colonnes = grille interne ; la feuille reste 1 col. */
                    '--sheet-columns': block.items.some((item) =>
                      [
                        'vocab-table',
                        'letter-grid',
                        'syllable-table',
                        'vocab-match',
                        'syllable-complete',
                        'listen-check',
                        'syllable-sound',
      'syllable-pronounce',
      'mark-letter',
                        'phrase-scramble',
                        'determinant-fill',
                        'dictee-grid',
                        'count-sound',
                        'read-phrases',
                        'audio-match',
                        'audio-order',
                        'word-search',
                      ].includes(item.layout),
                    )
                      ? 1
                      : block.columns,
                  } as CSSProperties
                }
              >
                {block.items.map((item, index) => {
                  const padLeft =
                    item.layout === 'algebra' ? Math.max(0, maxTokens - tokenizeAlgebra(item.prompt ?? '').length) : 0
                  const draftGrid = block.problemDraftGrids?.[index] ?? page.problemDraftGrids?.[index] ?? true
                  const oralAnswerMode =
                    block.oralAnswerModes?.[index] ?? page.oralAnswerModes?.[index] ?? item.answerMode ?? 'qcm'
                  const sourceIndex = index + (block.itemOffset ?? 0)
                  const tcfFormMode =
                    block.tcfFormModes?.[sourceIndex] ?? page.tcfFormModes?.[sourceIndex]
                  const tcfPageBreakAfter =
                    block.tcfPageBreakAfter?.[sourceIndex] ?? page.tcfPageBreakAfter?.[sourceIndex]
                  const blockAllowsDraftGrid = isDraftPadExercise(block.exerciseType)
                  const isTcfQuestion =
                    item.layout === 'tcf' &&
                    (item.tcf?.kind === 'qcm' || item.tcf?.kind === 'lignes')
                  return (
                    <ItemView
                      key={`${block.exerciseType}-${block.exerciseIndex}-${index}-${item.answer}-${tcfFormMode ?? ''}`}
                      item={item}
                      mode={mode}
                      index={index}
                      algebraPadLeft={padLeft}
                      draftGrid={draftGrid}
                      onToggleDraftGrid={
                        interactiveDraftGrids && blockAllowsDraftGrid && onToggleDraftGrid
                          ? () => onToggleDraftGrid(index, blockIndex)
                          : undefined
                      }
                      oralAnswerMode={item.selectVariant === 'oral' ? oralAnswerMode : undefined}
                      onCycleOralAnswerMode={
                        interactiveOralModes && onCycleOralAnswerMode && item.selectVariant === 'oral'
                          ? () => onCycleOralAnswerMode(index, blockIndex)
                          : undefined
                      }
                      tcfFormMode={isTcfQuestion ? tcfFormMode : undefined}
                      onSelectTcfForm={
                        interactiveTcfOptions && isTcfQuestion && onSelectTcfForm
                          ? (form) => onSelectTcfForm(index, form, blockIndex)
                          : undefined
                      }
                      tcfPageBreakAfter={isTcfQuestion ? Boolean(tcfPageBreakAfter) : undefined}
                      onToggleTcfPageBreak={
                        interactiveTcfOptions && isTcfQuestion && onToggleTcfPageBreak
                          ? () => onToggleTcfPageBreak(index, blockIndex)
                          : undefined
                      }
                      coordEdit={coordEdit}
                    />
                  )
                })}
              </div>
            </section>
          )
        })}
      </SheetBody>
      {isJeuxSheet ? null : (
        <DocumentFooter
          pageNumber={pageNumber}
          total={total}
          reference={institutional.reference}
        />
      )}
    </article>
  )
}
