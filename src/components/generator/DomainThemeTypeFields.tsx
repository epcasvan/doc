import {
  ACCESS_DOMAIN_OPTIONS,
} from '@/access'
import { SelectBox } from '@/components/generator/SelectBox'
import { applyType } from '@/components/generator/page-helpers'
import { DIFFICULTY_OPTIONS } from '@/math/difficulty'
import { exerciseTypeById } from '@/math/catalog'
import {
  centeredOrigin,
  isReperageCadrans,
  isReperageComposer,
  isReperageFormes,
  remapMarksToOrigin,
  resolveAxesGrid,
} from '@/math/coord-reperage'
import { QUAD_SHAPE_LABELS } from '@/math/mesures'
import { isPhraseLibreEditable, PhraseLibreEditor } from '@/francais/PhraseLibreEditor'
import { GameContentPanel } from '@/jeux/GameContentPanel'
import { DEFAULT_GAME_FONT_SIZE } from '@/jeux/font-size'
import type { GameTemplate } from '@/jeux/templates'
import { TcfBankPicker } from '@/tcf/TcfExerciseEditor'
import {
  TCF_NIVEAUX,
  tcfMenuLabel,
} from '@/tcf/catalog'
import type { TcfNiveau } from '@/tcf/types'
import type { Dispatch, SetStateAction } from 'react'
import type {
  Difficulty,
  Domain,
  ExerciseBlock,
  Figure,
  PageConfig,
  PhraseVerbGroup,
  WorksheetPage,
} from '@/math/types'
import { resolveAlphaSelection } from '@/alphabetisation/themes'
import { resolveSoutienSelection } from '@/francais/soutien/themes'
import type { InstitutionalHeader } from '@/components/math/PrintDocumentChrome'

export type DomainThemeTypeFieldsProps = {
  isJeuxDomain: boolean
  isCalliDomain: boolean
  evalMode: boolean
  setEvalMode: Dispatch<SetStateAction<boolean>>
  institutional: InstitutionalHeader
  setInstitutional: Dispatch<SetStateAction<InstitutionalHeader>>
  pointsPerQuestion: number
  setPointsPerQuestion: Dispatch<SetStateAction<number>>
  sheetTotalPoints: number
  pages: PageConfig[]
  worksheets: WorksheetPage[]
  safeSheetIndex: number
  isTpmLike: boolean
  activePage: PageConfig
  changeDomain: (next: Domain) => void
  allowedDomains: Domain[]
  accessAccount: string | null
  isTcf: boolean
  tcfNiveau: TcfNiveau
  loadTcfSeries: (niveau: TcfNiveau) => void
  setPages: Dispatch<SetStateAction<PageConfig[]>>
  soutienSelection:
    | ReturnType<typeof resolveSoutienSelection>
    | ReturnType<typeof resolveAlphaSelection>
  activeBlock: ExerciseBlock
  changeTopic: (topic: string) => void
  available: Array<{ id: string; label: string }>
  isSoutienFr: boolean
  isAlphabetisation: boolean
  changeSoutienLetter: (letterId: string) => void
  changeSoutienSound: (soundId: string) => void
  isPhraseDomain: boolean
  isPhraseChart: boolean
  libreMode: boolean
  setVerbGroup: (next: PhraseVerbGroup) => void
  activeSheet: WorksheetPage | undefined
  safeBlockIndex: number
  updatePage: (patch: Partial<ExerciseBlock>) => void
  typeChoices: Array<{ id: string; label: string }>
  activeAsPage: PageConfig
  jeuxTemplate: GameTemplate | null | undefined
  jeuxText: string
  isReperage: boolean
  isVocabLearn: boolean
  isGramTheory: boolean
  isNumberLibreDomain: boolean
  isQuadType: boolean
  quadPool: Figure[]
}

export function DomainThemeTypeFields(p: DomainThemeTypeFieldsProps) {
  const {
    isJeuxDomain,
    isCalliDomain,
    evalMode,
    setEvalMode,
    institutional,
    setInstitutional,
    pointsPerQuestion,
    setPointsPerQuestion,
    sheetTotalPoints,
    pages,
    worksheets,
    safeSheetIndex,
    isTpmLike,
    activePage,
    changeDomain,
    allowedDomains,
    isTcf,
    tcfNiveau,
    loadTcfSeries,
    setPages,
    soutienSelection,
    activeBlock,
    changeTopic,
    available,
    isSoutienFr,
    isAlphabetisation,
    changeSoutienLetter,
    changeSoutienSound,
    isPhraseDomain,
    isPhraseChart,
    libreMode,
    setVerbGroup,
    activeSheet,
    safeBlockIndex,
    updatePage,
    typeChoices,
    activeAsPage,
    jeuxTemplate,
    jeuxText,
    isReperage,
    isVocabLearn,
    isGramTheory,
    isNumberLibreDomain,
    isQuadType,
    quadPool,
  } = p
  return (
    <>
              {isJeuxDomain || isCalliDomain ? null : (
              <div className="mode-toggle-block">
                <b>Mode de la fiche</b>
                <div className="mode-toggle">
                  <button
                    type="button"
                    className={!evalMode ? 'active' : ''}
                    onClick={() => setEvalMode(false)}
                  >
                    Exercice
                  </button>
                  <button
                    type="button"
                    className={evalMode ? 'active' : ''}
                    onClick={() => {
                      setEvalMode(true)
                      if (!institutional.documentTitle.trim()) {
                        setInstitutional((current) => ({ ...current, documentTitle: 'Évaluation' }))
                      }
                    }}
                  >
                    Évaluation
                  </button>
                </div>
                {evalMode && !isTpmLike && (
                  <label>
                    Points par question
                    <input
                      className="pill-input"
                      type="number"
                      min={1}
                      max={20}
                      value={pointsPerQuestion}
                      onChange={(event) =>
                        setPointsPerQuestion(Math.max(1, Math.min(20, Number(event.target.value) || 1)))
                      }
                    />
                    <small className="muted">
                      Total document : {sheetTotalPoints} pts
                      {pages.length > 1
                        ? ` (${pages.length} pages × points par question)`
                        : ` (${worksheets[safeSheetIndex]?.items.length ?? 0} × ${pointsPerQuestion})`}
                    </small>
                  </label>
                )}
              </div>
              )}

              <SelectBox label="Domaine" value={activePage.domain} onChange={(value) => changeDomain(value as Domain)}>
                {ACCESS_DOMAIN_OPTIONS.filter((domain) => allowedDomains.includes(domain.id)).map(
                  (domain) => (
                    <option value={domain.id} key={domain.id}>
                      {domain.label}
                    </option>
                  ),
                )}
              </SelectBox>
              {isTcf ? (
                <SelectBox
                  label="Niveau"
                  value={tcfNiveau}
                  onChange={(value) => {
                    const niveau = TCF_NIVEAUX.find((n) => n.id === value)?.id
                    if (!niveau || niveau === tcfNiveau) return
                    loadTcfSeries(niveau)
                  }}
                >
                  {TCF_NIVEAUX.map((n) => (
                    <option value={n.id} key={n.id}>
                      {n.id}
                    </option>
                  ))}
                </SelectBox>
              ) : null}
              {isTpmLike ? null : (
                <SelectBox
                  label={isTcf ? 'Compétence' : 'Thème'}
                  value={soutienSelection?.theme.id ?? activeBlock.topic}
                  onChange={changeTopic}
                >
                  {available.map((topic) => (
                    <option value={topic.id} key={topic.id}>
                      {topic.label}
                    </option>
                  ))}
                </SelectBox>
              )}
              {(isSoutienFr || isAlphabetisation) && soutienSelection ? (
                <SelectBox
                  label={
                    isAlphabetisation && activePage.topic === 'alpha-phrases'
                      ? 'Histoire'
                      : isAlphabetisation && activePage.topic === 'alpha-mots'
                        ? 'Leçon'
                        : 'Lettre'
                  }
                  value={soutienSelection.letter.id}
                  onChange={changeSoutienLetter}
                >
                  {soutienSelection.theme.letters.map((letter) => (
                    <option value={letter.id} key={letter.id}>
                      {isAlphabetisation ? letter.label : letter.letterUpper}
                    </option>
                  ))}
                </SelectBox>
              ) : null}
              {(isSoutienFr || isAlphabetisation) &&
              soutienSelection &&
              soutienSelection.letter.sounds.length > 1 ? (
                <div className="mode-toggle-block">
                  <b>Son</b>
                  <div
                    className={`mode-toggle is-${Math.min(4, soutienSelection.letter.sounds.length)}`}
                    role="group"
                    aria-label="Son de la lettre"
                  >
                    {soutienSelection.letter.sounds.map((sound) => (
                      <button
                        key={sound.id}
                        type="button"
                        className={soutienSelection.sound.id === sound.id ? 'active' : ''}
                        onClick={() => changeSoutienSound(sound.id)}
                      >
                        {sound.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {isPhraseDomain && !isPhraseChart ? (
                <div className="mode-toggle-block">
                  <b>Verbes</b>
                  <div className="mode-toggle is-3" role="group" aria-label="Groupe de verbes">
                    <button
                      type="button"
                      className={(activeBlock.verbGroup ?? 'er') === 'er' ? 'active' : ''}
                      onClick={() => setVerbGroup('er')}
                    >
                      Simple
                    </button>
                    <button
                      type="button"
                      className={activeBlock.verbGroup === 'autres' ? 'active' : ''}
                      onClick={() => setVerbGroup('autres')}
                    >
                      Autres
                    </button>
                    {libreMode ? null : (
                      <button
                        type="button"
                        className={activeBlock.verbGroup === 'libre' ? 'active' : ''}
                        onClick={() => setVerbGroup('libre')}
                      >
                        Libre
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
              {!libreMode &&
              isPhraseDomain &&
              !isPhraseChart &&
              activeBlock.verbGroup === 'libre' &&
              isPhraseLibreEditable(activeBlock.exerciseType) ? (
                <PhraseLibreEditor
                  exerciseType={activeBlock.exerciseType}
                  items={activeBlock.phraseItems ?? activeSheet?.blocks[safeBlockIndex]?.items ?? []}
                  instruction={
                    activeBlock.phraseInstruction ??
                    activeSheet?.blocks[safeBlockIndex]?.instruction ??
                    ''
                  }
                  onChangeItems={(phraseItems) => updatePage({ phraseItems })}
                  onChangeInstruction={(phraseInstruction) => updatePage({ phraseInstruction })}
                />
              ) : null}
              {isTpmLike || (isTcf && typeChoices.length <= 1) ? null : (
              <SelectBox
                label={isTcf ? 'Exercice' : 'Type d’exercice'}
                value={activeBlock.exerciseType}
                onChange={(value) => {
                  const type = exerciseTypeById[value]
                  if (!type) return
                  if (
                    (isReperageFormes(value) && isReperageFormes(activeBlock.exerciseType)) ||
                    (isReperageCadrans(value) && isReperageCadrans(activeBlock.exerciseType))
                  ) {
                    const fromComposer = isReperageComposer(activeBlock.exerciseType)
                    const toComposer = isReperageComposer(value)
                    if (fromComposer !== toComposer && isReperageCadrans(value)) {
                      const grid = resolveAxesGrid(activeAsPage, activeBlock.difficulty)
                      const unit = grid.unitSquares
                      const stored = {
                        col: activeBlock.coordOriginCol ?? grid.cols / 2,
                        row: activeBlock.coordOriginRow ?? grid.rows / 2,
                      }
                      const center = centeredOrigin(grid.cols, grid.rows)
                      const remapped = fromComposer
                        ? remapMarksToOrigin(activeBlock.coordMarks ?? [], stored, center, unit)
                        : activeBlock.coordMarks
                      updatePage({
                        exerciseType: value,
                        topic: type.topic,
                        track: type.track,
                        coordLibre: activeBlock.coordLibre,
                        coordMarks: remapped,
                        coordOriginCol: toComposer ? center.col : undefined,
                        coordOriginRow: toComposer ? center.row : undefined,
                      })
                      return
                    }
                    updatePage({
                      exerciseType: value,
                      topic: type.topic,
                      track: type.track,
                      coordLibre: activeBlock.coordLibre,
                    })
                    return
                  }
                  updatePage(applyType(type, activeBlock))
                }}
              >
                {typeChoices.map((type) => (
                  <option value={type.id} key={type.id}>
                    {tcfMenuLabel(type.id, tcfNiveau) ?? type.label}
                  </option>
                ))}
              </SelectBox>
              )}
              {!libreMode && isJeuxDomain && jeuxTemplate ? (
                <GameContentPanel
                  typeId={activeBlock.exerciseType}
                  template={jeuxTemplate}
                  entries={activeBlock.gameEntries}
                  text={jeuxText}
                  gameSource={activeBlock.gameSource}
                  gameTopic={activeBlock.gameTopic}
                  gameSelectedIds={activeBlock.gameSelectedIds}
                  gameBackColor={activeBlock.gameBackColor}
                  gameSeriesName={activeBlock.gameSeriesName}
                  gameBorderId={activeBlock.gameBorderId}
                  gameBorderRectoId={
                    activeBlock.gameBorderRectoId !== undefined
                      ? activeBlock.gameBorderRectoId
                      : activeBlock.gameBorderId
                  }
                  gameBorderVersoId={
                    activeBlock.gameBorderVersoId !== undefined
                      ? activeBlock.gameBorderVersoId
                      : activeBlock.gameBorderId
                  }
                  gameFontSize={activeBlock.gameFontSize ?? DEFAULT_GAME_FONT_SIZE}
                  gameAlpha={activeBlock.gameAlpha}
                  onChange={(next) => updatePage(next)}
                />
              ) : null}
              {isTcf ? (
                <TcfBankPicker
                  niveau={tcfNiveau}
                  typeId={activeBlock.exerciseType}
                  scenario={activeBlock.tcfScenario}
                  bankId={activeBlock.tcfBankId}
                  edited={activeBlock.tcfExercise != null}
                  onChange={(patch) => updatePage(patch)}
                />
              ) : null}
              {isReperage ||
              isPhraseDomain ||
              isJeuxDomain ||
              isCalliDomain ||
              isVocabLearn ||
              isGramTheory ||
              isSoutienFr ||
              isAlphabetisation ||
              isTcf ||
              isTpmLike ? null : (
              <>
              <div className={`niveau-row${activeBlock.numberLibre ? ' is-libre' : ''}`}>
                <SelectBox
                  label="Niveau"
                  value={activeBlock.difficulty ?? 'moyen'}
                  onChange={(value) => updatePage({ difficulty: value as Difficulty })}
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option value={opt.value} key={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </SelectBox>
                {!libreMode && isNumberLibreDomain ? (
                  <button
                    type="button"
                    className={`niveau-libre-btn${activeBlock.numberLibre ? ' active' : ''}`}
                    aria-pressed={!!activeBlock.numberLibre}
                    aria-label="Saisir les valeurs"
                    title="Saisir les valeurs à la place du niveau"
                    onClick={() =>
                      updatePage({
                        numberLibre: !activeBlock.numberLibre,
                        numberMin: activeBlock.numberMin ?? 1,
                        numberMax: activeBlock.numberMax ?? 100,
                      })
                    }
                  >
                    Valeurs
                  </button>
                ) : null}
              </div>
              {!libreMode && isNumberLibreDomain && activeBlock.numberLibre ? (
                <div className="number-libre-fields">
                  <label className="select-shell">
                    <span>De</span>
                    <input
                      className="pill-input"
                      type="number"
                      inputMode="decimal"
                      step={activeBlock.numberDecimals ? 0.1 : 1}
                      value={activeBlock.numberMin ?? 1}
                      onChange={(event) => updatePage({ numberMin: Number(event.target.value) })}
                    />
                  </label>
                  <label className="select-shell">
                    <span>À</span>
                    <input
                      className="pill-input"
                      type="number"
                      inputMode="decimal"
                      step={activeBlock.numberDecimals ? 0.1 : 1}
                      value={activeBlock.numberMax ?? 100}
                      onChange={(event) => updatePage({ numberMax: Number(event.target.value) })}
                    />
                  </label>
                  <div className="mode-toggle-block">
                    <b>Décimales</b>
                    <div className="mode-toggle">
                      <button
                        type="button"
                        className={!activeBlock.numberDecimals ? 'active' : ''}
                        onClick={() => updatePage({ numberDecimals: false })}
                      >
                        Sans
                      </button>
                      <button
                        type="button"
                        className={activeBlock.numberDecimals ? 'active' : ''}
                        onClick={() => updatePage({ numberDecimals: true })}
                      >
                        Avec
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              </>
              )}
              {isQuadType ? (
                <div className="quad-libre-block">
                  <div className="mode-toggle-block">
                    <b>Formes</b>
                    <div className="mode-toggle">
                      <button
                        type="button"
                        className={!activeBlock.quadLibre ? 'active' : ''}
                        onClick={() => updatePage({ quadLibre: false, quadShapes: undefined })}
                      >
                        Hasard
                      </button>
                      <button
                        type="button"
                        className={activeBlock.quadLibre ? 'active' : ''}
                        onClick={() =>
                          updatePage({
                            quadLibre: true,
                            quadShapes: activeBlock.quadShapes?.length ? activeBlock.quadShapes : [...quadPool],
                          })
                        }
                      >
                        Choisir
                      </button>
                    </div>
                  </div>
                  {activeBlock.quadLibre ? (
                    <div className="quad-shape-list">
                      {quadPool.map((figure) => {
                        const selected = (activeBlock.quadShapes ?? quadPool).includes(figure)
                        return (
                          <button
                            key={figure}
                            type="button"
                            className={selected ? 'active' : ''}
                            aria-pressed={selected}
                            onClick={() => {
                              const current = activeBlock.quadShapes ?? [...quadPool]
                              const next = selected
                                ? current.filter((item) => item !== figure)
                                : [...current, figure]
                              updatePage({ quadShapes: next.length ? next : [figure] })
                            }}
                          >
                            {QUAD_SHAPE_LABELS[figure] ?? figure}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}

    </>
  )
}
