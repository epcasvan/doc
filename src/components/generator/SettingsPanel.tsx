import type { Dispatch, SetStateAction } from 'react'
import { PageStructureTabs } from '@/components/generator/PageStructureTabs'
import {
  DomainThemeTypeFields,
  type DomainThemeTypeFieldsProps,
} from '@/components/generator/DomainThemeTypeFields'
import { CalliSettingsPanel } from '@/components/generator/CalliSettingsPanel'
import { SoutienVocabFields } from '@/components/generator/SoutienVocabFields'
import { QuestionsColumnsFields } from '@/components/generator/QuestionsColumnsFields'
import { CoordLibreSettings } from '@/components/generator/CoordLibreSettings'
import { DraftGridControls } from '@/components/generator/DraftGridControls'
import type { InstitutionalHeader } from '@/components/math/PrintDocumentChrome'
import type { CoordTool } from '@/components/generator/useCoordEditing'
import type { VocabWordEntry } from '@/francais/vocab-learn'
import type { SoutienComplete } from '@/francais/soutien/banks'
import type { GameTemplate } from '@/jeux/templates'
import type { TcfNiveau } from '@/tcf/types'
import type { resolveAxesGrid } from '@/math/coord-reperage'
import type {
  CoordShape,
  Difficulty,
  Domain,
  ExerciseBlock,
  Figure,
  PageConfig,
  PhraseVerbGroup,
  WorksheetPage,
} from '@/math/types'

export type SettingsPanelProps = {
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
  isTpmLike: boolean
  addPage: () => void
  addExerciseOnPage: () => void
  removePage: (configIdx: number) => void

  isJeuxDomain: boolean
  isCalliDomain: boolean
  evalMode: boolean
  setEvalMode: Dispatch<SetStateAction<boolean>>
  institutional: InstitutionalHeader
  setInstitutional: Dispatch<SetStateAction<InstitutionalHeader>>
  pointsPerQuestion: number
  setPointsPerQuestion: Dispatch<SetStateAction<number>>
  sheetTotalPoints: number
  activePage: PageConfig
  changeDomain: (next: Domain) => void
  allowedDomains: Domain[]
  accessAccount: string | null
  isTcf: boolean
  tcfNiveau: TcfNiveau
  loadTcfSeries: (niveau: TcfNiveau) => void
  soutienSelection: DomainThemeTypeFieldsProps['soutienSelection']
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

  calliIsPhrases: boolean
  calliIsLibre: boolean
  calliFields: string[]
  vocabDifficultyOptions: Array<{ value: Difficulty; label: string }>
  vocabSubgroups: Array<{ id: string; label: string }>
  activeVocabSubgroup: string | undefined
  setCalliFieldAt: (index: number, value: string) => void
  removeCalliField: (index: number) => void
  addCalliExtraWord: (entry: VocabWordEntry) => void

  isSoutienMots: boolean
  isSoutienCompleter: boolean
  isVocabPool: boolean
  isVocabProd: boolean
  soutienType1Words: string[]
  soutienType1WordPool: string[]
  soutienBankSound: string | undefined
  soutienCompletes: readonly SoutienComplete[]
  soutienBankWords: readonly string[]
  vocabLearnWords: VocabWordEntry[]
  vocabSelectedIds: string[]
  vocabCustomWords: VocabWordEntry[]

  isTransform: boolean
  isSoutienLignes: boolean
  isSoutienMotsCount: boolean
  isSoutienRelier: boolean
  isSoutienCols123: boolean
  isSoutienCols345: boolean
  isAlphaMotsCols: boolean
  isAlphaSyllabeTableCols: boolean
  isAlphaPrononcerCols: boolean
  hideColumnsOption: boolean
  soutienKind: string | undefined
  questionsInputOverflow: boolean
  bankOverflow: boolean
  bankQuestionCap: number | undefined
  questionsOverflow: boolean
  maxQuestions: number
  isTpmInfoPage: boolean
  isSoutienMotsMeles: boolean

  isFormes: boolean
  isCadrans: boolean
  isComposer: boolean
  isDroites: boolean
  isConstruire: boolean
  isTransformCentrale: boolean
  isTransformPlacer: boolean
  axesGrid: ReturnType<typeof resolveAxesGrid>
  updateAxesGrid: (patch: Partial<ExerciseBlock>) => void
  coordTool: CoordTool
  setCoordTool: Dispatch<SetStateAction<CoordTool>>
  placeCoordMark: (x: number, y: number, kind: CoordShape) => void
  placeOrigin: (col: number, row: number) => void
  removeCoordMark: (x: number, y: number) => void

  setAllTpmDraftGrids: (value: boolean) => void
  setAllDraftGrids: (value: boolean) => void
}

export function SettingsPanel(p: SettingsPanelProps) {
  return (
    <aside className="settings-panel no-print">
      <PageStructureTabs
        worksheets={p.worksheets}
        pages={p.pages}
        safeSheetIndex={p.safeSheetIndex}
        setSheetIndex={p.setSheetIndex}
        setBlockIndex={p.setBlockIndex}
        setPages={p.setPages}
        pageIndex={p.pageIndex}
        pageExerciseBlocks={p.pageExerciseBlocks}
        safeBlockIndex={p.safeBlockIndex}
        activeSheet={p.activeSheet}
        firstExerciseNo={p.firstExerciseNo}
        isTpmLike={p.isTpmLike}
        addPage={p.addPage}
        addExerciseOnPage={p.addExerciseOnPage}
        removePage={p.removePage}
      />
      <div className="field-group">
        <DomainThemeTypeFields
          isJeuxDomain={p.isJeuxDomain}
          isCalliDomain={p.isCalliDomain}
          evalMode={p.evalMode}
          setEvalMode={p.setEvalMode}
          institutional={p.institutional}
          setInstitutional={p.setInstitutional}
          pointsPerQuestion={p.pointsPerQuestion}
          setPointsPerQuestion={p.setPointsPerQuestion}
          sheetTotalPoints={p.sheetTotalPoints}
          pages={p.pages}
          worksheets={p.worksheets}
          safeSheetIndex={p.safeSheetIndex}
          isTpmLike={p.isTpmLike}
          activePage={p.activePage}
          changeDomain={p.changeDomain}
          allowedDomains={p.allowedDomains}
          accessAccount={p.accessAccount}
          isTcf={p.isTcf}
          tcfNiveau={p.tcfNiveau}
          loadTcfSeries={p.loadTcfSeries}
          soutienSelection={p.soutienSelection}
          activeBlock={p.activeBlock}
          changeTopic={p.changeTopic}
          available={p.available}
          isSoutienFr={p.isSoutienFr}
          isAlphabetisation={p.isAlphabetisation}
          changeSoutienLetter={p.changeSoutienLetter}
          changeSoutienSound={p.changeSoutienSound}
          isPhraseDomain={p.isPhraseDomain}
          isPhraseChart={p.isPhraseChart}
          libreMode={p.libreMode}
          setVerbGroup={p.setVerbGroup}
          activeSheet={p.activeSheet}
          safeBlockIndex={p.safeBlockIndex}
          updatePage={p.updatePage}
          typeChoices={p.typeChoices}
          activeAsPage={p.activeAsPage}
          jeuxTemplate={p.jeuxTemplate}
          jeuxText={p.jeuxText}
          isReperage={p.isReperage}
          isVocabLearn={p.isVocabLearn}
          isGramTheory={p.isGramTheory}
          isNumberLibreDomain={p.isNumberLibreDomain}
          isQuadType={p.isQuadType}
          quadPool={p.quadPool}
        />
        <CalliSettingsPanel
          isCalliDomain={p.isCalliDomain}
          libreMode={p.libreMode}
          activeBlock={p.activeBlock}
          updatePage={p.updatePage}
          calliIsPhrases={p.calliIsPhrases}
          calliIsLibre={p.calliIsLibre}
          calliFields={p.calliFields}
          vocabDifficultyOptions={p.vocabDifficultyOptions}
          vocabSubgroups={p.vocabSubgroups}
          activeVocabSubgroup={p.activeVocabSubgroup}
          setCalliFieldAt={p.setCalliFieldAt}
          removeCalliField={p.removeCalliField}
          addCalliExtraWord={p.addCalliExtraWord}
        />
        <SoutienVocabFields
          isVocabPool={p.isVocabPool}
          isVocabLearn={p.isVocabLearn}
          isVocabProd={p.isVocabProd}
          activeBlock={p.activeBlock}
          updatePage={p.updatePage}
          vocabSubgroups={p.vocabSubgroups}
          activeVocabSubgroup={p.activeVocabSubgroup}
          vocabLearnWords={p.vocabLearnWords}
          vocabSelectedIds={p.vocabSelectedIds}
          vocabCustomWords={p.vocabCustomWords}
        />
        <QuestionsColumnsFields
          activeBlock={p.activeBlock}
          updatePage={p.updatePage}
          isTransform={p.isTransform}
          isReperage={p.isReperage}
          isSoutienLignes={p.isSoutienLignes}
          isSoutienMotsCount={p.isSoutienMotsCount}
          isSoutienRelier={p.isSoutienRelier}
          isSoutienCompleter={p.isSoutienCompleter}
          isSoutienCols123={p.isSoutienCols123}
          isSoutienCols345={p.isSoutienCols345}
          isAlphaMotsCols={p.isAlphaMotsCols}
          isAlphaSyllabeTableCols={p.isAlphaSyllabeTableCols}
          isAlphaPrononcerCols={p.isAlphaPrononcerCols}
          hideColumnsOption={p.hideColumnsOption}
          isAlphabetisation={p.isAlphabetisation}
          soutienKind={p.soutienKind}
          questionsInputOverflow={p.questionsInputOverflow}
          bankOverflow={p.bankOverflow}
          bankQuestionCap={p.bankQuestionCap}
          questionsOverflow={p.questionsOverflow}
          maxQuestions={p.maxQuestions}
          isPhraseChart={p.isPhraseChart}
          isVocabLearn={p.isVocabLearn}
          isVocabPool={p.isVocabPool}
          isGramTheory={p.isGramTheory}
          isJeuxDomain={p.isJeuxDomain}
          isCalliDomain={p.isCalliDomain}
          isSoutienFr={p.isSoutienFr}
          isTcf={p.isTcf}
          isTpmInfoPage={p.isTpmInfoPage}
          isSoutienMots={p.isSoutienMots}
          isSoutienMotsMeles={p.isSoutienMotsMeles}
          isTpmLike={p.isTpmLike}
          evalMode={p.evalMode}
          activeSheet={p.activeSheet}
          safeBlockIndex={p.safeBlockIndex}
          firstExerciseNo={p.firstExerciseNo}
          sheetTotalPoints={p.sheetTotalPoints}
        />
        <CoordLibreSettings
          activeBlock={p.activeBlock}
          activeAsPage={p.activeAsPage}
          updatePage={p.updatePage}
          isFormes={p.isFormes}
          isCadrans={p.isCadrans}
          isComposer={p.isComposer}
          isDroites={p.isDroites}
          isConstruire={p.isConstruire}
          isTransform={p.isTransform}
          isTransformCentrale={p.isTransformCentrale}
          isTransformPlacer={p.isTransformPlacer}
          axesGrid={p.axesGrid}
          updateAxesGrid={p.updateAxesGrid}
          coordTool={p.coordTool}
          setCoordTool={p.setCoordTool}
          placeCoordMark={p.placeCoordMark}
          placeOrigin={p.placeOrigin}
          removeCoordMark={p.removeCoordMark}
          activeSheet={p.activeSheet}
          safeBlockIndex={p.safeBlockIndex}
        />
        <DraftGridControls
          isTpmLike={p.isTpmLike}
          pages={p.pages}
          pageExerciseBlocks={p.pageExerciseBlocks}
          activeBlock={p.activeBlock}
          setAllTpmDraftGrids={p.setAllTpmDraftGrids}
          setAllDraftGrids={p.setAllDraftGrids}
        />
      </div>
    </aside>
  )
}
