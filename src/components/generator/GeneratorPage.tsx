import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import {
  accountCanAccessDomain,
  domainsForAccount,
  readAccessAccount,
} from '@/access'
import { SaveFicheDialog } from '@/components/generator/SaveFicheDialog'
import { TopbarTools } from '@/components/generator/TopbarTools'
import { FooterSidePanel } from '@/components/generator/FooterSidePanel'
import { Header } from '@/components/generator/Header'
import { LibreSidePanel } from '@/components/generator/LibreSidePanel'
import { SettingsPanel } from '@/components/generator/SettingsPanel'
import { ResultPanel } from '@/components/generator/ResultPanel'
import {
  THEME_STORAGE_KEY,
  contrastOnTheme,
  readThemeColor,
} from '@/components/generator/theme'
import {
  sheetTotalPoints as computeSheetTotalPoints,
  topicsForDomain,
  typeChoicesForBlock,
} from '@/components/generator/generator-derived'
import { deriveBlockContext } from '@/components/generator/generator-block-context'
import { useQuestionsOverflow } from '@/components/generator/useQuestionsOverflow'
import { useGeneratorAudio } from '@/components/generator/useGeneratorAudio'
import { useGenerateActions } from '@/components/generator/useGenerateActions'
import { useCoordEditing } from '@/components/generator/useCoordEditing'
import { usePageConfig } from '@/components/generator/usePageConfig'
import { usePageNavigation } from '@/components/generator/usePageNavigation'
import {
  DEFAULT_INSTITUTIONAL,
  type InstitutionalHeader,
} from '@/components/math/PrintDocumentChrome'
import { defaultPage, exerciseTypeById } from '@/math/catalog'
import { joinCalliLines } from '@/calligraphie/defaults'
import { isPhraseLibreEditable } from '@/francais/PhraseLibreEditor'
import type { VocabWordEntry } from '@/francais/vocab-learn'
import { createFiche, storeSyncPassword, updateFiche } from '@/fiches/api'
import { buildFicheRecipe, readStagedFiche, rememberFicheOnHistory } from '@/fiches/recipe'
import { BookStudio, type BookRequest } from '@/livres/BookStudio'
import { buildWorksheets } from '@/math/generate'
import {
  blockFromPage,
  exerciseStartIndex,
  pageAsConfig,
  pageBlocks,
} from '@/math/page-model'
import { randomSeed } from '@/math/rng'
import type {
  CoordShape,
  PageConfig,
  PhraseVerbGroup,
  PreviewMode,
} from '@/math/types'

export function GeneratorPage({
  onLogout,
  onOpenFiches,
}: {
  onLogout: () => void
  onOpenFiches: () => void
}) {
  const accessAccount = readAccessAccount()
  const allowedDomains = useMemo(() => domainsForAccount(accessAccount), [accessAccount])
  const firstAllowedDomain = allowedDomains[0] ?? 'algèbre'
  const [openedFiche] = useState(readStagedFiche)
  const initial = defaultPage(
    accountCanAccessDomain(accessAccount, 'algèbre') ? 'algèbre' : firstAllowedDomain,
  )
  const [pages, setPages] = useState<PageConfig[]>(() => openedFiche?.recipe.pages ?? [initial])
  const [sheetIndex, setSheetIndex] = useState(0)
  const [blockIndex, setBlockIndex] = useState(0)
  const [mode, setMode] = useState<PreviewMode>('student')
  const [institutional, setInstitutional] = useState<InstitutionalHeader>(() =>
    openedFiche
      ? { ...DEFAULT_INSTITUTIONAL, ...openedFiche.recipe.institutional }
      : DEFAULT_INSTITUTIONAL,
  )
  const [evalMode, setEvalMode] = useState(() => openedFiche?.recipe.evalMode ?? false)
  const [pointsPerQuestion, setPointsPerQuestion] = useState(
    () => openedFiche?.recipe.pointsPerQuestion ?? 1,
  )
  const [seed, setSeed] = useState(() => openedFiche?.recipe.seed ?? randomSeed())
  const [selectedCoordShape, setSelectedCoordShape] = useState<CoordShape | null>('triangle')
  const [themeColor, setThemeColor] = useState(readThemeColor)
  const [footerPanelOpen, setFooterPanelOpen] = useState(false)
  const [libreMode, setLibreMode] = useState(() => openedFiche?.recipe.libreMode ?? false)
  const [ficheRef, setFicheRef] = useState<{ id: string; name: string } | null>(() =>
    openedFiche ? { id: openedFiche.id, name: openedFiche.name } : null,
  )
  const [saveOpen, setSaveOpen] = useState(false)
  const [bookRequest, setBookRequest] = useState<BookRequest | null>(null)
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
  const [libreSnapshot, setLibreSnapshot] = useState<PageConfig[] | null>(
    () => openedFiche?.recipe.libreSnapshot ?? null,
  )
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

  const available = topicsForDomain(activePage.domain)
  const typeChoices = typeChoicesForBlock(activePage.domain, activeBlock)
  const firstExerciseNo = exerciseStartIndex(pages, pageIndex)
  const sheetTotalPoints = useMemo(
    () => computeSheetTotalPoints(previewWorksheets, pointsPerQuestion),
    [previewWorksheets, pointsPerQuestion],
  )

  const questionsOverflow = useQuestionsOverflow({
    previewFrameRef,
    previewWorksheets,
    pageIndex,
    sheetIndex,
    mode,
    seed,
    activeBlock,
    extraBlocks: activePage.extraBlocks,
    evalMode,
    institutional,
  })

  const ctx = deriveBlockContext(
    activePage,
    activeBlock,
    worksheets,
    safeSheetIndex,
    safeBlockIndex,
    questionsOverflow,
  )


  const {
    updatePage,
    toggleDraftGrid,
    cycleOralAnswerMode,
    selectTcfForm,
    toggleTcfPageBreak,
    setAllDraftGrids,
    setAllTcmDraftGrids,
  } = usePageConfig({
    pageIndex,
    safeBlockIndex,
    safeSheetIndex,
    setPages,
    activeBlock,
    activeSheet,
    worksheets,
    seed,
    libreMode,
    isPhraseDomain: ctx.isPhraseDomain,
    isCalliDomain: ctx.isCalliDomain,
    isJeuxDomain: ctx.isJeuxDomain,
    isTcf: ctx.isTcf,
  })

  const activeAsPage = pageAsConfig(activePage, activeBlock)

  const {
    coordTool,
    setCoordTool,
    axesGrid,
    updateAxesGrid,
    placeOrigin,
    placeCoordMark,
    removeCoordMark,
  } = useCoordEditing({
    activeBlock,
    activeAsPage,
    updatePage,
    isCadrans: ctx.isCadrans,
    isComposer: ctx.isComposer,
    isTransform: ctx.isTransform,
    isTransformCentrale: ctx.isTransformCentrale,
  })

  const {
    addPage,
    removePage,
    addExerciseOnPage,
    changeDomain,
    changeTopic,
    changeSoutienLetter,
    changeSoutienSound,
  } = usePageNavigation({
    accessAccount,
    allowedDomains,
    activePage,
    activeBlock,
    pageIndex,
    pageExerciseBlocks,
    worksheets,
    soutienSelection: ctx.soutienSelection,
    soutienParsed: ctx.soutienParsed,
    updatePage,
    setPages,
    setSheetIndex,
    setBlockIndex,
    setEvalMode,
    setPointsPerQuestion,
    setMode,
    setInstitutional,
  })

  const audio = useGeneratorAudio({
    activeBlock,
    activeSheet,
    worksheets,
    safeBlockIndex,
    pageIndex,
    firstExerciseNo,
    tcfNiveau: ctx.tcfNiveau,
    soutienType1Words: ctx.soutienType1Words,
  })

  const {
    validateManual,
    drawTcfTest,
    drawSoutienSeries,
    drawAlphaSeries,
    generate,
    regenerateBlock,
  } = useGenerateActions({
    pages,
    setPages,
    setSeed,
    setMode,
    setEvalMode,
    setSheetIndex,
    setBlockIndex,
    setInstitutional,
    setLibreSnapshot,
    pageIndex,
    safeBlockIndex,
    seed,
    libreMode,
    activeBlock,
    tcfNiveau: ctx.tcfNiveau,
    calliFieldsLength: ctx.calliFields.length,
    isPhraseDomain: ctx.isPhraseDomain,
    isCalliDomain: ctx.isCalliDomain,
    isJeuxDomain: ctx.isJeuxDomain,
    isTcf: ctx.isTcf,
    updatePage,
  })

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
    const next = [...ctx.calliFields]
    next[index] = value
    updatePage({ calliText: joinCalliLines(next) })
  }

  function addCalliExtraWord(entry: VocabWordEntry) {
    const word = entry.label.trim()
    if (!word) return
    const base = ctx.calliFields.filter((line) => line.trim().length > 0)
    updatePage({ calliText: joinCalliLines([...base, word]) })
  }

  function removeCalliField(index: number) {
    if (ctx.calliFields.length <= 1) {
      updatePage({ calliText: '' })
      return
    }
    updatePage({ calliText: joinCalliLines(ctx.calliFields.filter((_, i) => i !== index)) })
  }

  function printAll() {
    window.print()
  }

  async function persistFiche(input: { name: string; asNew: boolean; password: string }) {
    if (input.password) storeSyncPassword(input.password)
    const recipe = buildFicheRecipe({
      pages,
      seed,
      institutional,
      evalMode,
      pointsPerQuestion,
      libreMode,
      libreSnapshot,
    })
    const saved =
      !input.asNew && ficheRef
        ? await updateFiche(ficheRef.id, input.name, recipe)
        : await createFiche(input.name, recipe)
    const next = { id: saved.id, name: saved.name }
    setFicheRef(next)
    rememberFicheOnHistory({ ...next, recipe: saved.recipe })
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
    // En mode libre : refresh sous la numérotation du panneau (pas sur le titre Exercice).
    showExerciseRefresh: !libreMode,
  } as const

  const settingsPanelProps = {
    ...ctx,
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
    addPage,
    addExerciseOnPage,
    removePage,
    evalMode,
    setEvalMode,
    institutional,
    setInstitutional,
    pointsPerQuestion,
    setPointsPerQuestion,
    sheetTotalPoints,
    activePage,
    changeDomain,
    allowedDomains,
    accessAccount,
    activeBlock,
    changeTopic,
    available,
    changeSoutienLetter,
    changeSoutienSound,
    isAlphabetisation: ctx.isAlphabetisation,
    libreMode,
    setVerbGroup,
    updatePage,
    typeChoices,
    activeAsPage,
    setCalliFieldAt,
    removeCalliField,
    addCalliExtraWord,
    soutienBankSound: ctx.soutienBank?.sound,
    soutienCompletes: ctx.soutienBank?.completes ?? [],
    soutienBankWords: ctx.soutienBank?.words ?? [],
    questionsOverflow,
    axesGrid,
    updateAxesGrid,
    coordTool,
    setCoordTool,
    placeCoordMark,
    placeOrigin,
    removeCoordMark,
    setAllTcmDraftGrids,
    setAllDraftGrids,
  }

  const resultPanelProps = {
    ...ctx,
    libreMode,
    validateManual,
    downloadActiveTcfAudios: audio.downloadActiveTcfAudios,
    downloadActiveTcmCfrAudios: audio.downloadActiveTcmCfrAudios,
    downloadActiveSoutienCompleterAudio: audio.downloadActiveSoutienCompleterAudio,
    downloadActiveSoutienEcouterAudio: audio.downloadActiveSoutienEcouterAudio,
    downloadActiveSoutienMotsAudio: audio.downloadActiveSoutienMotsAudio,
    downloadActiveSoutienPhrases: audio.downloadActiveSoutienPhrases,
    drawTcfTest,
    drawSoutienSeries,
    drawAlphaSeries,
    generate,
    printAll,
    onSaveFiche: () => setSaveOpen(true),
    onOpenBook: () =>
      setBookRequest({
        kind: activePage.domain === 'alphabetisation' ? 'alpha' : 'soutien',
        institutional,
        evalMode,
        pointsPerQuestion,
        saveCopy: true,
      }),
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
    coordTool,
    selectedCoordShape,
    setSelectedCoordShape,
    placeCoordMark,
    placeOrigin,
    removeCoordMark,
  }

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
          <>
            <button
              className="topbar-icon-btn"
              type="button"
              aria-label="Fiches enregistrées"
              title="Fiches enregistrées"
              onClick={onOpenFiches}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path
                  fill="currentColor"
                  d="M4 4h6l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4v10h16V8H4z"
                />
              </svg>
            </button>
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
                  if (ctx.isFormes || ctx.isCadrans || ctx.isDroites || ctx.isConstruire || ctx.isTransform) {
                    patch.coordLibre = true
                  }
                  if (ctx.isNumberLibreDomain) patch.numberLibre = true
                  if (ctx.isPhraseDomain && isPhraseLibreEditable(activeBlock.exerciseType)) {
                    patch.verbGroup = 'libre'
                    patch.phraseItems = activeBlock.phraseItems ?? sheetBlock?.items
                    patch.phraseInstruction =
                      activeBlock.phraseInstruction ?? sheetBlock?.instruction
                  }
                  if (ctx.soutienKind === 'mots') patch.soutienMotsLibre = true
                  if (ctx.soutienKind === 'completer') patch.soutienCompleterLibre = true
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
            showPreviewToggle={!(ctx.isCalliDomain || ctx.isJeuxDomain)}
            onLogout={onLogout}
          />
          </>
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
          <SettingsPanel {...settingsPanelProps} />
          <ResultPanel {...resultPanelProps} />
          {libreMode ? (
            <LibreSidePanel
              activeBlock={activeBlock}
              activeSheet={activeSheet}
              safeBlockIndex={safeBlockIndex}
              isPhraseDomain={ctx.isPhraseDomain}
              isNumberLibreDomain={ctx.isNumberLibreDomain}
              isCalliDomain={ctx.isCalliDomain}
              isJeuxDomain={ctx.isJeuxDomain}
              isTcf={ctx.isTcf}
              isTcmLike={ctx.isTcmLike}
              isDroites={ctx.isDroites}
              isConstruire={ctx.isConstruire}
              soutienKind={ctx.soutienKind}
              soutienType1Words={ctx.soutienType1Words}
              soutienType1WordPool={ctx.soutienType1WordPool}
              soutienCompletes={ctx.soutienBank?.completes ?? []}
              soutienBankWords={ctx.soutienBank?.words ?? []}
              calliIsPhrases={ctx.calliIsPhrases}
              calliFields={ctx.calliFields}
              setCalliFieldAt={setCalliFieldAt}
              removeCalliField={removeCalliField}
              addCalliExtraWord={addCalliExtraWord}
              jeuxTemplate={ctx.jeuxTemplate}
              jeuxText={ctx.jeuxText}
              tcfNiveau={ctx.tcfNiveau}
              updatePage={updatePage}
              onRegenerateBlock={regenerateBlock}
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
      {saveOpen ? (
        <SaveFicheDialog
          initialName={ficheRef?.name ?? ''}
          canUpdate={ficheRef != null}
          onClose={() => setSaveOpen(false)}
          onSubmit={persistFiche}
        />
      ) : null}
      <BookStudio request={bookRequest} onClose={() => setBookRequest(null)} />
    </div>
  )
}
