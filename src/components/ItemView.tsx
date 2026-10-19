import type { CoordShape, MathItem, PreviewMode } from '@/math/types'
import type { GlossaryFigureId } from '@/math/glossary-banks'
import type { TcfTypeReponse } from '@/tcf/types'
import { TcfFormMarginIcons } from '@/components/tcf/TcfFormIcons'
import { CardGrid } from '@/jeux/CardGrid'
import type { GameBoard } from '@/jeux/types'
import { CalligraphyView } from './math/CalligraphyView'
import { GattegnoChart } from './math/GattegnoChart'
import { GlossaryFigure } from './math/GlossaryFigure'
import { TcfItemView } from './tcf/TcfItemView'
import { AlgebraRow } from './item-view/algebra'
import { ColumnOp, DivisionColumn } from './item-view/columns'
import { DecomposeBlock } from './item-view/decompose'
import { OpTableBlock } from './item-view/op-table'
import { CompareRow, EncadrementRow, OrderRow, SequenceRow } from './item-view/compare'
import { CoordBlock, GeoBlock } from './item-view/geo-coord'
import {
  AudioDictationBlock,
  MetroMapBlock,
  SegmentMeasureBlock,
  SymmetryGridBlock,
} from './item-view/tcm-cfr'
import {
  ConvertRow,
  FractionShapeBlock,
  InlinePrompt,
  PlaceValueRow,
  ProblemBlock,
  SelectPillsRow,
  StackedPrompt,
  TheoryBlockView,
  EquationBlock,
} from './item-view/problems'
import {
  PhraseBuildBlock,
  PhraseColorBlock,
  PhraseOrderBlock,
  PhraseWriteBlock,
} from './item-view/phrase'
import {
  AudioOrderBlock,
  MarkLetterBlock,
  SyllablePronounceBlock,
  CountIconsBlock,
  CountSoundBlock,
  DeterminantFillBlock,
  DicteeGridBlock,
  ListenCheckBlock,
  PhraseScrambleBlock,
  ReadPhrasesBlock,
  SyllableCompleteBlock,
  SyllableSoundBlock,
} from './item-view/soutien'
import {
  AudioMatchBlock,
  LetterGridRow,
  SyllableTableBlock,
  VocabMatch,
  VocabTable,
  VocabWrite,
  WordSearchBlock,
} from './item-view/vocab'

export type { AlgebraFracToken, AlgebraTokenPart } from './item-view/algebra'
export { AlgebraRow, tokenizeAlgebra } from './item-view/algebra'

export function ItemView({
  item,
  mode,
  index,
  algebraPadLeft = 0,
  draftGrid = true,
  onToggleDraftGrid,
  oralAnswerMode,
  onCycleOralAnswerMode,
  tcfFormMode,
  onSelectTcfForm,
  tcfPageBreakBefore,
  onToggleTcfPageBreak,
  coordEdit,
}: {
  item: MathItem
  mode: PreviewMode
  index: number
  /** Cases vides à gauche pour aligner verticalement les atomes entre questions. */
  algebraPadLeft?: number
  /** Zone de brouillon avec grille 4×4 mm (problèmes). */
  draftGrid?: boolean
  onToggleDraftGrid?: () => void
  oralAnswerMode?: 'qcm' | 'text' | 'images'
  onCycleOralAnswerMode?: () => void
  /** TCF : forme active Texte / Image / Phrase. */
  tcfFormMode?: TcfTypeReponse
  onSelectTcfForm?: (form: TcfTypeReponse) => void
  /** TCF : cette question (et les suivantes) commence une nouvelle page. */
  tcfPageBreakBefore?: boolean
  onToggleTcfPageBreak?: () => void
  coordEdit?: {
    selectedKind: CoordShape | null
    placingOrigin?: boolean
    onPlace: (x: number, y: number, kind: CoordShape) => void
    onPlaceOrigin?: (col: number, row: number) => void
    onRemove: (x: number, y: number) => void
  }
}) {
  const isProblem = item.layout === 'text' && Boolean(item.calcAnswer || item.responseAnswer)
  const isEquation = item.layout === 'equation'
  const isGeoCalc = item.layout === 'geo' && Boolean(item.calcAnswer || item.responseAnswer)
  const isAlgebraDraft = item.layout === 'algebra'
  /** Inline (ex. substitution) : brouillon seulement si le chip grille est branché. */
  const isInlineDraft = item.layout === 'inline' && Boolean(onToggleDraftGrid)
  const isDraftPad = isProblem || isEquation || isGeoCalc || isAlgebraDraft || isInlineDraft
  const isStackedText = item.layout === 'text' && !isProblem
  const isOralSelect = item.layout === 'select' && item.selectVariant === 'oral'
  const resolvedOralMode = oralAnswerMode ?? item.answerMode ?? 'qcm'
  const oralItem = isOralSelect ? { ...item, answerMode: resolvedOralMode } : item
  const oralModeLabel =
    resolvedOralMode === 'text' ? 'Texte' : resolvedOralMode === 'images' ? 'Images' : 'QCM'
  const tcfFormSelect =
    item.layout === 'tcf' && (item.tcf?.kind === 'qcm' || item.tcf?.kind === 'lignes')
      ? item.tcf.formSelect
      : undefined
  const tcfActiveForm = tcfFormMode ?? tcfFormSelect?.active
  /** Comme Page : toujours en marge dès que la question a un sélecteur de forme. */
  const showTcfFormIcons = Boolean(tcfFormSelect && onSelectTcfForm && tcfActiveForm)
  const showTcfPageChip = Boolean(
    onToggleTcfPageBreak &&
      item.layout === 'tcf' &&
      (item.tcf?.kind === 'qcm' || item.tcf?.kind === 'lignes'),
  )
  const hideNumber =
    Boolean(item.hideItemNumber) ||
    item.layout === 'gattegno-chart' ||
    item.layout === 'phrase-write' ||
    item.layout === 'vocab-table' ||
    item.layout === 'vocab-match' ||
    item.layout === 'letter-grid' ||
    item.layout === 'syllable-complete' ||
    item.layout === 'syllable-table' ||
    item.layout === 'listen-check' ||
    item.layout === 'syllable-sound' ||
    item.layout === 'syllable-pronounce' ||
    item.layout === 'mark-letter' ||
    item.layout === 'phrase-scramble' ||
    item.layout === 'determinant-fill' ||
    item.layout === 'dictee-grid' ||
    item.layout === 'count-sound' ||
    item.layout === 'read-phrases' ||
    item.layout === 'audio-match' ||
    item.layout === 'audio-order' ||
    item.layout === 'word-search' ||
    item.layout === 'theory' ||
    item.layout === 'glossary' ||
    item.layout === 'card-grid' ||
    item.layout === 'calligraphy' ||
    item.layout === 'tcf' ||
    item.layout === 'metro-map' ||
    item.layout === 'symmetry-grid' ||
    item.layout === 'segment-measure' ||
    item.layout === 'audio-dictation'
  return (
    <div
      className={`exercise-item layout-${item.layout}${isDraftPad ? ' is-problem' : ''}${
        isOralSelect ? ' is-oral' : ''
      }`}
    >
      {isDraftPad && onToggleDraftGrid ? (
        <button
          type="button"
          className={`no-print draft-grid-chip draft-grid-chip-margin ${draftGrid ? 'on' : 'off'}`}
          onClick={onToggleDraftGrid}
          aria-pressed={draftGrid}
        >
          {draftGrid ? 'Grille' : 'Sans'}
        </button>
      ) : null}
      {isOralSelect && onCycleOralAnswerMode ? (
        <button
          type="button"
          className={`no-print draft-grid-chip draft-grid-chip-margin oral-mode-chip ${
            resolvedOralMode === 'qcm' ? 'on' : 'off'
          }`}
          onClick={onCycleOralAnswerMode}
          aria-label={`Mode de réponse : ${oralModeLabel}. Cliquer pour changer.`}
          title={
            item.imagesAvailable
              ? 'QCM → texte libre → images'
              : 'QCM → texte libre (images indisponibles pour cette question)'
          }
        >
          {oralModeLabel}
        </button>
      ) : null}
      {showTcfFormIcons && tcfFormSelect && tcfActiveForm && onSelectTcfForm ? (
        <TcfFormMarginIcons
          filled={tcfFormSelect.filled}
          active={tcfActiveForm}
          onSelect={onSelectTcfForm}
        />
      ) : null}
      {showTcfPageChip ? (
        <button
          type="button"
          className={`no-print draft-grid-chip draft-grid-chip-margin tcf-page-chip ${
            tcfPageBreakBefore ? 'on' : 'off'
          }`}
          aria-pressed={Boolean(tcfPageBreakBefore)}
          title={
            tcfPageBreakBefore
              ? 'Remettre cette question et les suivantes sur la page précédente'
              : 'Passer cette question et les suivantes sur une nouvelle page'
          }
          onClick={onToggleTcfPageBreak}
        >
          Page
        </button>
      ) : null}
      {item.coordScene || hideNumber ? null : <div className="item-number">{index + 1}.</div>}
      <div className="item-content">
        {(item.layout === 'column' || item.layout === 'column-empty') && <ColumnOp item={item} mode={mode} />}
        {item.layout === 'division-column' && <DivisionColumn item={item} mode={mode} />}
        {item.layout === 'op-table' && <OpTableBlock item={item} mode={mode} />}
        {item.layout === 'decompose' && <DecomposeBlock item={item} mode={mode} />}
        {item.layout === 'compare' && <CompareRow item={item} mode={mode} />}
        {item.layout === 'encadrement' && <EncadrementRow item={item} mode={mode} />}
        {item.layout === 'select' && <SelectPillsRow item={oralItem} mode={mode} />}
        {item.layout === 'theory' && <TheoryBlockView item={item} />}
        {item.layout === 'glossary' && item.glossary ? (
          <div className="glossary-card">
            <div className="glossary-figure-wrap">
              <GlossaryFigure id={item.glossary.figure as GlossaryFigureId} />
            </div>
            <div className="glossary-text">
              <p className="glossary-term">{item.glossary.term}</p>
              <p className="glossary-definition">{item.glossary.definition}</p>
            </div>
          </div>
        ) : null}
        {item.layout === 'letter-grid' && <LetterGridRow item={item} mode={mode} />}
        {item.layout === 'syllable-table' && <SyllableTableBlock item={item} />}
        {item.layout === 'order' && <OrderRow item={item} mode={mode} />}
        {item.layout === 'sequence' && <SequenceRow item={item} mode={mode} />}
        {item.layout === 'fraction-shape' && <FractionShapeBlock item={item} mode={mode} />}
        {item.layout === 'geo' && <GeoBlock item={item} mode={mode} draftGrid={draftGrid} />}
        {item.layout === 'coord' && <CoordBlock item={item} mode={mode} coordEdit={coordEdit} />}
        {item.layout === 'algebra' && (
          <AlgebraRow item={item} mode={mode} padLeft={algebraPadLeft} draftGrid={draftGrid} />
        )}
        {item.layout === 'equation' && <EquationBlock item={item} mode={mode} draftGrid={draftGrid} />}
        {item.layout === 'place-value' && <PlaceValueRow item={item} mode={mode} />}
        {item.layout === 'phrase-color' && <PhraseColorBlock item={item} mode={mode} />}
        {item.layout === 'phrase-order' && <PhraseOrderBlock item={item} mode={mode} />}
        {item.layout === 'phrase-build' && <PhraseBuildBlock item={item} mode={mode} />}
        {item.layout === 'phrase-write' && <PhraseWriteBlock item={item} mode={mode} />}
        {item.layout === 'gattegno-chart' && <GattegnoChart mode={item.chartMode ?? 'labels'} />}
        {item.layout === 'vocab-table' && <VocabTable item={item} />}
        {item.layout === 'vocab-match' && <VocabMatch item={item} mode={mode} />}
        {item.layout === 'vocab-write' && <VocabWrite item={item} mode={mode} />}
        {item.layout === 'syllable-complete' && (
          <SyllableCompleteBlock item={item} mode={mode} />
        )}
        {item.layout === 'listen-check' && <ListenCheckBlock item={item} mode={mode} />}
        {item.layout === 'syllable-sound' && (
          <SyllableSoundBlock item={item} mode={mode} />
        )}
        {item.layout === 'mark-letter' && <MarkLetterBlock item={item} mode={mode} />}
        {item.layout === 'syllable-pronounce' && (
          <SyllablePronounceBlock item={item} />
        )}
        {item.layout === 'phrase-scramble' && (
          <PhraseScrambleBlock item={item} mode={mode} />
        )}
        {item.layout === 'determinant-fill' && (
          <DeterminantFillBlock item={item} mode={mode} />
        )}
        {item.layout === 'dictee-grid' && (
          <DicteeGridBlock item={item} mode={mode} />
        )}
        {item.layout === 'count-sound' && (
          <CountSoundBlock item={item} mode={mode} />
        )}
        {item.layout === 'read-phrases' && <ReadPhrasesBlock item={item} />}
        {item.layout === 'audio-match' && (
          <AudioMatchBlock item={item} mode={mode} />
        )}
        {item.layout === 'audio-order' && (
          <AudioOrderBlock item={item} mode={mode} />
        )}
        {item.layout === 'word-search' && (
          <WordSearchBlock item={item} mode={mode} />
        )}
        {item.layout === 'card-grid' && item.gameBoard ? (
          <CardGrid board={item.gameBoard as GameBoard} />
        ) : null}
        {item.layout === 'calligraphy' && item.calligraphy ? (
          <CalligraphyView item={item} />
        ) : null}
        {item.layout === 'count-icons' && <CountIconsBlock item={item} mode={mode} />}
        {item.layout === 'tcf' && (
          <TcfItemView item={item} mode={mode} tcfFormMode={tcfActiveForm} />
        )}
        {item.layout === 'audio-dictation' && <AudioDictationBlock item={item} mode={mode} />}
        {item.layout === 'symmetry-grid' && <SymmetryGridBlock item={item} mode={mode} />}
        {item.layout === 'segment-measure' && <SegmentMeasureBlock item={item} mode={mode} />}
        {item.layout === 'metro-map' && <MetroMapBlock item={item} mode={mode} />}
        {isProblem && <ProblemBlock item={item} mode={mode} draftGrid={draftGrid} />}
        {item.audioSrc && item.layout !== 'audio-dictation' ? (
          <audio className="oral-audio" controls preload="none" src={item.audioSrc}>
            Écoutez l’enregistrement.
          </audio>
        ) : null}
        {isStackedText && !item.convert && <StackedPrompt item={item} mode={mode} />}
        {!isProblem &&
          !isStackedText &&
          item.layout === 'inline' &&
          (item.convert ? <ConvertRow item={item} mode={mode} /> : <InlinePrompt item={item} mode={mode} />)}
        {isInlineDraft ? (
          <div
            className={`draft-pad draft-pad-short ${draftGrid ? 'with-grid' : 'plain'}`}
            aria-label="Zone de brouillon"
          />
        ) : null}
      </div>
    </div>
  )
}
