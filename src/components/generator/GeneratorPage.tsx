import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import {
  ACCESS_DOMAIN_OPTIONS,
  accountCanAccessDomain,
  domainsForAccount,
  readAccessAccount,
} from '@/access'
import { CoordGrid } from '@/components/math/CoordGrid'
import { TopbarTools } from '@/components/generator/TopbarTools'
import { FormesPalette, ReperageAxesFields } from '@/components/generator/FormesPalette'
import { FooterSidePanel } from '@/components/generator/FooterSidePanel'
import { Header } from '@/components/generator/Header'
import { LibreSidePanel } from '@/components/generator/LibreSidePanel'
import { SelectBox } from '@/components/generator/SelectBox'
import { TabRemoveButton } from '@/components/generator/TabRemoveButton'
import { VocabAddWordRow } from '@/components/generator/VocabAddWordRow'
import {
  WorksheetSheet,
  defaultCoordQuestionReply,
} from '@/components/generator/WorksheetSheet'
import {
  THEME_STORAGE_KEY,
  contrastOnTheme,
  readThemeColor,
} from '@/components/generator/theme'
import {
  applyType,
  cycleOralMode,
  isOralComprehensionExercise,
  isProblemExercise,
  resizeDraftGrids,
  resizeOralAnswerModes,
} from '@/components/generator/page-helpers'
import {
  DEFAULT_INSTITUTIONAL,
  type InstitutionalHeader,
} from '@/components/math/PrintDocumentChrome'
import {
  algebraTopics,
  defaultPage,
  exerciseTypeById,
  firstTypeFor,
  geometryTopics,
  isDraftPadExercise,
  isQuadExercise,
  calligraphieTopics,
  jeuxTopics,
  lectureTopics,
  soutienFrTopics,
  gattegnoTopics,
  grammaireTopics,
  vocabulaireTopics,
  societeTopics,
  santeTopics,
  acmTopics,
  tcmCscTopics,
  tcmCfrTopics,
  tcfTopics,
  tcmTopics,
  typesForTopic,
} from '@/math/catalog'
import {
  TCF_DOCUMENT_TITLE,
  TCF_DOMAIN,
  TCF_NIVEAUX,
  TCF_SLOTS,
  isTcfConsignesType,
  tcfDifficultyFromNiveau,
  tcfNiveauFromDifficulty,
  tcfSlotByTypeId,
  tcfTypeByTypeId,
} from '@/tcf/catalog'
import {
  downloadTcfAudios,
  tcfExerciseAudioRefs,
} from '@/tcf/download-audios'
import { buildTcfRandomTestPages, tcfConsignesPage, tcfPage } from '@/tcf/generate'
import { tcfBank, tcfSlotBank } from '@/tcf/loader'
import { TcfBankPicker } from '@/tcf/TcfExerciseEditor'
import type { TcfCompetence, TcfExercise, TcfTypeReponse } from '@/tcf/types'
import {
  blockPointsTotal,
  buildTcmTestPages,
  formatPointsLabel,
  isTcmConsignesType,
  isTcmDomain,
  TCM_DOCUMENT_TITLE,
} from '@/tcm/test'
import { isTcmFamilyConsignesType } from '@/tcm/informations'
import {
  buildTcmCfrTestPages,
  isTcmCfrConsignesType,
  isTcmCfrDomain,
  TCM_CFR_DOCUMENT_TITLE,
} from '@/tcm-cfr/test'
import { downloadTcmCfrAudios } from '@/tcm-cfr/audio-nombres'
import {
  defaultCalliPhraseCount,
  defaultCalliWordCount,
  isCalliPhrasesType,
  joinCalliLines,
  normalizeCalliFields,
  parseCalliLines,
} from '@/calligraphie/defaults'
import {
  CALLI_FONTS,
  CALLI_SIZES,
  DEFAULT_CALLI_FONT,
  DEFAULT_CALLI_SIZE,
} from '@/calligraphie/fonts'
import {
  initialCalliText,
  isCalligraphieType,
  reshuffleCalliContent,
} from '@/calligraphie/generate'
import { frTopicFromCalliTopic, isCalliLibreTopic } from '@/calligraphie/topics'
import {
  defaultVocabSelected,
  defaultVocabSubgroup,
  isVocabLearnType,
  isVocabPoolType,
  isVocabProductionType,
  vocabLearnWordsFor,
  vocabSubgroupsFor,
  type VocabWordEntry,
} from '@/francais/vocab-learn'
import { isGrammarTheoryType } from '@/francais/grammar-theory'
import { isPhraseLibreEditable, PhraseLibreEditor } from '@/francais/PhraseLibreEditor'
import { soutienBankById } from '@/francais/soutien/banks'
import {
  downloadSoutienEcouterAudio,
  SOUTIEN_LETTRES_PHRASE_CONSIGNE,
  SOUTIEN_SYLLABE_SON_CONSIGNE,
} from '@/francais/soutien/download-ecouter-audio'
import {
  downloadSoutienCompleterAudio,
  downloadSoutienMotsAudio,
} from '@/francais/soutien/download-mots-audio'
import { type1WordPool, type1Words } from '@/francais/soutien/generate'
import { parseSoutienType, SOUTIEN_KINDS } from '@/francais/soutien/kinds'
import { buildSoutienSeriesPages, soutienFicheTitle } from '@/francais/soutien/series'
import {
  findSoutienByBankId,
  resolveSoutienSelection,
  soutienExerciseTypeId,
  soutienThemeById,
} from '@/francais/soutien/themes'
import {
  defaultSoutienMotsEntries,
  SoutienMotsLibreEditor,
} from '@/francais/soutien/SoutienMotsLibreEditor'
import {
  defaultSoutienCompleterEntries,
  SoutienCompleterLibreEditor,
} from '@/francais/soutien/SoutienCompleterLibreEditor'
import {
  CoordQuestionsLibreEditor,
  resizeCoordQuestionsLibre,
} from '@/math/CoordQuestionsLibreEditor'
import { reshuffleGameContent } from '@/jeux/bank'
import { defaultEntriesFor } from '@/jeux/defaults'
import { GameContentPanel } from '@/jeux/GameContentPanel'
import { DEFAULT_GAME_FONT_SIZE } from '@/jeux/font-size'
import { entriesToText } from '@/jeux/parse'
import { isJeuxType, templateFor } from '@/jeux/templates'
import {
  COORD_SHAPES,
  FORMES_CELL_MM_OPTIONS,
  clampFormesCellMm,
  clampFormesCols,
  clampFormesRows,
  clampOrigin,
  centeredOrigin,
  COORD_LETTER_MAX,
  coordSizeFor,
  FORMES_MAX_BY_MM,
  ensureGivenMark,
  isReperageCadrans,
  isReperageComposer,
  isReperageConstruire,
  isReperageDroites,
  isReperageFormes,
  isReperagePage,
  markOnGrid,
  remapMarksToOrigin,
  maxFormesColsForCell,
  maxFormesRowsForCell,
  nextPointLabel,
  resolveAxesGrid,
  sceneFromAxesLibre,
} from '@/math/coord-reperage'
import {
  isTransformationCentrale,
  isTransformationExercise,
  isTransformationPlacer,
  TRANSFORM_LABELS,
  TRANSFORM_MAX_POINTS,
} from '@/math/coord-transformations'
import { DIFFICULTY_OPTIONS } from '@/math/difficulty'
import {
  AREA_QUAD_FIGURES,
  PERI_QUAD_FIGURES,
  QUAD_SHAPE_LABELS,
  VOLUME_QUAD_FIGURES,
} from '@/math/mesures'
import { buildWorksheets } from '@/math/generate'
import {
  addPageBlock,
  blockFromPage,
  exerciseStartIndex,
  pageAsConfig,
  pageBlocks,
  removePageBlock,
  setPageBlock,
} from '@/math/page-model'
import { randomSeed } from '@/math/rng'
import type {
  CoordAxis,
  CoordShape,
  Difficulty,
  Domain,
  ExerciseBlock,
  PageConfig,
  PhraseVerbGroup,
  PreviewMode,
} from '@/math/types'

/** Remettre à `true` pour réafficher Lecture dans le sélecteur Domaine. */
const SHOW_LECTURE_DOMAIN = false

export function GeneratorPage({ onLogout }: { onLogout: () => void }) {
  const accessAccount = readAccessAccount()
  const allowedDomains = useMemo(() => domainsForAccount(accessAccount), [accessAccount])
  const firstAllowedDomain = allowedDomains[0] ?? 'algèbre'
  const initial = defaultPage(
    accountCanAccessDomain(accessAccount, 'algèbre') ? 'algèbre' : firstAllowedDomain,
  )
  const [pages, setPages] = useState<PageConfig[]>([initial])
  const [sheetIndex, setSheetIndex] = useState(0)
  const [blockIndex, setBlockIndex] = useState(0)
  const [mode, setMode] = useState<PreviewMode>('student')
  const [institutional, setInstitutional] = useState<InstitutionalHeader>(DEFAULT_INSTITUTIONAL)
  const [evalMode, setEvalMode] = useState(false)
  const [pointsPerQuestion, setPointsPerQuestion] = useState(1)
  const [seed, setSeed] = useState(randomSeed)
  const [questionsOverflow, setQuestionsOverflow] = useState(false)
  const [selectedCoordShape, setSelectedCoordShape] = useState<CoordShape | null>('triangle')
  const [coordTool, setCoordTool] = useState<'origin' | 'given' | 'points' | 'center'>('origin')
  const [themeColor, setThemeColor] = useState(readThemeColor)
  const [footerPanelOpen, setFooterPanelOpen] = useState(false)
  const [libreMode, setLibreMode] = useState(false)
  const previewFrameRef = useRef<HTMLDivElement>(null)

  const applyThemeColor = (color: string) => {
    setThemeColor(color)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, color)
    } catch {
      /* ignore */
    }
  }

  const worksheets = useMemo(() => buildWorksheets(pages, seed), [pages, seed])
  const [libreSnapshot, setLibreSnapshot] = useState<PageConfig[] | null>(null)
  const safeSheetIndex = Math.min(sheetIndex, Math.max(0, worksheets.length - 1))
  const activeSheet = worksheets[safeSheetIndex] ?? worksheets[0]
  const pageIndex = activeSheet?.configIndex ?? Math.min(sheetIndex, Math.max(0, pages.length - 1))
  const activePage = pages[pageIndex] ?? pages[0]!
  const pageExerciseBlocks = pageBlocks(activePage)
  const safeBlockIndex = Math.min(blockIndex, Math.max(0, pageExerciseBlocks.length - 1))
  const activeBlock = pageExerciseBlocks[safeBlockIndex] ?? blockFromPage(activePage)
  /**
   * Mode libre : aperçu et impression montrent la dernière version validée (bouton Valider).
   * Exception : saisie au clic sur la fiche (repérage), qui reste en direct.
   */
  const previewSource =
    libreMode && !activeBlock.coordLibre && libreSnapshot && libreSnapshot.length === pages.length
      ? libreSnapshot
      : null
  const previewWorksheets = useMemo(
    () => (previewSource ? buildWorksheets(previewSource, seed) : worksheets),
    [previewSource, seed, worksheets],
  )
  const previewSheet = previewWorksheets[Math.min(safeSheetIndex, previewWorksheets.length - 1)]
  /** Jeux : aperçu de toutes les feuilles de la config (recto + verso) côte à côte / empilées. */
  const jeuxPreviewSheets = useMemo(() => {
    if (activePage.domain !== 'jeux') return null
    const related = previewWorksheets
      .map((sheet, index) => ({ sheet, index }))
      .filter(({ sheet }) => (sheet.configIndex ?? 0) === pageIndex)
    return related.length > 0 ? related : null
  }, [activePage.domain, previewWorksheets, pageIndex])
  const available =
    activePage.domain === 'algèbre'
        ? algebraTopics
        : activePage.domain === 'géométrie'
          ? geometryTopics
          : activePage.domain === 'gattegno'
            ? gattegnoTopics
            : activePage.domain === 'grammaire'
              ? grammaireTopics
              : activePage.domain === 'vocabulaire'
                ? vocabulaireTopics
                : activePage.domain === 'société'
                  ? societeTopics
                  : activePage.domain === 'santé'
                    ? santeTopics
                    : activePage.domain === 'acm'
                      ? acmTopics
                      : activePage.domain === 'tcm-csc'
                        ? tcmCscTopics
                        : activePage.domain === 'tcm-cfr'
                          ? tcmCfrTopics
                          : activePage.domain === 'jeux'
                            ? jeuxTopics
                            : activePage.domain === 'calligraphie'
                              ? calligraphieTopics
                              : activePage.domain === 'soutien-fr'
                                ? soutienFrTopics
                                : isTcmDomain(activePage.domain)
                                  ? tcmTopics
                                  : activePage.domain === TCF_DOMAIN
                                    ? tcfTopics
                                    : lectureTopics
  const typeChoices =
    activePage.domain === 'soutien-fr'
      ? (() => {
          const bankId =
            parseSoutienType(activeBlock.exerciseType)?.bankId ??
            resolveSoutienSelection(activeBlock.topic, activeBlock.exerciseType)?.sound.bankId ??
            'a'
          return SOUTIEN_KINDS.map(
            (kind) => exerciseTypeById[soutienExerciseTypeId(bankId, kind.id)],
          ).filter((t): t is NonNullable<typeof t> => Boolean(t))
        })()
      : typesForTopic(
          activeBlock.topic,
          activePage.domain === 'français' ? (activeBlock.track ?? 'voc') : undefined,
        )
  const firstExerciseNo = exerciseStartIndex(pages, pageIndex)
  const sheetTotalPoints = useMemo(
    () =>
      previewWorksheets.reduce(
        (sum, page) =>
          sum +
          (page.blocks?.length
            ? page.blocks.reduce(
                (blockSum, block) =>
                  blockSum +
                  blockPointsTotal(block.items, block.pointsPerQuestion ?? pointsPerQuestion),
                0,
              )
            : blockPointsTotal(page.items, page.pointsPerQuestion ?? pointsPerQuestion)),
        0,
      ),
    [previewWorksheets, pointsPerQuestion],
  )

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
    activePage.extraBlocks,
    evalMode,
    institutional,
  ])

  const updatePage = (patch: Partial<PageConfig>) =>
    setPages((current) =>
      current.map((page, index) => {
        if (index !== pageIndex) return page
        if (patch.domain != null && patch.exerciseType != null) {
          return { ...page, ...patch, extraBlocks: undefined }
        }
        const merged = setPageBlock(page, safeBlockIndex, patch)
        const nextBlock = pageBlocks(merged)[safeBlockIndex] ?? blockFromPage(merged)
        let fixed = nextBlock
        if (
          patch.exerciseType != null &&
          patch.exerciseType.startsWith('equations-') &&
          !activeBlock.exerciseType.startsWith('equations-') &&
          patch.count == null
        ) {
          fixed = { ...fixed, count: Math.min(fixed.count, 2) }
        }
        if (patch.count != null || patch.exerciseType != null) {
          const count = patch.count ?? fixed.count
          fixed = {
            ...fixed,
            // Nouveau type / nombre de questions → retirer le brouillon libre pour retirer.
            phraseItems:
              patch.exerciseType != null || patch.count != null ? undefined : fixed.phraseItems,
            phraseInstruction:
              patch.exerciseType != null || patch.count != null
                ? undefined
                : fixed.phraseInstruction,
            problemDraftGrids: isProblemExercise(fixed.exerciseType)
              ? resizeDraftGrids(fixed.problemDraftGrids, count)
              : undefined,
            oralAnswerModes: isOralComprehensionExercise(fixed.exerciseType)
              ? resizeOralAnswerModes(fixed.oralAnswerModes, count)
              : undefined,
          }
        }
        if (isReperageCadrans(fixed.exerciseType) && fixed.coordMarks) {
          if (isReperageComposer(fixed.exerciseType)) {
            const given = fixed.coordMarks.filter((mark) => mark.given)
            const others = fixed.coordMarks.filter((mark) => !mark.given).slice(0, Math.max(0, fixed.count))
            fixed = { ...fixed, coordMarks: [...given, ...others] }
          } else {
            fixed = { ...fixed, coordMarks: fixed.coordMarks.slice(0, Math.max(0, fixed.count)) }
          }
        }
        if (
          fixed.coordLibre &&
          (isReperageDroites(fixed.exerciseType) || isReperageConstruire(fixed.exerciseType)) &&
          (patch.count != null || patch.coordLibre != null)
        ) {
          fixed = {
            ...fixed,
            coordQuestionsLibre: resizeCoordQuestionsLibre(
              fixed.coordQuestionsLibre,
              fixed.count,
              defaultCoordQuestionReply(fixed.exerciseType),
            ),
          }
        }
        if (
          fixed.coordLibre &&
          isTransformationExercise(fixed.exerciseType) &&
          patch.count != null &&
          fixed.coordMarks?.length
        ) {
          const omega = fixed.coordMarks.find((mark) => mark.label === 'Ω')
          const figure = fixed.coordMarks
            .filter((mark) => mark.label !== 'Ω')
            .slice(0, Math.min(fixed.count, TRANSFORM_MAX_POINTS))
          fixed = {
            ...fixed,
            coordMarks: omega ? [...figure, omega] : figure,
          }
        }
        return setPageBlock(merged, safeBlockIndex, fixed)
      }),
    )

  // Mode libre Gattegno : synchronise le brouillon éditable après un nouveau tirage.
  useEffect(() => {
    if (activeBlock.verbGroup !== 'libre') return
    if (!isPhraseLibreEditable(activeBlock.exerciseType)) return
    if (activeBlock.phraseItems && activeBlock.phraseItems.length > 0) return
    const block = activeSheet?.blocks[safeBlockIndex]
    if (!block) return
    const items = block.items
    const instruction = block.instruction
    setPages((current) =>
      current.map((page, index) =>
        index === pageIndex
          ? setPageBlock(page, safeBlockIndex, {
              phraseItems: items,
              phraseInstruction: instruction,
            })
          : page,
      ),
    )
  }, [
    activeBlock.verbGroup,
    activeBlock.exerciseType,
    activeBlock.phraseItems,
    activeBlock.count,
    seed,
    activeSheet,
    safeBlockIndex,
    pageIndex,
  ])

  // Mode libre droites / construire : initialise les questions depuis le tirage courant.
  useEffect(() => {
    if (!activeBlock.coordLibre) return
    if (!isReperageDroites(activeBlock.exerciseType) && !isReperageConstruire(activeBlock.exerciseType)) {
      return
    }
    if (activeBlock.coordQuestionsLibre && activeBlock.coordQuestionsLibre.length > 0) return
    const block = activeSheet?.blocks[safeBlockIndex]
    const fromSheet = block?.items[0]?.coordQuestions
    if (!fromSheet?.length) return
    setPages((current) =>
      current.map((page, index) =>
        index === pageIndex
          ? setPageBlock(page, safeBlockIndex, {
              coordQuestionsLibre: resizeCoordQuestionsLibre(
                fromSheet,
                activeBlock.count,
                defaultCoordQuestionReply(activeBlock.exerciseType),
              ),
            })
          : page,
      ),
    )
  }, [
    activeBlock.coordLibre,
    activeBlock.exerciseType,
    activeBlock.coordQuestionsLibre,
    activeBlock.count,
    seed,
    activeSheet,
    safeBlockIndex,
    pageIndex,
  ])

  const toggleDraftGrid = (itemIndex: number, targetBlock = safeBlockIndex) => {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== pageIndex) return page
        const block = pageBlocks(page)[targetBlock] ?? blockFromPage(page)
        const grids = resizeDraftGrids(block.problemDraftGrids, block.count)
        grids[itemIndex] = !(grids[itemIndex] ?? true)
        return setPageBlock(page, targetBlock, { problemDraftGrids: grids })
      }),
    )
  }

  const cycleOralAnswerMode = (itemIndex: number, targetBlock = safeBlockIndex) => {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== pageIndex) return page
        const block = pageBlocks(page)[targetBlock] ?? blockFromPage(page)
        const modes = resizeOralAnswerModes(block.oralAnswerModes, block.count)
        const sheet = worksheets[safeSheetIndex]
        const sheetBlock = sheet?.blocks[targetBlock]
        const item = sheetBlock?.items[itemIndex]
        const imagesAvailable = Boolean(item?.imagesAvailable)
        const offset = sheetBlock?.itemOffset ?? (sheet?.isContinuation ? 4 : 0)
        const modeIndex = itemIndex + offset
        modes[modeIndex] = cycleOralMode(modes[modeIndex] ?? 'qcm', imagesAvailable)
        return setPageBlock(page, targetBlock, { oralAnswerModes: modes })
      }),
    )
  }

  const selectTcfForm = (itemIndex: number, form: TcfTypeReponse, targetBlock = safeBlockIndex) => {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== pageIndex) return page
        const block = pageBlocks(page)[targetBlock] ?? blockFromPage(page)
        const sheet = worksheets[safeSheetIndex]
        const sheetBlock = sheet?.blocks[targetBlock]
        const offset = sheetBlock?.itemOffset ?? 0
        const modeIndex = itemIndex + offset
        const len = Math.max(block.tcfFormModes?.length ?? 0, modeIndex + 1, sheetBlock?.items.length ?? 0)
        const modes: Array<TcfTypeReponse | undefined> = Array.from({ length: len }, (_, i) => block.tcfFormModes?.[i])
        modes[modeIndex] = form
        return setPageBlock(page, targetBlock, { tcfFormModes: modes })
      }),
    )
  }

  const toggleTcfPageBreak = (itemIndex: number, targetBlock = safeBlockIndex) => {
    setPages((current) =>
      current.map((page, index) => {
        if (index !== pageIndex) return page
        const block = pageBlocks(page)[targetBlock] ?? blockFromPage(page)
        const sheet = worksheets[safeSheetIndex]
        const sheetBlock = sheet?.blocks[targetBlock]
        const offset = sheetBlock?.itemOffset ?? 0
        const modeIndex = itemIndex + offset
        const totalItems = Math.max(
          block.tcfPageBreakAfter?.length ?? 0,
          modeIndex + 1,
          activeSheet?.blocks[targetBlock]?.items.length ?? 0,
        )
        const breaks = Array.from({ length: totalItems }, (_, i) => block.tcfPageBreakAfter?.[i] ?? false)
        breaks[modeIndex] = !breaks[modeIndex]
        return setPageBlock(page, targetBlock, { tcfPageBreakAfter: breaks })
      }),
    )
  }

  /** Exercice TCF courant (banque / édition) pour télécharger ses audios. */
  function currentTcfExercise(): TcfExercise | undefined {
    if (activeBlock.tcfExercise) return activeBlock.tcfExercise
    const niveau = tcfNiveau
    const slot = tcfSlotByTypeId[activeBlock.exerciseType]
    const legacy = slot ? undefined : tcfTypeByTypeId[activeBlock.exerciseType]
    if (!slot && !legacy) return undefined
    const bank = slot
      ? tcfSlotBank(niveau, slot)
      : tcfBank(niveau, legacy!.competence, legacy!.typeExercice)
    const shownId =
      activeSheet?.blocks[safeBlockIndex]?.items.find((item) => item.tcfExerciseId)?.tcfExerciseId
    const id = activeBlock.tcfBankId ?? shownId
    return id ? bank.find((ex) => ex.id === id) : bank[0]
  }

  async function downloadActiveTcfAudios() {
    const ex = currentTcfExercise()
    if (!ex) return
    const refs = tcfExerciseAudioRefs(ex)
    if (refs.length === 0) return
    const exerciseNo =
      activeSheet?.blocks[safeBlockIndex]?.exerciseIndex ??
      activeBlock.exerciseNo ??
      pageIndex + 1
    try {
      await downloadTcfAudios({
        niveau: ex.niveau,
        competence: ex.competence as TcfCompetence,
        exerciseNo,
        audioRefs: refs,
      })
    } catch {
      // Échec réseau / fichier manquant : silencieux (l’enseignant·e voit l’absence de téléchargement).
    }
  }

  /** Playlists audio TCM CFR du test entier (ex. 1 nombres + ex. 2 multiplications). */
  function currentTcmCfrAudioPlaylists(): string[][] {
    return worksheets.flatMap((sheet) =>
      sheet.blocks.flatMap((block) =>
        block.items
          .map((item) => item.audioParts ?? (item.audioSrc ? [item.audioSrc] : []))
          .filter((parts): parts is string[] => parts.length > 0),
      ),
    )
  }

  async function downloadActiveTcmCfrAudios() {
    const playlists = currentTcmCfrAudioPlaylists()
    if (playlists.length === 0) return
    try {
      await downloadTcmCfrAudios(playlists)
    } catch {
      // Échec réseau / fichier manquant : silencieux.
    }
  }

  /** Mots affichés du type 1 Soutien (pour l’audio téléchargeable). */
  function currentSoutienMotsWords(): string[] {
    const fromSheet =
      activeSheet?.blocks[safeBlockIndex]?.items.find((item) => item.layout === 'vocab-table')
        ?.vocabEntries ?? []
    const labels = fromSheet.map((e) => e.label.trim()).filter(Boolean)
    if (labels.length > 0) return labels
    if (activeBlock.soutienMotsLibre && activeBlock.soutienMotsEntries?.length) {
      return activeBlock.soutienMotsEntries.map((e) => e.label.trim()).filter(Boolean)
    }
    return soutienType1Words
  }

  /** Métadonnées pour le nom de fichier audio Soutien FR. */
  function soutienAudioFileMeta(): {
    themeLabel: string
    letterLabel: string
    exerciseNo: number
  } {
    const sel =
      resolveSoutienSelection(activeBlock.topic, activeBlock.exerciseType) ??
      (activeBlock.exerciseType
        ? (() => {
            const bankId = parseSoutienType(activeBlock.exerciseType)?.bankId
            return bankId ? findSoutienByBankId(bankId) : null
          })()
        : null)
    const exerciseNo =
      activeSheet?.blocks[safeBlockIndex]?.exerciseIndex ??
      activeBlock.exerciseNo ??
      firstExerciseNo + safeBlockIndex
    return {
      themeLabel: sel?.theme.label ?? 'Soutien',
      letterLabel: sel?.letter.letterUpper ?? sel?.letter.label ?? 'X',
      exerciseNo,
    }
  }

  async function downloadActiveSoutienMotsAudio() {
    const words = currentSoutienMotsWords()
    if (words.length === 0) return
    const meta = soutienAudioFileMeta()
    try {
      await downloadSoutienMotsAudio({ words, ...meta })
    } catch {
      // Échec réseau / fichier manquant : silencieux.
    }
  }

  /** Mots du type 5 (compléter) pour l’audio téléchargeable. */
  function currentSoutienCompleterWords(): string[] {
    const fromSheet =
      activeSheet?.blocks[safeBlockIndex]?.items.find(
        (item) => item.layout === 'syllable-complete',
      )?.syllableCompletes ?? []
    const labels = fromSheet.map((e) => e.word.trim()).filter(Boolean)
    if (labels.length > 0) return labels
    if (activeBlock.soutienCompleterLibre && activeBlock.soutienCompleterEntries?.length) {
      return activeBlock.soutienCompleterEntries.map((e) => e.word.trim()).filter(Boolean)
    }
    return []
  }

  async function downloadActiveSoutienCompleterAudio() {
    const words = currentSoutienCompleterWords()
    if (words.length === 0) return
    const meta = soutienAudioFileMeta()
    try {
      await downloadSoutienCompleterAudio({ words, ...meta })
    } catch {
      // Échec réseau / fichier manquant : silencieux.
    }
  }

  /** Mots + audios des types 6 / 7 / 8 pour la playlist téléchargeable. */
  function currentSoutienEcouterWords(): {
    words: string[]
    audioSrcs: string[]
  } {
    const blockItems = activeSheet?.blocks[safeBlockIndex]?.items ?? []
    const listen = blockItems.find((row) => row.layout === 'listen-check')
    if (listen) {
      const words = (listen.options ?? []).map((w) => w.trim()).filter(Boolean)
      const audioSrcs = (listen.optionAudioSrcs ?? []).map((src) => src ?? '')
      return { words, audioSrcs }
    }
    const syllabe = blockItems.find((row) => row.layout === 'syllable-sound')
    if (syllabe?.syllableSoundItems?.length) {
      const words = syllabe.syllableSoundItems.map((row) => row.word.trim()).filter(Boolean)
      const audioSrcs = syllabe.syllableSoundItems.map((row) => row.audioSrc ?? '')
      return { words, audioSrcs }
    }
    const phrase = blockItems.find((row) => row.layout === 'phrase-scramble')
    if (phrase?.phraseScrambles?.length) {
      const words = phrase.phraseScrambles.map((row) => row.word.trim()).filter(Boolean)
      const audioSrcs = phrase.phraseScrambles.map((row) => row.audioSrc ?? '')
      return { words, audioSrcs }
    }
    return { words: [], audioSrcs: [] }
  }

  async function downloadActiveSoutienEcouterAudio() {
    const { words, audioSrcs } = currentSoutienEcouterWords()
    if (words.length === 0) return
    const parsed = parseSoutienType(activeBlock.exerciseType)
    const bankId = parsed?.bankId ?? 'ecouter'
    const bank = soutienBankById(bankId)
    const meta = soutienAudioFileMeta()
    const consigneSrc =
      parsed?.kind === 'syllabe-son'
        ? SOUTIEN_SYLLABE_SON_CONSIGNE
        : parsed?.kind === 'lettres-phrase'
          ? SOUTIEN_LETTRES_PHRASE_CONSIGNE
          : undefined
    /** Types 6–8 : annoncer le son après la consigne ; type 9 = phrases seules. */
    const withSon = parsed?.kind !== 'lettres-phrase'
    try {
      await downloadSoutienEcouterAudio({
        words,
        audioSrcs,
        phoneme: withSon ? bank?.sound : undefined,
        consigneSrc,
        ...meta,
      })
    } catch {
      // Échec réseau / fichier manquant : silencieux.
    }
  }

  const setAllDraftGrids = (value: boolean) => {
    updatePage({
      problemDraftGrids: Array.from({ length: activeBlock.count }, () => value),
    })
  }

  /** TCM : afficher ou masquer toutes les grilles de calcul de toutes les pages. */
  const setAllTcmDraftGrids = (value: boolean) => {
    setPages((current) =>
      current.map((page) => {
        if (!isTcmDomain(page.domain) && !isTcmCfrDomain(page.domain)) return page
        let next = page
        pageBlocks(page).forEach((block, bi) => {
          if (!isDraftPadExercise(block.exerciseType)) return
          next = setPageBlock(next, bi, {
            problemDraftGrids: Array.from({ length: block.count }, () => value),
          })
        })
        return next
      }),
    )
  }

  const isReperage = isReperagePage(activeBlock.exerciseType)
  const isPhraseChart =
    activeBlock.topic === 'phrase-tableaux' || activeBlock.exerciseType.startsWith('phrase-tableau-')
  const isVocabLearn = isVocabLearnType(activeBlock.exerciseType)
  const isVocabPool = isVocabPoolType(activeBlock.exerciseType)
  const isVocabProd = isVocabProductionType(activeBlock.exerciseType)
  const isGramTheory = isGrammarTheoryType(activeBlock.exerciseType)
  const isPhraseDomain = activePage.domain === 'gattegno'
  const isJeuxDomain = activePage.domain === 'jeux'
  const isCalliDomain = activePage.domain === 'calligraphie'
  const isSoutienFr = activePage.domain === 'soutien-fr'
  const isTcm = isTcmDomain(activePage.domain)
  const isTcmCfr = isTcmCfrDomain(activePage.domain)
  /** TCM / TCM CFR : test multi-pages packé, UI simplifiée. */
  const isTcmLike = isTcm || isTcmCfr
  const isTcf = activePage.domain === TCF_DOMAIN
  /** Page 1 Informations (TCM / CFR / CSC) : pas de Questions ni Colonnes. */
  const isTcmInfoPage = isTcmFamilyConsignesType(activeBlock.exerciseType)
  const tcfNiveau = tcfNiveauFromDifficulty(activeBlock.difficulty)
  const soutienParsed = isSoutienFr ? parseSoutienType(activeBlock.exerciseType) : null
  const soutienKind = soutienParsed?.kind
  const soutienSelection = isSoutienFr
    ? resolveSoutienSelection(activeBlock.topic, activeBlock.exerciseType)
    : null
  const isSoutienMots = soutienKind === 'mots'
  const isSoutienMotsMeles = soutienKind === 'mots-meles'
  const isSoutienCompleter = soutienKind === 'completer'
  const isSoutienEcouter =
    soutienKind === 'ecouter' ||
    soutienKind === 'ecouter-image' ||
    soutienKind === 'syllabe-son' ||
    soutienKind === 'lettres-phrase'
  const isSoutienRelier = soutienKind === 'relier'
  const isSoutienLignes = soutienKind === 'lettres' || soutienKind === 'syllabes'
  /** Types 4–11 / 15 : le champ compte des mots (pas des « questions » génériques). */
  const isSoutienMotsCount =
    soutienKind === 'relier' ||
    soutienKind === 'completer' ||
    soutienKind === 'ecouter' ||
    soutienKind === 'ecouter-image' ||
    soutienKind === 'syllabe-son' ||
    soutienKind === 'lettres-phrase' ||
    soutienKind === 'determinants' ||
    soutienKind === 'dictee' ||
    soutienKind === 'associer-audio' ||
    soutienKind === 'associer-image'
  /** Types 5 / 6 / 8 : grille 1–3 colonnes. */
  const isSoutienCols123 =
    soutienKind === 'completer' ||
    soutienKind === 'ecouter' ||
    soutienKind === 'syllabe-son'
  /** Type 7 : grille images 3–5 colonnes (fluide). */
  const isSoutienCols345 = soutienKind === 'ecouter-image'
  const soutienBank = isSoutienFr
    ? soutienBankById(soutienParsed?.bankId ?? soutienSelection?.sound.bankId ?? 'a')
    : undefined
  const soutienType1Words = soutienBank ? type1Words(soutienBank) : []
  /** Pool complet du son (au-delà des 16 défauts) pour le mode libre type 1. */
  const soutienType1WordPool = soutienBank ? type1WordPool(soutienBank) : []
  const calliFrTopic = isCalliDomain ? frTopicFromCalliTopic(activeBlock.topic) : undefined
  const calliIsLibre = isCalliDomain && isCalliLibreTopic(activeBlock.topic)
  const calliIsPhrases = isCalliDomain && isCalliPhrasesType(activeBlock.exerciseType)
  const vocabSubgroups = isVocabPool
    ? vocabSubgroupsFor(activeBlock.topic)
    : calliFrTopic
      ? vocabSubgroupsFor(calliFrTopic)
      : []
  const activeVocabSubgroup =
    activeBlock.vocabSubgroup ??
    vocabSubgroups[0]?.id ??
    (calliFrTopic ? defaultVocabSubgroup(calliFrTopic) : defaultVocabSubgroup(activeBlock.topic))
  const vocabBankWords = isVocabPool
    ? vocabLearnWordsFor(activeBlock.topic, activeVocabSubgroup)
    : calliFrTopic
      ? vocabLearnWordsFor(calliFrTopic, activeVocabSubgroup)
      : []
  const vocabCustomWords = (activeBlock.vocabCustomEntries ?? []) as VocabWordEntry[]
  const vocabLearnWords = [...vocabBankWords, ...vocabCustomWords].sort((a, b) =>
    a.label.localeCompare(b.label, 'fr'),
  )
  const vocabSelectedIds =
    activeBlock.vocabSelected ??
    (isVocabPool
      ? defaultVocabSelected(
          activeBlock.topic,
          activeBlock.vocabRows ?? 3,
          activeBlock.vocabCols ?? 3,
          activeVocabSubgroup,
        )
      : [])
  const usesCefrLevel =
    (isVocabPool && !isVocabLearn) ||
    isCalliDomain ||
    activeBlock.exerciseType.includes('-com-ecrite') ||
    activeBlock.exerciseType.includes('-com-orale')
  const vocabDifficultyOptions = usesCefrLevel
    ? [
        { value: 'facile' as const, label: 'A1 · Simple' },
        { value: 'moyen' as const, label: 'A2 · Moyen' },
        { value: 'avance' as const, label: 'B1 · Avancé' },
      ]
    : DIFFICULTY_OPTIONS
  const calliDefaultCount = calliIsPhrases
    ? defaultCalliPhraseCount(activeBlock.calliSize)
    : defaultCalliWordCount(activeBlock.calliSize)
  const calliFields = normalizeCalliFields(parseCalliLines(activeBlock.calliText), calliDefaultCount)
  const jeuxTemplate = isJeuxDomain ? templateFor(activeBlock.exerciseType) : null
  const jeuxText =
    activeBlock.gameText ??
    entriesToText(activeBlock.exerciseType, activeBlock.gameEntries ?? defaultEntriesFor(activeBlock.exerciseType))
  const isCadrans = isReperageCadrans(activeBlock.exerciseType)
  const isComposer = isReperageComposer(activeBlock.exerciseType)
  const isFormes = isReperageFormes(activeBlock.exerciseType)
  const isDroites = isReperageDroites(activeBlock.exerciseType)
  const isConstruire = isReperageConstruire(activeBlock.exerciseType)
  const isTransform = isTransformationExercise(activeBlock.exerciseType)
  const isTransformCentrale = isTransformationCentrale(activeBlock.exerciseType)
  const isTransformPlacer = isTransformationPlacer(activeBlock.exerciseType)
  const maxQuestions = isComposer
    ? COORD_LETTER_MAX - 1
    : isFormes
      ? COORD_SHAPES.length
      : isTransform
        ? TRANSFORM_MAX_POINTS
        : isReperage
          ? COORD_LETTER_MAX
          : soutienKind === 'lettres'
            ? 15
            : soutienKind === 'syllabes'
              ? 10
              : soutienKind === 'relier'
                ? 16
                : soutienKind === 'completer' || soutienKind === 'syllabe-son'
                  ? 18
                  : soutienKind === 'ecouter' || soutienKind === 'ecouter-image'
                    ? 30
                    : soutienKind === 'lettres-phrase' ||
                        soutienKind === 'determinants' ||
                        soutienKind === 'dictee'
                      ? 16
                      : soutienKind === 'compter' || soutienKind === 'ordre'
                        ? 12
                        : soutienKind === 'lire'
                          ? 20
                          : soutienKind === 'associer-audio' ||
                              soutienKind === 'associer-image'
                            ? 3
                            : 30
  const activeSheetBlock = worksheets[safeSheetIndex]?.blocks[safeBlockIndex]
  const bankQuestionCap = activeSheetBlock?.bankQuestionCap
  const bankOverflow =
    Boolean(bankQuestionCap != null) &&
    (isOralComprehensionExercise(activeBlock.exerciseType) ||
      activeBlock.exerciseType.includes('-com-ecrite')) &&
    activeBlock.count > (bankQuestionCap ?? 0)
  const questionsInputOverflow = questionsOverflow || bankOverflow
  const isQuadType = isQuadExercise(activeBlock.exerciseType)
  const isNumberLibreDomain = activePage.domain === 'algèbre' || activePage.domain === 'géométrie'

  // Mode libre générique : reprend le tirage dans libreItems après Générer / Valider.
  useEffect(() => {
    if (!libreMode) return
    if (isPhraseDomain && isPhraseLibreEditable(activeBlock.exerciseType)) return
    if (isCalliDomain || isJeuxDomain || isTcf) return
    if (activeBlock.libreItems && activeBlock.libreItems.length > 0) return
    const block = activeSheet?.blocks[safeBlockIndex]
    if (!block?.items?.length) return
    setPages((current) =>
      current.map((page, index) =>
        index === pageIndex
          ? setPageBlock(page, safeBlockIndex, {
              libreItems: block.items,
              libreInstruction: block.instruction,
            })
          : page,
      ),
    )
  }, [
    libreMode,
    isPhraseDomain,
    isCalliDomain,
    isJeuxDomain,
    isTcf,
    activeBlock.exerciseType,
    activeBlock.libreItems,
    activeBlock.contentSeed,
    seed,
    activeSheet,
    safeBlockIndex,
    pageIndex,
  ])

  const quadPool = activeBlock.exerciseType.startsWith('volumes-')
    ? VOLUME_QUAD_FIGURES
    : activeBlock.exerciseType.startsWith('aires-')
      ? AREA_QUAD_FIGURES
      : PERI_QUAD_FIGURES
  const activeAsPage = pageAsConfig(activePage, activeBlock)
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
    const cols = clampFormesCols(activeBlock.coordCols ?? coordSizeFor(activeBlock.difficulty).cols, cellMm)
    const rows = clampFormesRows(activeBlock.coordRows ?? coordSizeFor(activeBlock.difficulty).rows, cellMm)
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

  /** Prochain type du même thème (même logique que « + Exercice »). */
  const createNextExerciseBlock = (): ExerciseBlock | null => {
    const currentTypes = typesForTopic(
      activeBlock.topic,
      activePage.domain === 'français' ? (activeBlock.track ?? 'voc') : undefined,
    )
    const currentIdx = currentTypes.findIndex((type) => type.id === activeBlock.exerciseType)
    const nextType =
      currentTypes[(currentIdx + 1) % Math.max(currentTypes.length, 1)] ??
      currentTypes[0] ??
      firstTypeFor(activePage.domain, activeBlock.topic, activeBlock.track)
    if (!nextType) return null
    const fields = applyType(nextType, activeBlock)
    const isSoutienNext = nextType.topic.startsWith('soutien-')
    const count = isSoutienNext
      ? (fields.count ?? 6)
      : Math.min(fields.count ?? 4, 4)
    return {
      topic: nextType.topic,
      exerciseType: nextType.id,
      difficulty: activeBlock.difficulty,
      count,
      columns: fields.columns ?? nextType.preferredColumns ?? 2,
      track: nextType.track,
      verbGroup: activeBlock.verbGroup,
      problemDraftGrids: isProblemExercise(nextType.id)
        ? Array.from({ length: count }, () => true)
        : undefined,
      oralAnswerModes: isOralComprehensionExercise(nextType.id)
        ? Array.from({ length: count }, () => 'qcm' as const)
        : undefined,
      continueOnNextPage:
        nextType.id.includes('-com-orale') || nextType.id.includes('-com-ecrite')
          ? (activeBlock.continueOnNextPage ?? false)
          : undefined,
      vocabSelected: fields.vocabSelected,
      vocabSubgroup: fields.vocabSubgroup,
      vocabCustomEntries: fields.vocabCustomEntries,
      vocabRows: fields.vocabRows,
      vocabCols: fields.vocabCols,
      vocabLineCh: fields.vocabLineCh,
      gameEntries: fields.gameEntries,
      gameText: fields.gameText,
      gameSource: fields.gameSource,
      gameTopic: fields.gameTopic,
      gameSelectedIds: fields.gameSelectedIds,
      gameBackColor: fields.gameBackColor,
      gameSeriesName: fields.gameSeriesName,
      gameBorderId:
        (fields.gameBorderRectoId || fields.gameBorderVersoId || fields.gameBorderId) || undefined,
      // '' = aucune bordure explicite (ne pas replier sur gameBorderId).
      gameBorderRectoId:
        fields.gameBorderRectoId !== undefined
          ? fields.gameBorderRectoId
          : fields.gameBorderId,
      gameBorderVersoId:
        fields.gameBorderVersoId !== undefined
          ? fields.gameBorderVersoId
          : fields.gameBorderId,
      gameFontSize: fields.gameFontSize ?? DEFAULT_GAME_FONT_SIZE,
      gameAlpha: fields.gameAlpha,
      soutienMotsLibre: fields.soutienMotsLibre,
      soutienMotsEntries: fields.soutienMotsEntries,
      soutienCompleterLibre: fields.soutienCompleterLibre,
      soutienCompleterEntries: fields.soutienCompleterEntries,
      calliText: fields.calliText,
      calliFont: fields.calliFont,
      calliSize: fields.calliSize,
      coordLibre: fields.coordLibre,
      coordCols: fields.coordCols,
      coordRows: fields.coordRows,
      coordAxis: fields.coordAxis,
      coordMarks: fields.coordMarks,
      coordRange: fields.coordRange,
      coordCellMm: fields.coordCellMm,
      coordUnitSquares: fields.coordUnitSquares,
      coordOriginCol: fields.coordOriginCol,
      coordOriginRow: fields.coordOriginRow,
      numberLibre: activeBlock.numberLibre,
      numberMin: activeBlock.numberMin,
      numberMax: activeBlock.numberMax,
      numberDecimals: activeBlock.numberDecimals,
      quadLibre: isQuadExercise(nextType.id) ? activeBlock.quadLibre : undefined,
      quadShapes: isQuadExercise(nextType.id) ? activeBlock.quadShapes : undefined,
    }
  }

  const addPage = () => {
    const newBlock = createNextExerciseBlock()
    if (!newBlock) return
    // Nouvelle page = un seul exercice (le suivant), pas une copie de la page précédente.
    const next: PageConfig = {
      domain: activePage.domain,
      ...newBlock,
      extraBlocks: undefined,
    }
    setPages((current) => [...current, next])
    setSheetIndex(worksheets.length)
    setBlockIndex(0)
  }

  const removePage = (configIdx: number) => {
    setPages((current) => {
      if (current.length <= 1) return current
      return current.filter((_, pageIdx) => pageIdx !== configIdx)
    })
    setSheetIndex(0)
    setBlockIndex(0)
  }

  const addExerciseOnPage = () => {
    const newBlock = createNextExerciseBlock()
    if (!newBlock) return
    setPages((current) =>
      current.map((page, index) => (index === pageIndex ? addPageBlock(page, newBlock) : page)),
    )
    setBlockIndex(pageExerciseBlocks.length)
  }

  function changeDomain(next: Domain) {
    if (!accountCanAccessDomain(accessAccount, next)) return
    setBlockIndex(0)
    if (isTcmDomain(next)) {
      setSheetIndex(0)
      setPages(buildTcmTestPages())
      setEvalMode(true)
      setPointsPerQuestion(1)
      setMode('student')
      setInstitutional((current) => ({
        ...current,
        course: 'Mathématiques',
        documentTitle: TCM_DOCUMENT_TITLE,
      }))
      return
    }
    if (isTcmCfrDomain(next)) {
      setSheetIndex(0)
      setPages(buildTcmCfrTestPages())
      setEvalMode(true)
      setPointsPerQuestion(1)
      setMode('student')
      setInstitutional((current) => ({
        ...current,
        course: 'Mathématiques',
        documentTitle: TCM_CFR_DOCUMENT_TITLE,
      }))
      return
    }
    if (next === TCF_DOMAIN) {
      setSheetIndex(0)
      setPages([tcfConsignesPage('A0-A1'), tcfPage(TCF_SLOTS[0]!.typeId, 'A0-A1')])
      setEvalMode(true)
      setPointsPerQuestion(1)
      setMode('student')
      setInstitutional((current) => ({
        ...current,
        course: 'Français',
        documentTitle: TCF_DOCUMENT_TITLE,
      }))
      return
    }
    const type = firstTypeFor(next)
    const leavingTcm =
      isTcmDomain(activePage.domain) ||
      isTcmCfrDomain(activePage.domain) ||
      activePage.domain === TCF_DOMAIN
    if (leavingTcm) {
      setSheetIndex(0)
      setPages([{ ...defaultPage(next), ...applyType(type), domain: next }])
    } else {
      updatePage({ domain: next, ...applyType(type) })
    }
    if (
      next === 'français' ||
      next === 'lecture' ||
      next === 'soutien-fr' ||
      next === 'gattegno' ||
      next === 'grammaire' ||
      next === 'vocabulaire' ||
      next === 'société' ||
      next === 'santé' ||
      next === 'acm' ||
      next === 'jeux' ||
      next === 'calligraphie'
    ) {
      setInstitutional((current) =>
        current.course === 'Mathématiques' ? { ...current, course: 'Français' } : current,
      )
    }
    if (next === 'jeux' || next === 'calligraphie' || next === 'soutien-fr') {
      setEvalMode(false)
      setMode('student')
    }
    if (next === 'soutien-fr') {
      const sel = resolveSoutienSelection(type.topic, type.id)
      if (sel) {
        setInstitutional((current) => ({
          ...current,
          course: 'Français',
          documentTitle: soutienFicheTitle(sel.letter),
        }))
      }
    }
  }

  // Si le domaine actif n’est plus autorisé (grants admin), basculer.
  useEffect(() => {
    if (accountCanAccessDomain(accessAccount, activePage.domain)) return
    const fallback = allowedDomains[0]
    if (!fallback) return
    changeDomain(fallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bascule unique sur domaine / droits
  }, [accessAccount, activePage.domain, allowedDomains])

  // Soutien FR : migrer les anciens topics voyelle (soutien-a…) vers le thème Voyelles.
  useEffect(() => {
    if (activePage.domain !== 'soutien-fr') return
    const sel = resolveSoutienSelection(activeBlock.topic, activeBlock.exerciseType)
    if (!sel) return
    if (activeBlock.topic === sel.theme.id) return
    const kind = parseSoutienType(activeBlock.exerciseType)?.kind ?? 'mots'
    const nextId = soutienExerciseTypeId(sel.sound.bankId, kind)
    if (!exerciseTypeById[nextId]) return
    updatePage({ topic: sel.theme.id, exerciseType: nextId })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- normalisation ponctuelle du topic
  }, [activePage.domain, activeBlock.topic, activeBlock.exerciseType])

  function changeTopic(topic: string) {
    if (activePage.domain === 'calligraphie') {
      const kind = isCalliPhrasesType(activeBlock.exerciseType) ? 'calli-phrases' : 'calli-mots'
      const type = { ...exerciseTypeById[kind]!, topic }
      const frTopic = frTopicFromCalliTopic(topic)
      const subgroup = frTopic ? defaultVocabSubgroup(frTopic) : undefined
      updatePage({
        topic,
        ...applyType(type, { ...activeBlock, topic, vocabSubgroup: subgroup, calliText: undefined }),
        vocabSubgroup: subgroup,
      })
      return
    }
    if (activePage.domain === 'jeux') {
      const kind = isJeuxType(activeBlock.exerciseType) ? activeBlock.exerciseType : 'jeux-vocabulaire'
      const type = { ...exerciseTypeById[kind]!, topic }
      updatePage({
        topic,
        ...applyType(type, { ...activeBlock, topic, gameTopic: undefined, gameEntries: undefined, gameText: undefined, gameSelectedIds: undefined }),
      })
      return
    }
    if (activePage.domain === 'soutien-fr') {
      const parsed = parseSoutienType(activeBlock.exerciseType)
      const kind = parsed?.kind ?? 'mots'
      const theme = soutienThemeById(topic)
      const firstLetter = theme?.letters[0]
      const firstSound = firstLetter?.sounds[0]
      const nextId = firstSound
        ? soutienExerciseTypeId(firstSound.bankId, kind)
        : `soutien-a-${kind}`
      const type = exerciseTypeById[nextId] ?? firstTypeFor('soutien-fr', topic)
      if (firstLetter) {
        setInstitutional((current) => ({
          ...current,
          course: 'Français',
          documentTitle: soutienFicheTitle(firstLetter),
        }))
      }
      // Changer de thème : première lettre, repartir de la banque.
      updatePage({
        topic,
        ...applyType(type, {
          ...activeBlock,
          topic,
          soutienMotsLibre: false,
          soutienMotsEntries: undefined,
          soutienCompleterLibre: false,
          soutienCompleterEntries: undefined,
        }),
      })
      return
    }
    const type =
      typesForTopic(topic, activePage.domain === 'français' ? (activeBlock.track ?? 'voc') : undefined)[0] ??
      firstTypeFor(activePage.domain, topic, activeBlock.track)
    updatePage({ topic, ...applyType(type) })
  }

  function changeSoutienLetter(letterId: string) {
    if (!soutienSelection) return
    const letter = soutienSelection.theme.letters.find((l) => l.id === letterId)
    if (!letter) return
    const sound = letter.sounds[0]!
    const kind = soutienParsed?.kind ?? 'mots'
    const nextId = soutienExerciseTypeId(sound.bankId, kind)
    const type = exerciseTypeById[nextId]
    if (!type) return
    setInstitutional((current) => ({
      ...current,
      course: 'Français',
      documentTitle: soutienFicheTitle(letter),
    }))
    updatePage({
      topic: soutienSelection.theme.id,
      ...applyType(type, {
        ...activeBlock,
        topic: soutienSelection.theme.id,
        soutienMotsLibre: false,
        soutienMotsEntries: undefined,
        soutienCompleterLibre: false,
        soutienCompleterEntries: undefined,
      }),
    })
  }

  function changeSoutienSound(soundId: string) {
    if (!soutienSelection) return
    const sound = soutienSelection.letter.sounds.find((s) => s.id === soundId)
    if (!sound) return
    const kind = soutienParsed?.kind ?? 'mots'
    const nextId = soutienExerciseTypeId(sound.bankId, kind)
    const type = exerciseTypeById[nextId]
    if (!type) return
    setInstitutional((current) => ({
      ...current,
      course: 'Français',
      documentTitle: soutienFicheTitle(soutienSelection.letter),
    }))
    updatePage({
      topic: soutienSelection.theme.id,
      ...applyType(type, {
        ...activeBlock,
        topic: soutienSelection.theme.id,
        soutienMotsLibre: false,
        soutienMotsEntries: undefined,
        soutienCompleterLibre: false,
        soutienCompleterEntries: undefined,
      }),
    })
  }

  /** Applique les changements manuels (mode libre / réglages) à la fiche. */
  function validateManual() {
    const phraseEditable = isPhraseDomain && isPhraseLibreEditable(activeBlock.exerciseType)
    const ownEditor = phraseEditable || isCalliDomain || isJeuxDomain || isTcf
    const apply = (current: PageConfig[]): PageConfig[] => {
      const page = current[pageIndex]
      if (!page) return current
      const block = pageBlocks(page)[safeBlockIndex]
      if (!block) return current
      const nextLocal = (block.contentSeed ?? 0) + 1

      if (libreMode && phraseEditable && Array.isArray(block.phraseItems) && block.phraseItems.length > 0) {
        return current.map((p, i) =>
          i !== pageIndex
            ? p
            : setPageBlock(p, safeBlockIndex, {
                contentSeed: nextLocal,
                phraseItems: block.phraseItems!.map((item) => ({ ...item })),
                phraseInstruction: block.phraseInstruction,
                libreItems: undefined,
                libreInstruction: undefined,
              }),
        )
      }

      // Éditeur dédié (TCF, calligraphie, jeux, phrases) : ses valeurs sont déjà dans la page ;
      // on retire tout contenu figé pour que l’aperçu se reconstruise à partir d’elles.
      if (libreMode && ownEditor) {
        return current.map((p, i) =>
          i !== pageIndex ? p : setPageBlock(p, safeBlockIndex, { libreItems: undefined, libreInstruction: undefined }),
        )
      }

      // Contenu libre déjà saisi : on le fige explicitement (nouvelles refs) pour forcer l’aperçu.
      if (libreMode && Array.isArray(block.libreItems) && block.libreItems.length > 0) {
        return current.map((p, i) =>
          i !== pageIndex
            ? p
            : setPageBlock(p, safeBlockIndex, {
                contentSeed: nextLocal,
                libreItems: block.libreItems!.map((item) => ({ ...item })),
                libreInstruction: block.libreInstruction,
              }),
        )
      }
      if (libreMode && Array.isArray(block.phraseItems) && block.phraseItems.length > 0) {
        return current.map((p, i) =>
          i !== pageIndex
            ? p
            : setPageBlock(p, safeBlockIndex, {
                contentSeed: nextLocal,
                phraseItems: block.phraseItems!.map((item) => ({ ...item })),
                phraseInstruction: block.phraseInstruction,
              }),
        )
      }

      // Sinon : régénère avec les paramètres courants, puis reprend le résultat en overlay libre.
      const cleared = setPageBlock(page, safeBlockIndex, {
        contentSeed: nextLocal,
        libreItems: undefined,
        libreInstruction: undefined,
      })
      if (!libreMode) {
        return current.map((p, i) => (i !== pageIndex ? p : cleared))
      }
      const built = buildWorksheets(
        current.map((p, i) => (i !== pageIndex ? p : cleared)),
        seed,
      )[pageIndex]
      const builtBlock = built?.blocks[safeBlockIndex]
      if (!builtBlock) {
        return current.map((p, i) => (i !== pageIndex ? p : cleared))
      }
      return current.map((p, i) =>
        i !== pageIndex
          ? p
          : setPageBlock(cleared, safeBlockIndex, {
              libreItems: builtBlock.items.map((item) => ({ ...item })),
              libreInstruction: builtBlock.instruction,
            }),
      )
    }
    const next = apply(pages)
    setPages(next)
    if (libreMode) setLibreSnapshot(next)
  }

  /** TCF : Générer tire un test complet au hasard dans la banque du niveau. */
  function drawTcfTest() {
    const nextSeed = randomSeed()
    setSeed(nextSeed)
    setMode('student')
    setSheetIndex(0)
    setBlockIndex(0)
    setPages(buildTcfRandomTestPages(tcfNiveau, nextSeed))
  }

  /** Soutien FR : Générer prépare les 12 fiches du son sélectionné. */
  function drawSoutienSeries() {
    const sel =
      soutienSelection ??
      resolveSoutienSelection(activeBlock.topic, activeBlock.exerciseType)
    if (!sel) {
      generate()
      return
    }
    const nextSeed = randomSeed()
    setSeed(nextSeed)
    setMode('student')
    setEvalMode(false)
    setSheetIndex(0)
    setBlockIndex(0)
    setInstitutional((current) => ({
      ...current,
      course: 'Français',
      documentTitle: soutienFicheTitle(sel.letter),
    }))
    setPages(buildSoutienSeriesPages(sel.sound.bankId, sel.theme.id))
  }

  function generate() {
    const nextSeed = randomSeed()
    setSeed(nextSeed)
    setMode('student')
    if (isCalligraphieType(activeBlock.exerciseType)) {
      const nextText = reshuffleCalliContent(nextSeed, {
        exerciseType: activeBlock.exerciseType,
        topic: activeBlock.topic,
        difficulty: activeBlock.difficulty,
        calliText: activeBlock.calliText,
        calliFont: activeBlock.calliFont,
        calliSize: activeBlock.calliSize,
        vocabSubgroup: activeBlock.vocabSubgroup,
        countHint: Math.max(parseCalliLines(activeBlock.calliText).length, calliFields.length),
      })
      updatePage({ calliText: nextText, contentSeed: nextSeed })
      return
    }
    if (activeBlock.verbGroup === 'libre' && isPhraseLibreEditable(activeBlock.exerciseType)) {
      // Nouveau tirage banque → l’effet resynchronise phraseItems.
      updatePage({ phraseItems: undefined, phraseInstruction: undefined, contentSeed: nextSeed })
      return
    }
    if (isJeuxType(activeBlock.exerciseType)) {
      const reshuffled = reshuffleGameContent(activeBlock.exerciseType, nextSeed, {
        gameSource: activeBlock.gameSource,
        gameTopic: activeBlock.gameTopic,
        gameSelectedIds: activeBlock.gameSelectedIds,
        gameEntries: activeBlock.gameEntries,
      })
      updatePage({
        gameEntries: reshuffled.gameEntries,
        gameText: reshuffled.gameText,
        gameSelectedIds: reshuffled.gameSelectedIds,
        contentSeed: nextSeed,
      })
      return
    }
    // Maths / autres : nouveau tirage (lève l’overlay libre pour que la graine s’applique).
    if (libreMode) {
      updatePage({
        contentSeed: nextSeed,
        libreItems: undefined,
        libreInstruction: undefined,
      })
      return
    }
    updatePage({ contentSeed: nextSeed })
  }

  /** Régénère uniquement l’exercice ciblé (les autres blocs / pages restent inchangés). */
  function regenerateBlock(targetBlock: number) {
    const nextSeed = randomSeed()
    setMode('student')
    setBlockIndex(targetBlock)
    setPages((current) =>
      current.map((page, index) => {
        if (index !== pageIndex) return page
        const block = pageBlocks(page)[targetBlock]
        if (!block) return page
        let patch: Partial<ExerciseBlock> = { contentSeed: nextSeed }
        if (isCalligraphieType(block.exerciseType)) {
          patch = {
            ...patch,
            calliText: reshuffleCalliContent(nextSeed, {
              exerciseType: block.exerciseType,
              topic: block.topic,
              difficulty: block.difficulty,
              calliText: block.calliText,
              calliFont: block.calliFont,
              calliSize: block.calliSize,
              vocabSubgroup: block.vocabSubgroup,
              countHint: Math.max(parseCalliLines(block.calliText).length, 1),
            }),
          }
        } else if (block.verbGroup === 'libre' && isPhraseLibreEditable(block.exerciseType)) {
          patch = {
            ...patch,
            phraseItems: undefined,
            phraseInstruction: undefined,
          }
        } else if (isJeuxType(block.exerciseType)) {
          const reshuffled = reshuffleGameContent(block.exerciseType, nextSeed, {
            gameSource: block.gameSource,
            gameTopic: block.gameTopic,
            gameSelectedIds: block.gameSelectedIds,
            gameEntries: block.gameEntries,
          })
          patch = {
            ...patch,
            gameEntries: reshuffled.gameEntries,
            gameText: reshuffled.gameText,
            gameSelectedIds: reshuffled.gameSelectedIds,
          }
        } else if (page.domain === TCF_DOMAIN) {
          // Relâche le tirage figé pour re-mélanger (ex. 3 thèmes PO).
          patch = {
            ...patch,
            libreItems: undefined,
            libreInstruction: undefined,
          }
        }
        return setPageBlock(page, targetBlock, patch)
      }),
    )
  }

  function setVerbGroup(next: PhraseVerbGroup) {
    const current = activeBlock.verbGroup ?? 'er'
    if (current === next) return
    if (next === 'libre') {
      const block = activeSheet?.blocks[safeBlockIndex]
      updatePage({
        verbGroup: 'libre',
        phraseItems: block?.items,
        phraseInstruction: block?.instruction,
      })
      return
    }
    updatePage({
      verbGroup: next,
      phraseItems: undefined,
      phraseInstruction: undefined,
    })
    setSeed(randomSeed())
  }

  function setCalliFieldAt(index: number, value: string) {
    const next = [...calliFields]
    next[index] = value
    updatePage({ calliText: joinCalliLines(next) })
  }

  function addCalliExtraWord(entry: VocabWordEntry) {
    const word = entry.label.trim()
    if (!word) return
    const base = calliFields.filter((line) => line.trim().length > 0)
    updatePage({ calliText: joinCalliLines([...base, word]) })
  }

  function removeCalliField(index: number) {
    if (calliFields.length <= 1) {
      updatePage({ calliText: '' })
      return
    }
    updatePage({ calliText: joinCalliLines(calliFields.filter((_, i) => i !== index)) })
  }

  function printAll() {
    window.print()
  }

  const chromeProps = {
    institutional,
    evalMode,
    // TCM : total = somme des barèmes de la fiche (plus de plafond fixe à 100).
    documentTotalPoints: sheetTotalPoints,
    pointsPerQuestion,
  } as const

  const sheetProps = {
    mode,
    ...chromeProps,
    onRegenerateBlock: regenerateBlock,
  } as const


  return (
    <div
      className="app-shell"
      style={
        {
          '--purple': themeColor,
          '--lavender': `color-mix(in srgb, ${themeColor} 14%, #fff)`,
          '--theme-on': contrastOnTheme(themeColor),
        } as CSSProperties
      }
    >
      <Header
        onCreate={() => undefined}
        generator
        rightSlot={
          <TopbarTools
            themeColor={themeColor}
            onThemeColor={applyThemeColor}
            footerOpen={footerPanelOpen}
            onToggleFooter={() => setFooterPanelOpen((v) => !v)}
            libreOpen={libreMode}
            onToggleLibre={() => {
              setLibreMode((prev) => {
                const next = !prev
                setLibreSnapshot(next ? pages : null)
                if (next) {
                  const sheetBlock = activeSheet?.blocks[safeBlockIndex]
                  const seedItems = activeBlock.libreItems?.length
                    ? activeBlock.libreItems
                    : (sheetBlock?.items ?? [])
                  const seedInstruction =
                    activeBlock.libreInstruction ?? sheetBlock?.instruction ?? ''
                  const patch: Partial<typeof activeBlock> = {
                    libreItems: seedItems,
                    libreInstruction: seedInstruction,
                  }
                  if (isFormes || isCadrans || isDroites || isConstruire || isTransform) {
                    patch.coordLibre = true
                  }
                  if (isNumberLibreDomain) patch.numberLibre = true
                  if (isPhraseDomain && isPhraseLibreEditable(activeBlock.exerciseType)) {
                    patch.verbGroup = 'libre'
                    patch.phraseItems = activeBlock.phraseItems ?? sheetBlock?.items
                    patch.phraseInstruction =
                      activeBlock.phraseInstruction ?? sheetBlock?.instruction
                  }
                  if (soutienKind === 'mots') patch.soutienMotsLibre = true
                  if (soutienKind === 'completer') patch.soutienCompleterLibre = true
                  updatePage(patch)
                }
                // Fermeture : on garde le contenu libre (pas de régénération de la fiche).
                return next
              })
            }}
            previewMode={mode}
            onTogglePreviewMode={() =>
              setMode((m) => (m === 'student' ? 'answers' : 'student'))
            }
            showPreviewToggle={!(isCalliDomain || isJeuxDomain)}
            onLogout={onLogout}
          />
        }
      />
      <main className="generator-page" id="top">
        <div className="generator-intro">
          <a className="back-link" href="/">
            ← Retour à l’accueil
          </a>
          <p className="eyebrow">Boîte de génération · Mathématiques</p>
          <h1>
            Créez votre fiche
            <br />
            <em>à votre façon.</em>
          </h1>
          <p className="hero-text">Chaque génération crée une nouvelle série d’exercices aléatoires.</p>
        </div>
        <div
          className={`workspace${libreMode ? ' has-libre-panel' : ''}${footerPanelOpen ? ' has-footer-panel' : ''}`}
        >
          <aside className="settings-panel no-print">
            <div className="panel-title">
              <h3>Paramètres de l’activité</h3>
              <span>
                {worksheets.length} feuille{worksheets.length > 1 ? 's' : ''}
                {pages.length !== worksheets.length ? ` · ${pages.length} config.` : ''}
              </span>
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
            <div className="field-group">
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
                {evalMode && !isTcmLike && (
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
                {SHOW_LECTURE_DOMAIN && accessAccount === 'admin' ? (
                  <option value="lecture">Lecture</option>
                ) : null}
              </SelectBox>
              {isTcf ? (
                <SelectBox
                  label="Niveau"
                  value={tcfNiveau}
                  onChange={(value) => {
                    const niveau = TCF_NIVEAUX.find((n) => n.id === value)?.id
                    if (!niveau) return
                    // Un test TCF a un seul niveau : il s’applique à toutes les pages.
                    const difficulty = tcfDifficultyFromNiveau(niveau)
                    setPages((current) =>
                      current.map((page) => ({ ...page, difficulty, tcfBankId: undefined })),
                    )
                  }}
                >
                  {TCF_NIVEAUX.map((n) => (
                    <option value={n.id} key={n.id}>
                      {n.id}
                    </option>
                  ))}
                </SelectBox>
              ) : null}
              {isTcmLike ? null : (
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
              {isSoutienFr && soutienSelection ? (
                <SelectBox
                  label="Lettre"
                  value={soutienSelection.letter.id}
                  onChange={changeSoutienLetter}
                >
                  {soutienSelection.theme.letters.map((letter) => (
                    <option value={letter.id} key={letter.id}>
                      {letter.letterUpper}
                    </option>
                  ))}
                </SelectBox>
              ) : null}
              {isSoutienFr && soutienSelection && soutienSelection.letter.sounds.length > 1 ? (
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
              {isTcmLike || (isTcf && typeChoices.length <= 1) ? null : (
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
                    {type.label}
                  </option>
                ))}
              </SelectBox>
              )}
              {isCalliDomain ? (
                <>
                  <div className="mode-toggle-block">
                    <b>Écriture</b>
                    <div className="mode-toggle" role="group" aria-label="Police d’écriture">
                      {CALLI_FONTS.map((font) => (
                        <button
                          key={font.id}
                          type="button"
                          className={(activeBlock.calliFont ?? DEFAULT_CALLI_FONT) === font.id ? 'active' : ''}
                          onClick={() => updatePage({ calliFont: font.id })}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mode-toggle-block">
                    <b>Taille</b>
                    <div className="mode-toggle is-3" role="group" aria-label="Taille d’écriture">
                      {CALLI_SIZES.map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          className={(activeBlock.calliSize ?? DEFAULT_CALLI_SIZE) === size.id ? 'active' : ''}
                          onClick={() => {
                            const nextText = initialCalliText({
                              exerciseType: activeBlock.exerciseType,
                              topic: activeBlock.topic,
                              difficulty: activeBlock.difficulty,
                              calliSize: size.id,
                              vocabSubgroup: activeBlock.vocabSubgroup,
                            })
                            updatePage({ calliSize: size.id, calliText: nextText })
                          }}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                    <small className="muted">
                      {calliIsPhrases
                        ? 'Phrases : Petit 6 · Moyen 5 · Grand 4 blocs (vous pouvez en ajouter).'
                        : `Mots : Petit ${defaultCalliWordCount('petit')} · Moyen ${defaultCalliWordCount('moyen')} · Grand ${defaultCalliWordCount('grand')} (hauteur d’une bande 4 lignes).`}
                    </small>
                  </div>
                  {calliIsPhrases ? (
                    <SelectBox
                      label="Niveau"
                      value={activeBlock.difficulty ?? 'moyen'}
                      onChange={(value) => updatePage({ difficulty: value as Difficulty })}
                    >
                      {vocabDifficultyOptions.map((opt) => (
                        <option value={opt.value} key={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </SelectBox>
                  ) : null}
                  {!calliIsLibre && vocabSubgroups.length > 1 ? (
                    <SelectBox
                      label="Liste"
                      value={activeVocabSubgroup ?? ''}
                      onChange={(value) => {
                        const nextText = initialCalliText({
                          exerciseType: activeBlock.exerciseType,
                          topic: activeBlock.topic,
                          difficulty: activeBlock.difficulty,
                          calliSize: activeBlock.calliSize,
                          vocabSubgroup: value,
                          countHint: calliFields.length,
                        })
                        updatePage({ vocabSubgroup: value, calliText: nextText })
                      }}
                    >
                      {vocabSubgroups.map((group) => (
                        <option value={group.id} key={group.id}>
                          {group.label}
                        </option>
                      ))}
                    </SelectBox>
                  ) : null}
                  {libreMode ? null : (
                  <div className="quad-libre-block">
                    <b>{calliIsPhrases ? 'Phrases' : 'Mots'}</b>
                    <ul
                      className="calli-fields"
                      aria-label={calliIsPhrases ? 'Phrases à recopier' : 'Mots ou phrases à recopier'}
                    >
                      {calliFields.map((value, index) => (
                        <li className="calli-field-row" key={`calli-field-${index}`}>
                          <span className="calli-field-num">{index + 1}.</span>
                          <input
                            className="pill-input"
                            type="text"
                            value={value}
                            spellCheck
                            aria-label={
                              calliIsPhrases
                                ? `Phrase ${index + 1}`
                                : `Mot ou phrase ${index + 1}`
                            }
                            placeholder={calliIsPhrases ? 'Phrase' : 'Mot ou phrase'}
                            onChange={(event) => setCalliFieldAt(index, event.target.value)}
                          />
                          <button
                            type="button"
                            className="calli-field-remove"
                            aria-label={`Supprimer la ligne ${index + 1}`}
                            onClick={() => removeCalliField(index)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="game-extra-words">
                      <b>{calliIsPhrases ? 'Phrases supplémentaires' : 'Lignes supplémentaires'}</b>
                      <VocabAddWordRow
                        withImage={false}
                        placeholder={calliIsPhrases ? 'Nouvelle phrase' : 'Mot ou phrase'}
                        onAdd={addCalliExtraWord}
                      />
                      <small className="muted">
                        Hors liste · les ajouts dépassent le nombre par défaut.
                      </small>
                    </div>
                    <small className="muted">
                      {calliIsPhrases
                        ? calliIsLibre
                          ? 'Petit 6 · Moyen 5 · Grand 4 blocs · Générer tire dans tout le vocabulaire.'
                          : 'Petit 6 · Moyen 5 · Grand 4 blocs · Générer tire des phrases du thème (A1 / A2 / B1).'
                        : calliIsLibre
                          ? `Petit ${defaultCalliWordCount('petit')} · Moyen ${defaultCalliWordCount('moyen')} · Grand ${defaultCalliWordCount('grand')} · Générer tire des mots ; vous pouvez saisir une phrase.`
                          : `Petit ${defaultCalliWordCount('petit')} · Moyen ${defaultCalliWordCount('moyen')} · Grand ${defaultCalliWordCount('grand')} · Générer tire des mots du thème ; vous pouvez saisir une phrase.`}
                    </small>
                  </div>
                  )}
                </>
              ) : null}
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
              isTcf ||
              isTcmLike ? null : (
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
              {isSoutienMots ? (
                <div className="mode-toggle-block">
                  <b>Contenu</b>
                  <div className="mode-toggle is-2" role="group" aria-label="Source des mots">
                    <button
                      type="button"
                      className={!activeBlock.soutienMotsLibre ? 'active' : ''}
                      onClick={() =>
                        updatePage({ soutienMotsLibre: false, soutienMotsEntries: undefined })
                      }
                    >
                      Banque
                    </button>
                    <button
                      type="button"
                      className={activeBlock.soutienMotsLibre ? 'active' : ''}
                      onClick={() => {
                        const seeded =
                          activeBlock.soutienMotsEntries?.some((e) => e.label.trim())
                            ? activeBlock.soutienMotsEntries
                            : defaultSoutienMotsEntries(soutienType1Words)
                        updatePage({
                          soutienMotsLibre: true,
                          soutienMotsEntries: seeded,
                        })
                      }}
                    >
                      Libre
                    </button>
                  </div>
                  <small className="muted">
                    Libre : choisissez d’autres mots du son, ou changez le mot et l’image.
                  </small>
                  {!libreMode && activeBlock.soutienMotsLibre ? (
                    <SoutienMotsLibreEditor
                      entries={
                        activeBlock.soutienMotsEntries?.length
                          ? activeBlock.soutienMotsEntries
                          : defaultSoutienMotsEntries(soutienType1Words)
                      }
                      suggestedWords={soutienType1WordPool}
                      soundLabel={soutienBank?.sound}
                      onChange={(next) => updatePage({ soutienMotsEntries: next })}
                    />
                  ) : null}
                </div>
              ) : null}
              {isSoutienCompleter ? (
                <div className="mode-toggle-block">
                  <b>Contenu</b>
                  <div className="mode-toggle is-2" role="group" aria-label="Source des mots à compléter">
                    <button
                      type="button"
                      className={!activeBlock.soutienCompleterLibre ? 'active' : ''}
                      onClick={() =>
                        updatePage({
                          soutienCompleterLibre: false,
                          soutienCompleterEntries: undefined,
                        })
                      }
                    >
                      Banque
                    </button>
                    <button
                      type="button"
                      className={activeBlock.soutienCompleterLibre ? 'active' : ''}
                      onClick={() => {
                        const seeded =
                          activeBlock.soutienCompleterEntries?.some((e) => e.word.trim())
                            ? activeBlock.soutienCompleterEntries
                            : defaultSoutienCompleterEntries(soutienBank?.completes ?? [])
                        updatePage({
                          soutienCompleterLibre: true,
                          soutienCompleterEntries: seeded.length
                            ? seeded
                            : defaultSoutienCompleterEntries(soutienBank?.completes ?? []),
                        })
                      }}
                    >
                      Libre
                    </button>
                  </div>
                  <small className="muted">
                    Libre : choisissez la partie à cacher, ou ajoutez mot + image.
                  </small>
                  {!libreMode && activeBlock.soutienCompleterLibre ? (
                    <SoutienCompleterLibreEditor
                      entries={
                        activeBlock.soutienCompleterEntries?.length
                          ? activeBlock.soutienCompleterEntries
                          : defaultSoutienCompleterEntries(soutienBank?.completes ?? [])
                      }
                      suggestedWords={soutienBank?.words ?? []}
                      onChange={(next) => updatePage({ soutienCompleterEntries: next })}
                    />
                  ) : null}
                </div>
              ) : null}
              {isVocabPool ? (
                <>
                  {isVocabLearn ? (
                    <>
                  <div className="mode-toggle-block">
                    <b>Lignes</b>
                    <div className="mode-toggle is-4" role="group" aria-label="Nombre de lignes">
                      {[1, 2, 3, 4].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={(activeBlock.vocabRows ?? 3) === value ? 'active' : ''}
                          onClick={() => updatePage({ vocabRows: value })}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mode-toggle-block">
                    <b>Colonnes</b>
                    <div className="mode-toggle is-4" role="group" aria-label="Nombre de colonnes du tableau">
                      {[1, 2, 3, 4].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={(activeBlock.vocabCols ?? 3) === value ? 'active' : ''}
                          onClick={() => updatePage({ vocabCols: value })}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                    </>
                  ) : null}
                  {isVocabProd ? (
                    <label className="select-shell">
                      <span>Longueur du trait</span>
                      <input
                        className="pill-input"
                        type="number"
                        min={4}
                        max={48}
                        value={activeBlock.vocabLineCh ?? 12}
                        onChange={(event) =>
                          updatePage({
                            vocabLineCh: Math.max(4, Math.min(48, Number(event.target.value) || 12)),
                          })
                        }
                      />
                    </label>
                  ) : null}
                  {vocabSubgroups.length > 1 ? (
                    <SelectBox
                      label="Liste"
                      value={activeVocabSubgroup ?? ''}
                      onChange={(value) => {
                        const nextSelected = defaultVocabSelected(
                          activeBlock.topic,
                          activeBlock.vocabRows ?? 3,
                          activeBlock.vocabCols ?? 3,
                          value,
                        )
                        updatePage({ vocabSubgroup: value, vocabSelected: nextSelected })
                      }}
                    >
                      {vocabSubgroups.map((group) => (
                        <option value={group.id} key={group.id}>
                          {group.label}
                        </option>
                      ))}
                    </SelectBox>
                  ) : null}
                  {vocabLearnWords.length > 0 ? (
                    <div className="quad-libre-block">
                      <b>Mots</b>
                      <div className="vocab-word-list" role="group" aria-label="Mots à afficher">
                        {vocabLearnWords.map((word) => {
                          const selected = vocabSelectedIds.includes(word.id)
                          return (
                            <label key={word.id} className={selected ? 'is-on' : ''}>
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => {
                                  const next = selected
                                    ? vocabSelectedIds.filter((id) => id !== word.id)
                                    : [...vocabSelectedIds, word.id]
                                  updatePage({
                                    vocabSelected: next.length
                                      ? next
                                      : vocabLearnWords.slice(0, 1).map((item) => item.id),
                                  })
                                }}
                              />
                              <span className="vocab-word-label">{word.label}</span>
                            </label>
                          )
                        })}
                      </div>
                      <VocabAddWordRow
                        onAdd={(entry) => {
                          const customs = [...vocabCustomWords, entry]
                          updatePage({
                            vocabCustomEntries: customs,
                            vocabSelected: [...vocabSelectedIds, entry.id],
                          })
                        }}
                      />
                    </div>
                  ) : (
                    <div className="quad-libre-block">
                      <p className="questions-overflow-hint" role="status">
                        Aucun mot dans cette liste. Ajoutez-en un ci-dessous.
                      </p>
                      <VocabAddWordRow
                        onAdd={(entry) => {
                          updatePage({
                            vocabCustomEntries: [...vocabCustomWords, entry],
                            vocabSelected: [...vocabSelectedIds, entry.id],
                          })
                        }}
                      />
                    </div>
                  )}
                </>
              ) : null}
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
              {isPhraseChart ||
              isVocabLearn ||
              isGramTheory ||
              isJeuxDomain ||
              isCalliDomain ||
              isSoutienMots ||
              isTcf ||
              isTcmInfoPage ||
              isSoutienMotsMeles ? null : (
              <label className="select-shell">
                <span>
                  {isTransform
                    ? 'Points'
                    : isReperage
                      ? 'Questions'
                      : isSoutienLignes
                        ? 'Lignes'
                        : isSoutienMotsCount
                          ? 'Mots'
                          : 'QUESTIONS'}
                </span>
                <input
                  className={`pill-input${questionsInputOverflow ? ' is-overflow' : ''}`}
                  aria-label={
                    isSoutienLignes
                      ? 'Nombre de lignes'
                      : isSoutienMotsCount
                        ? 'Nombre de mots'
                        : 'Nombre de questions'
                  }
                  aria-invalid={questionsInputOverflow}
                  title={
                    bankOverflow
                      ? `La banque de cet enregistrement ne contient que ${bankQuestionCap} questions.`
                      : questionsOverflow
                        ? 'Trop de questions pour une seule fiche A4. Réduisez le nombre ou ajoutez une page.'
                        : undefined
                  }
                  type="number"
                  min={1}
                  max={maxQuestions}
                  step={1}
                  value={activeBlock.count}
                  onChange={(event) => {
                    const next = Math.max(
                      1,
                      Math.min(maxQuestions, Number(event.target.value) || 1),
                    )
                    updatePage({ count: next })
                  }}
                />
                {soutienKind === 'lettres' ? (
                  <small className="muted">
                    Nombre de lignes du tableau (8 lettres par ligne, max. 15 · défaut 5).
                  </small>
                ) : null}
                {soutienKind === 'syllabes' ? (
                  <small className="muted">
                    Lignes par bloc (script et Playwrite · 5 syllabes par ligne · défaut 3).
                  </small>
                ) : null}
                {isSoutienRelier ? (
                  <small className="muted">
                    Mots du type 1 uniquement (max. 16 · défaut 12 · 2 colonnes).
                  </small>
                ) : null}
                {isSoutienCompleter && !activeBlock.soutienCompleterLibre ? (
                  <small className="muted">
                    Nombre de mots à compléter (défaut 12 · 2 colonnes · max. 18).
                  </small>
                ) : null}
                {soutienKind === 'ecouter' ? (
                  <small className="muted">
                    Mots à écouter / écrire (défaut 9 · max. 30).
                  </small>
                ) : null}
                {soutienKind === 'ecouter-image' ? (
                  <small className="muted">
                    Images à écouter / cocher (défaut 15 · 5 colonnes · max. 30).
                  </small>
                ) : null}
                {soutienKind === 'syllabe-son' ? (
                  <small className="muted">
                    Cartes (défaut 18 · mots ≥ 2 syllabes · max. 18 · audio téléchargeable).
                  </small>
                ) : null}
                {soutienKind === 'lettres-phrase' ? (
                  <small className="muted">
                    Nombre de phrases (défaut 9 · max. 16 · lettres remélangées à chaque tirage).
                  </small>
                ) : null}
                {soutienKind === 'determinants' ? (
                  <small className="muted">Nombre de phrases (défaut 9 · max. 16).</small>
                ) : null}
                {soutienKind === 'dictee' ? (
                  <small className="muted">Nombre de mots à écrire (défaut 8 · max. 16).</small>
                ) : null}
                {soutienKind === 'compter' ? (
                  <small className="muted">Nombre de phrases à compter (défaut 8 · max. 12).</small>
                ) : null}
                {soutienKind === 'ordre' ? (
                  <small className="muted">
                    Nombre de phrases à remettre en ordre (défaut 9 · max. 12).
                  </small>
                ) : null}
                {soutienKind === 'lire' ? (
                  <small className="muted">Nombre de phrases à lire (défaut 20 · max. 20).</small>
                ) : null}
                {soutienKind === 'associer-audio' ? (
                  <small className="muted">
                    Nombre de séries (8 QR + 8 mots cadrés · défaut 2 · max. 3).
                  </small>
                ) : null}
                {soutienKind === 'associer-image' ? (
                  <small className="muted">
                    Nombre de séries (8 QR + 8 images type 1 · défaut 1 · max. 3).
                  </small>
                ) : null}
                {bankOverflow ? (
                  <p className="questions-overflow-hint" role="status">
                    La banque ne contient que {bankQuestionCap} question
                    {(bankQuestionCap ?? 0) > 1 ? 's' : ''} pour cet enregistrement. Réduisez le
                    nombre ou générez une nouvelle fiche.
                  </p>
                ) : questionsOverflow && !activeBlock.continueOnNextPage ? (
                  <p className="questions-overflow-hint" role="status">
                    Les questions suivantes dépassent de la fiche. Réduisez le nombre, activez le
                    saut de page, ou ajoutez une page.
                  </p>
                ) : null}
              </label>
              )}
              {(isTcmLike &&
                !(
                  isTcmConsignesType(activeBlock.exerciseType) ||
                  isTcmCfrConsignesType(activeBlock.exerciseType)
                )) ||
              (isTcf && evalMode && !isTcfConsignesType(activeBlock.exerciseType)) ? (
                <label className="select-shell">
                  <span>Points par question</span>
                  <input
                    className="pill-input"
                    type="number"
                    inputMode="decimal"
                    min={0.5}
                    max={20}
                    step={0.5}
                    aria-label="Points par question de l’exercice sélectionné"
                    value={activeBlock.pointsPerQuestion ?? 1}
                    onChange={(event) => {
                      const raw = Number(event.target.value.replace(',', '.'))
                      if (!Number.isFinite(raw)) return
                      const next = Math.max(0.5, Math.min(20, Math.round(raw * 2) / 2))
                      updatePage({ pointsPerQuestion: next })
                    }}
                  />
                  <small className="muted">
                    Exercice{' '}
                    {activeSheet?.blocks?.[safeBlockIndex]?.exerciseIndex ?? firstExerciseNo + safeBlockIndex} :{' '}
                    {formatPointsLabel(
                      blockPointsTotal(
                        activeSheet?.blocks?.[safeBlockIndex]?.items ?? [],
                        activeBlock.pointsPerQuestion ?? 1,
                      ),
                    )}{' '}
                    · total du test : {formatPointsLabel(sheetTotalPoints)}
                  </small>
                </label>
              ) : null}
              {isOralComprehensionExercise(activeBlock.exerciseType) ||
              activeBlock.exerciseType.includes('-com-ecrite') ||
              isGramTheory ? (
                <div className="mode-toggle-block">
                  <b>Saut de page</b>
                  <div className="mode-toggle" role="group" aria-label="Saut de page pour les questions">
                    <button
                      type="button"
                      className={!activeBlock.continueOnNextPage ? 'active' : ''}
                      onClick={() => updatePage({ continueOnNextPage: false })}
                    >
                      Une fiche
                    </button>
                    <button
                      type="button"
                      className={activeBlock.continueOnNextPage ? 'active' : ''}
                      onClick={() => updatePage({ continueOnNextPage: true })}
                      title={
                        isGramTheory
                          ? 'La suite de la théorie passe sur la feuille suivante'
                          : 'Les questions au-delà de 4 passent sur la feuille suivante'
                      }
                    >
                      Suite auto
                    </button>
                  </div>
                  {activeBlock.continueOnNextPage ? (
                    <small className="muted">
                      {isGramTheory
                        ? 'Si la théorie dépasse, une feuille « suite » est ajoutée automatiquement.'
                        : 'Au-delà de 4 questions, une feuille « suite » est ajoutée automatiquement.'}
                    </small>
                  ) : null}
                </div>
              ) : null}
              {isSoutienRelier ? (
                <div className="mode-toggle-block">
                  <b>Colonnes</b>
                  <div className="mode-toggle is-2" role="group" aria-label="Nombre de colonnes">
                    {[1, 2].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={(activeBlock.columns ?? 1) === value ? 'active' : ''}
                        onClick={() => updatePage({ columns: value })}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <small className="muted">
                    En 2 colonnes, chaque colonne mélange ses propres mots (sans mélange croisé).
                  </small>
                </div>
              ) : null}
              {isSoutienCols123 ? (
                <div className="mode-toggle-block">
                  <b>Colonnes</b>
                  <div className="mode-toggle is-3" role="group" aria-label="Nombre de colonnes">
                    {[1, 2, 3].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          (activeBlock.columns ?? (soutienKind === 'completer' ? 2 : 3)) ===
                          value
                            ? 'active'
                            : ''
                        }
                        onClick={() => updatePage({ columns: value })}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <small className="muted">Grille fluide : 1, 2 ou 3 colonnes.</small>
                </div>
              ) : null}
              {isSoutienCols345 ? (
                <div className="mode-toggle-block">
                  <b>Colonnes</b>
                  <div className="mode-toggle is-3" role="group" aria-label="Nombre de colonnes">
                    {[3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={(activeBlock.columns ?? 3) === value ? 'active' : ''}
                        onClick={() => updatePage({ columns: value })}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <small className="muted">
                    Grille fluide (pas un tableau fixe) : 3, 4 ou 5 colonnes.
                  </small>
                </div>
              ) : null}
              {isPhraseChart || isVocabLearn || isVocabPool || isGramTheory || isJeuxDomain || isCalliDomain || isSoutienFr || isTcf || isTcmInfoPage ? null : (
              <div className="mode-toggle-block">
                <b>Colonnes</b>
                <div className="mode-toggle is-3" role="group" aria-label="Nombre de colonnes">
                  {[1, 2, 3].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={activeBlock.columns === value ? 'active' : ''}
                      onClick={() => updatePage({ columns: value })}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              )}
              {isFormes ? (
                <div className="coord-libre-panel">
                  <b>Composition du tableau</b>
                  <div className="mode-toggle" role="group" aria-label="Mode du tableau">
                    <button
                      type="button"
                      className={!activeBlock.coordLibre ? 'active' : ''}
                      onClick={() => updatePage({ coordLibre: false })}
                    >
                      Automatique
                    </button>
                    <button
                      type="button"
                      className={activeBlock.coordLibre ? 'active' : ''}
                      onClick={() => {
                        const size = coordSizeFor(activeBlock.difficulty)
                        const empty = !activeBlock.coordMarks?.length
                        updatePage({
                          coordLibre: true,
                          coordCols: empty ? size.cols : (activeBlock.coordCols ?? size.cols),
                          coordRows: empty ? size.rows : (activeBlock.coordRows ?? size.rows),
                          coordAxis: activeBlock.coordAxis ?? 'letters',
                          coordMarks: activeBlock.coordMarks ?? [],
                        })
                      }}
                    >
                      Libre
                    </button>
                    </div>
                  <SelectBox
                    label="Axes"
                    value={activeBlock.coordAxis ?? 'letters'}
                    onChange={(value) => updatePage({ coordAxis: value as CoordAxis })}
                  >
                    <option value="letters">Lettres en bas</option>
                    <option value="letters-y">Lettres à gauche</option>
                    <option value="numeric">Nombres seulement</option>
                  </SelectBox>
                  <div className="coord-size-row">
                    <label>
                      Largeur · max {maxFormesColsForCell(clampFormesCellMm(activeBlock.coordCellMm))}
                      <input
                        className="pill-input"
                        type="number"
                        min={3}
                        max={maxFormesColsForCell(clampFormesCellMm(activeBlock.coordCellMm))}
                        value={activeBlock.coordCols ?? coordSizeFor(activeBlock.difficulty).cols}
                        onChange={(event) => {
                          const cols = clampFormesCols(
                            Number(event.target.value),
                            clampFormesCellMm(activeBlock.coordCellMm),
                          )
                          updatePage({
                            coordCols: cols,
                            coordMarks: (activeBlock.coordMarks ?? []).filter((mark) => mark.x <= cols),
                          })
                        }}
                      />
                    </label>
                    <label>
                      Hauteur · max {maxFormesRowsForCell(clampFormesCellMm(activeBlock.coordCellMm))}
                      <input
                        className="pill-input"
                        type="number"
                        min={3}
                        max={maxFormesRowsForCell(clampFormesCellMm(activeBlock.coordCellMm))}
                        value={activeBlock.coordRows ?? coordSizeFor(activeBlock.difficulty).rows}
                        onChange={(event) => {
                          const rows = clampFormesRows(
                            Number(event.target.value),
                            clampFormesCellMm(activeBlock.coordCellMm),
                          )
                          updatePage({
                            coordRows: rows,
                            coordMarks: (activeBlock.coordMarks ?? []).filter((mark) => mark.y <= rows),
                          })
                        }}
                      />
                    </label>
                  </div>
                  <div className="coord-param-label">
                    Côté du carré
                    <div className="mode-toggle is-3" role="group" aria-label="Côté du carré">
                      {FORMES_CELL_MM_OPTIONS.map((mm) => (
                        <button
                          key={mm}
                          type="button"
                          className={clampFormesCellMm(activeBlock.coordCellMm) === mm ? 'active' : ''}
                          onClick={() => {
                            const cols = clampFormesCols(
                              activeBlock.coordCols ?? coordSizeFor(activeBlock.difficulty).cols,
                              mm,
                            )
                            const rows = clampFormesRows(
                              activeBlock.coordRows ?? coordSizeFor(activeBlock.difficulty).rows,
                              mm,
                            )
                            updatePage({
                              coordCellMm: mm,
                              coordCols: cols,
                              coordRows: rows,
                              coordMarks: (activeBlock.coordMarks ?? []).filter(
                                (mark) => mark.x <= cols && mark.y <= rows,
                              ),
                            })
                          }}
                        >
                          {mm} mm
                        </button>
                      ))}
                    </div>
                  </div>
                  {activeBlock.coordLibre ? (
                    <>
                      <p className="type-hint muted">
                        Les formes sont à droite de la fiche. Cliquez une forme puis une case, ou glissez-la sur le
                        tableau. Chaque forme n’apparaît qu’une fois.
                      </p>
                      <p className="type-hint muted">
                        {(activeBlock.coordMarks?.length ?? 0)} / {COORD_SHAPES.length} forme
                        {COORD_SHAPES.length > 1 ? 's' : ''}
                        {' · '}
                        {FORMES_MAX_BY_MM[clampFormesCellMm(activeBlock.coordCellMm)].cols} ×{' '}
                        {FORMES_MAX_BY_MM[clampFormesCellMm(activeBlock.coordCellMm)].rows} au plus à{' '}
                        {clampFormesCellMm(activeBlock.coordCellMm)} mm.
                      </p>
                      {(activeBlock.coordMarks?.length ?? 0) > 0 ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => updatePage({ coordMarks: [] })}
                        >
                          Vider le tableau
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="type-hint muted">
                      Une seule grille centrée. Chaque forme n’apparaît qu’une fois. Le champ Questions ajoute des
                      formes. Maximum : 16 × 12 à 10 mm, 21 × 15 à 8 mm, 26 × 20 à 6 mm. Les colonnes 1 / 2 / 3
                      séparent les questions, pas le tableau.
                    </p>
                  )}
                </div>
              ) : isCadrans ? (
                <div className="coord-libre-panel">
                  <b>{isComposer ? 'Composer les points' : 'Repère (4 cadrans)'}</b>
                  <div className="mode-toggle" role="group" aria-label="Mode du repère">
                    <button
                      type="button"
                      className={!activeBlock.coordLibre ? 'active' : ''}
                      onClick={() => updatePage({ coordLibre: false })}
                    >
                      Automatique
                    </button>
                    <button
                      type="button"
                      className={activeBlock.coordLibre ? 'active' : ''}
                      onClick={() => {
                        const grid = resolveAxesGrid(activeAsPage, activeBlock.difficulty)
                        updatePage({
                          coordLibre: true,
                          coordCols: grid.cols,
                          coordRows: grid.rows,
                          coordCellMm: grid.cellMm,
                          coordUnitSquares: grid.unitSquares,
                          coordMarks: activeBlock.coordMarks ?? [],
                          coordOriginCol: activeBlock.coordOriginCol ?? Math.round(grid.cols / 2),
                          coordOriginRow: activeBlock.coordOriginRow ?? Math.round(grid.rows / 2),
                        })
                      }}
                    >
                      Libre
                    </button>
                  </div>
                  <ReperageAxesFields
                    cols={activeBlock.coordCols ?? axesGrid.cols}
                    rows={activeBlock.coordRows ?? axesGrid.rows}
                    cellMm={axesGrid.cellMm}
                    unitSquares={axesGrid.unitSquares}
                    onChange={updateAxesGrid}
                    onLiveCols={(n) => updatePage({ coordCols: n })}
                    onLiveRows={(n) => updatePage({ coordRows: n })}
                  />
                  {activeBlock.coordLibre ? (
                    <>
                      {isComposer ? (
                        <div className="mode-toggle is-3" role="group" aria-label="Outil de placement">
                          <button
                            type="button"
                            className={coordTool === 'origin' ? 'active' : ''}
                            onClick={() => setCoordTool('origin')}
                          >
                            Origine
                          </button>
                          <button
                            type="button"
                            className={coordTool === 'given' ? 'active' : ''}
                            onClick={() => setCoordTool('given')}
                          >
                            Point donné
                          </button>
                          <button
                            type="button"
                            className={coordTool === 'points' ? 'active' : ''}
                            onClick={() => setCoordTool('points')}
                          >
                            Autres points
                          </button>
                        </div>
                      ) : null}
                      <div className="coord-axes-editor">
                        <CoordGrid
                          scene={sceneFromAxesLibre(activeAsPage, activeBlock.difficulty)}
                          editable
                          placingOrigin={isComposer && coordTool === 'origin'}
                          onPlace={(x, y) => placeCoordMark(x, y, 'point')}
                          onPlaceOrigin={placeOrigin}
                          onRemove={removeCoordMark}
                        />
                      </div>
                      <p className="type-hint muted">
                        {isComposer
                          ? 'Placez l’origine (invisible sur la fiche), un point donné avec ses coordonnées, puis les autres points à lire. Le champ Questions limite les points à compléter (26 lettres au plus).'
                          : 'Cliquez une intersection pour poser A, B, C… Le champ Questions limite le nombre de points. Cliquez un point pour le retirer. Colonnes et lignes restent paires.'}
                      </p>
                      <p className="type-hint muted">
                        {isComposer
                          ? `${(activeBlock.coordMarks ?? []).filter((mark) => !mark.given).length} / ${activeBlock.count} point${activeBlock.count > 1 ? 's' : ''} à lire`
                          : `${activeBlock.coordMarks?.length ?? 0} / ${activeBlock.count} point${activeBlock.count > 1 ? 's' : ''}`}
                      </p>
                      {(activeBlock.coordMarks?.length ?? 0) > 0 ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => updatePage({ coordMarks: [] })}
                        >
                          Vider le repère
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="type-hint muted">
                      {isComposer
                        ? 'Une grille sans axes x / y. L’origine est placée au hasard. Un point est donné avec ses coordonnées ; les autres se complètent comme pour lire les cadrans.'
                        : 'Une seule grille à 4 cadrans, centrée. Colonnes et lignes (nombres pairs) font grandir le tableau ; les carrés restent à 3, 4 ou 5 mm (56, 42 ou 34 colonnes au plus). Les colonnes 1 / 2 / 3 séparent les questions, pas le tableau.'}
                    </p>
                  )}
                </div>
              ) : isDroites || isConstruire || isTransform ? (
                <div className="coord-libre-panel">
                  <b>
                    {isDroites
                      ? 'Repère (droites)'
                      : isTransform
                        ? 'Repère (transformations)'
                        : 'Repère (construction)'}
                  </b>
                  {isTransform || isDroites || isConstruire ? (
                    <div
                      className="mode-toggle"
                      role="group"
                      aria-label={
                        isTransform
                          ? 'Mode de la figure'
                          : 'Mode des questions'
                      }
                    >
                      <button
                        type="button"
                        className={!activeBlock.coordLibre ? 'active' : ''}
                        onClick={() =>
                          updatePage({
                            coordLibre: false,
                            coordMarks: isTransform ? [] : activeBlock.coordMarks,
                            coordQuestionsLibre: undefined,
                          })
                        }
                      >
                        Automatique
                      </button>
                      <button
                        type="button"
                        className={activeBlock.coordLibre ? 'active' : ''}
                        onClick={() => {
                          if (isTransform) {
                            const sceneMarks =
                              activeSheet?.blocks[safeBlockIndex]?.items[0]?.coordScene?.marks ?? []
                            const fromScene = sceneMarks
                              .filter(
                                (mark) =>
                                  mark.kind === 'point' &&
                                  mark.label &&
                                  !String(mark.label).endsWith('′'),
                              )
                              .map((mark) => ({
                                x: mark.x,
                                y: mark.y,
                                kind: 'point' as const,
                                label: mark.label,
                                given: mark.label === 'Ω' ? true : undefined,
                                showCoord: mark.label === 'Ω' ? true : undefined,
                              }))
                            const seed =
                              activeBlock.coordMarks?.length ? activeBlock.coordMarks : fromScene
                            const hasOmega = seed.some((mark) => mark.label === 'Ω')
                            updatePage({
                              coordLibre: true,
                              coordMarks:
                                isTransformCentrale && !hasOmega
                                  ? [
                                      ...seed,
                                      {
                                        x: 0,
                                        y: 0,
                                        kind: 'point',
                                        label: 'Ω',
                                        given: true,
                                        showCoord: true,
                                      },
                                    ]
                                  : seed,
                              count: Math.max(
                                3,
                                Math.min(
                                  TRANSFORM_MAX_POINTS,
                                  seed.filter((mark) => mark.label !== 'Ω').length ||
                                    activeBlock.count,
                                ),
                              ),
                            })
                            setCoordTool(isTransformCentrale ? 'points' : 'points')
                            return
                          }
                          const fromSheet =
                            activeSheet?.blocks[safeBlockIndex]?.items[0]?.coordQuestions
                          updatePage({
                            coordLibre: true,
                            coordQuestionsLibre: resizeCoordQuestionsLibre(
                              activeBlock.coordQuestionsLibre?.length
                                ? activeBlock.coordQuestionsLibre
                                : fromSheet,
                              activeBlock.count,
                              defaultCoordQuestionReply(activeBlock.exerciseType),
                            ),
                          })
                        }}
                      >
                        Libre
                      </button>
                    </div>
                  ) : null}
                  <ReperageAxesFields
                    cols={activeBlock.coordCols ?? axesGrid.cols}
                    rows={activeBlock.coordRows ?? axesGrid.rows}
                    cellMm={axesGrid.cellMm}
                    unitSquares={axesGrid.unitSquares}
                    onChange={updateAxesGrid}
                    onLiveCols={(n) => updatePage({ coordCols: n })}
                    onLiveRows={(n) => updatePage({ coordRows: n })}
                  />
                  {isTransform && activeBlock.coordLibre ? (
                    <>
                      {isTransformCentrale ? (
                        <div className="mode-toggle" role="group" aria-label="Outil de placement">
                          <button
                            type="button"
                            className={coordTool === 'points' ? 'active' : ''}
                            onClick={() => setCoordTool('points')}
                          >
                            Points
                          </button>
                          <button
                            type="button"
                            className={coordTool === 'center' ? 'active' : ''}
                            onClick={() => setCoordTool('center')}
                          >
                            Centre Ω
                          </button>
                        </div>
                      ) : null}
                      <p className="type-hint muted">
                        {isTransformCentrale
                          ? 'Cliquez sur l’aperçu pour placer les sommets (A, B, C…) ou le centre Ω. Cliquez un point pour le retirer. Jusqu’à 10 points.'
                          : 'Cliquez sur l’aperçu pour placer les sommets de la figure (A, B, C…). Cliquez un point pour le retirer. Jusqu’à 10 points.'}
                      </p>
                      <p className="type-hint muted">
                        {(activeBlock.coordMarks ?? []).filter((mark) => mark.label !== 'Ω').length} /{' '}
                        {Math.min(activeBlock.count, TRANSFORM_MAX_POINTS)} point
                        {activeBlock.count > 1 ? 's' : ''}
                        {isTransformCentrale
                          ? (activeBlock.coordMarks ?? []).some((mark) => mark.label === 'Ω')
                            ? ' · centre Ω placé'
                            : ' · centre Ω manquant'
                          : ''}
                      </p>
                      {(activeBlock.coordMarks?.length ?? 0) > 0 ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() =>
                            updatePage({
                              coordMarks: isTransformCentrale
                                ? [
                                    {
                                      x: 0,
                                      y: 0,
                                      kind: 'point',
                                      label: 'Ω',
                                      given: true,
                                      showCoord: true,
                                    },
                                  ]
                                : [],
                            })
                          }
                        >
                          Vider les points
                        </button>
                      ) : null}
                    </>
                  ) : null}
                  {(isDroites || isConstruire) && activeBlock.coordLibre ? (
                    <CoordQuestionsLibreEditor
                      questions={
                        activeBlock.coordQuestionsLibre ??
                        resizeCoordQuestionsLibre(
                          undefined,
                          activeBlock.count,
                          defaultCoordQuestionReply(activeBlock.exerciseType),
                        )
                      }
                      defaultReply={defaultCoordQuestionReply(activeBlock.exerciseType)}
                      maxCount={isConstruire ? 8 : 10}
                      onChange={(next) => {
                        const capped = next.slice(0, isConstruire ? 8 : 10)
                        updatePage({
                          coordQuestionsLibre: capped,
                          count: Math.max(1, capped.length),
                        })
                      }}
                    />
                  ) : null}
                  <p className="type-hint muted">
                    {isDroites
                      ? activeBlock.coordLibre
                        ? 'Mode libre : le repère (droites) reste généré ; vous rédigez ou modifiez les questions et les réponses du corrigé.'
                        : 'Une seule grille centrée. Colonnes et lignes (nombres pairs) font grandir le tableau ; les carrés restent à 3, 4 ou 5 mm (56, 42 ou 34 colonnes au plus). Chaque droite a une couleur et un tracé distinct, lisible en noir et blanc.'
                      : isTransform
                        ? activeBlock.coordLibre
                          ? isTransformPlacer
                            ? 'Mode libre : placez jusqu’à 10 sommets. Sur la fiche : colonne 1 = points à placer, colonne 2 = coordonnées des images. Pas de bloc questions.'
                            : 'Mode libre : placez les sommets de la figure (et Ω en symétrie centrale). Pas de bloc questions : la consigne suffit.'
                          : isTransformPlacer
                            ? 'Types 3 et 4 : un point est donné sur le repère. Colonne 1 = points à placer, colonne 2 = coordonnées des nouveaux points. Jusqu’à 10 sommets.'
                            : 'Types 1 et 2 : figure fermée déjà tracée. Construisez l’image (pas de liste de questions).'
                        : activeBlock.coordLibre
                          ? 'Mode libre : la figure du repère reste générée ; vous rédigez ou modifiez les questions et les réponses du corrigé.'
                          : 'Une grille vide centrée, avec deux points donnés. Colonnes et lignes (nombres pairs) font grandir le tableau ; les carrés restent à 3, 4 ou 5 mm (56, 42 ou 34 colonnes au plus). Le corrigé montre les tracés.'}
                  </p>
                </div>
              ) : null}
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

            </div>
          </aside>
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
                (isSoutienFr &&
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
                              ? soutienKind === 'syllabe-son'
                                ? 'Télécharger l’audio (syllabe du son + Numéro + mots, 6 s)'
                                : soutienKind === 'lettres-phrase'
                                  ? 'Télécharger l’audio (phrases + Numéro, 6 s)'
                                  : 'Télécharger l’audio (consigne + Numéro + mots, 6 s)'
                              : 'Télécharger l’audio (consigne + 16 mots)'
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
                {libreMode ? null : (
                  <button
                    className="print-chip is-icon is-generate"
                    type="button"
                    onClick={
                      isTcf ? drawTcfTest : isSoutienFr ? drawSoutienSeries : generate
                    }
                    aria-label={
                      isTcf
                        ? 'Tirer un test au hasard'
                        : isSoutienFr
                          ? 'Préparer toutes les fiches du son'
                          : 'Générer'
                    }
                    title={
                      isTcf
                        ? 'Tirer un test au hasard'
                        : isSoutienFr
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
          {libreMode ? (
            <LibreSidePanel
              activeBlock={activeBlock}
              activeSheet={activeSheet}
              safeBlockIndex={safeBlockIndex}
              isPhraseDomain={isPhraseDomain}
              isNumberLibreDomain={isNumberLibreDomain}
              isCalliDomain={isCalliDomain}
              isJeuxDomain={isJeuxDomain}
              isTcf={isTcf}
              isDroites={isDroites}
              isConstruire={isConstruire}
              soutienKind={soutienKind}
              soutienType1Words={soutienType1Words}
              soutienType1WordPool={soutienType1WordPool}
              soutienCompletes={soutienBank?.completes ?? []}
              soutienBankWords={soutienBank?.words ?? []}
              calliIsPhrases={calliIsPhrases}
              calliFields={calliFields}
              setCalliFieldAt={setCalliFieldAt}
              removeCalliField={removeCalliField}
              addCalliExtraWord={addCalliExtraWord}
              jeuxTemplate={jeuxTemplate}
              jeuxText={jeuxText}
              tcfNiveau={tcfNiveau}
              updatePage={updatePage}
              onClose={() => {
                // Ferme le panneau sans effacer le contenu libre ni régénérer la fiche.
                setLibreMode(false)
                setLibreSnapshot(null)
              }}
            />
          ) : null}
          {footerPanelOpen ? (
            <FooterSidePanel
              institutional={institutional}
              setInstitutional={setInstitutional}
              evalMode={evalMode}
              activeExerciseLabel={
                exerciseTypeById[activeBlock.exerciseType]?.label ?? ''
              }
              onClose={() => setFooterPanelOpen(false)}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}
