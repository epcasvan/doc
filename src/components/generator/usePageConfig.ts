import { useEffect, type Dispatch, type SetStateAction } from 'react'
import {
  cycleOralMode,
  isOralComprehensionExercise,
  isProblemExercise,
  resizeDraftGrids,
  resizeOralAnswerModes,
} from '@/components/generator/page-helpers'
import { defaultCoordQuestionReply } from '@/components/generator/WorksheetSheet'
import { isPhraseLibreEditable } from '@/francais/PhraseLibreEditor'
import {
  resizeCoordQuestionsLibre,
} from '@/math/CoordQuestionsLibreEditor'
import {
  isReperageCadrans,
  isReperageComposer,
  isReperageConstruire,
  isReperageDroites,
} from '@/math/coord-reperage'
import {
  TRANSFORM_MAX_POINTS,
  isTransformationExercise,
} from '@/math/coord-transformations'
import { isDraftPadExercise } from '@/math/catalog'
import {
  blockFromPage,
  pageBlocks,
  setPageBlock,
} from '@/math/page-model'
import { isTcmDomain } from '@/tcm/test'
import { isTcmCfrDomain } from '@/tcm-cfr/test'
import type { TcfTypeReponse } from '@/tcf/types'
import type {
  ExerciseBlock,
  PageConfig,
  WorksheetPage,
} from '@/math/types'

export type UsePageConfigParams = {
  pageIndex: number
  safeBlockIndex: number
  safeSheetIndex: number
  setPages: Dispatch<SetStateAction<PageConfig[]>>
  activeBlock: ExerciseBlock
  activeSheet: WorksheetPage | undefined
  worksheets: WorksheetPage[]
  seed: number
  libreMode: boolean
  isPhraseDomain: boolean
  isCalliDomain: boolean
  isJeuxDomain: boolean
  isTcf: boolean
}

export function usePageConfig({
  pageIndex,
  safeBlockIndex,
  safeSheetIndex,
  setPages,
  activeBlock,
  activeSheet,
  worksheets,
  seed,
  libreMode,
  isPhraseDomain,
  isCalliDomain,
  isJeuxDomain,
  isTcf,
}: UsePageConfigParams) {
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
    setPages,
  ])

  return {
    updatePage,
    toggleDraftGrid,
    cycleOralAnswerMode,
    selectTcfForm,
    toggleTcfPageBreak,
    setAllDraftGrids,
    setAllTcmDraftGrids,
  }
}
