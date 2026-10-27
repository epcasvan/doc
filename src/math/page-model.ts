import type { ExerciseBlock, PageConfig } from './types'

export function blockFromPage(page: PageConfig): ExerciseBlock {
  return {
    topic: page.topic,
    exerciseType: page.exerciseType,
    difficulty: page.difficulty,
    count: page.count,
    columns: page.columns,
    exerciseNo: page.exerciseNo,
    pointsPerQuestion: page.pointsPerQuestion,
    track: page.track,
    verbGroup: page.verbGroup,
    contentSeed: page.contentSeed,
    phraseItems: page.phraseItems,
    phraseInstruction: page.phraseInstruction,
    problemDraftGrids: page.problemDraftGrids,
    oralAnswerModes: page.oralAnswerModes,
    tcfFormModes: page.tcfFormModes,
    tcfPageBreakAfter: page.tcfPageBreakAfter,
    continueOnNextPage: page.continueOnNextPage,
    coordLibre: page.coordLibre,
    coordQuestionsLibre: page.coordQuestionsLibre,
    coordCols: page.coordCols,
    coordRows: page.coordRows,
    coordAxis: page.coordAxis,
    coordMarks: page.coordMarks,
    coordRange: page.coordRange,
    coordCellMm: page.coordCellMm,
    coordUnitSquares: page.coordUnitSquares,
    coordOriginCol: page.coordOriginCol,
    coordOriginRow: page.coordOriginRow,
    numberLibre: page.numberLibre,
    numberMin: page.numberMin,
    numberMax: page.numberMax,
    numberDecimals: page.numberDecimals,
    quadLibre: page.quadLibre,
    quadShapes: page.quadShapes,
    vocabRows: page.vocabRows,
    vocabCols: page.vocabCols,
    vocabSelected: page.vocabSelected,
    vocabSubgroup: page.vocabSubgroup,
    vocabCustomEntries: page.vocabCustomEntries,
    vocabLineCh: page.vocabLineCh,
    gameEntries: page.gameEntries,
    gameText: page.gameText,
    gameSource: page.gameSource,
    gameTopic: page.gameTopic,
    gameSelectedIds: page.gameSelectedIds,
    gameBackColor: page.gameBackColor,
    gameSeriesName: page.gameSeriesName,
    gameBorderId: page.gameBorderId,
    gameBorderRectoId: page.gameBorderRectoId,
    gameBorderVersoId: page.gameBorderVersoId,
    gameFontSize: page.gameFontSize,
    gameAlpha: page.gameAlpha,
    soutienMotsLibre: page.soutienMotsLibre,
    soutienMotsEntries: page.soutienMotsEntries,
    soutienCompleterLibre: page.soutienCompleterLibre,
    soutienCompleterEntries: page.soutienCompleterEntries,
    calliText: page.calliText,
    calliFont: page.calliFont,
    calliSize: page.calliSize,
    tcfExercise: page.tcfExercise,
    tcfBankId: page.tcfBankId,
    tcfScenario: page.tcfScenario,
    libreItems: page.libreItems,
    libreInstruction: page.libreInstruction,
  }
}

export function pageBlocks(page: PageConfig): ExerciseBlock[] {
  return [blockFromPage(page), ...(page.extraBlocks ?? [])]
}

export function pageAsConfig(page: PageConfig, block: ExerciseBlock): PageConfig {
  return { ...page, ...block, extraBlocks: undefined }
}

export function setPageBlock(page: PageConfig, blockIndex: number, patch: Partial<ExerciseBlock>): PageConfig {
  if (blockIndex <= 0) {
    const next = { ...page, ...patch }
    if (patch.topic != null || patch.exerciseType != null) {
      return next
    }
    return next
  }
  const extra = [...(page.extraBlocks ?? [])]
  const index = blockIndex - 1
  const current = extra[index]
  if (!current) return page
  extra[index] = { ...current, ...patch }
  return { ...page, extraBlocks: extra }
}

export function replacePageBlock(page: PageConfig, blockIndex: number, block: ExerciseBlock): PageConfig {
  if (blockIndex <= 0) {
    return { ...page, ...block }
  }
  const extra = [...(page.extraBlocks ?? [])]
  extra[blockIndex - 1] = block
  return { ...page, extraBlocks: extra }
}

export function addPageBlock(page: PageConfig, block: ExerciseBlock): PageConfig {
  return { ...page, extraBlocks: [...(page.extraBlocks ?? []), block] }
}

/** Fige les numéros affichés (1, 2, 3…) pour qu’un retrait ne décale pas les autres. */
export function stampExerciseNumbers(page: PageConfig, numbers: number[]): PageConfig {
  const blocks = pageBlocks(page).map((block, index) => {
    const exerciseNo = numbers[index] ?? block.exerciseNo
    return exerciseNo != null ? { ...block, exerciseNo } : block
  })
  const [first, ...extra] = blocks
  if (!first) return page
  return { ...page, ...first, domain: page.domain, extraBlocks: extra.length ? extra : undefined }
}

export function removePageBlock(
  page: PageConfig,
  blockIndex: number,
  /** Numéros affichés, pour que les exercices restants gardent le leur. */
  numbers?: number[],
): PageConfig {
  const blocks = numbers ? pageBlocks(stampExerciseNumbers(page, numbers)) : pageBlocks(page)
  if (blocks.length <= 1 || blockIndex < 0 || blockIndex >= blocks.length) return page
  const remaining = blocks.filter((_, index) => index !== blockIndex)
  const [first, ...extra] = remaining
  if (!first) return page
  const next: PageConfig = {
    ...page,
    ...first,
    domain: page.domain,
    extraBlocks: extra.length ? extra : undefined,
  }
  // Ne pas laisser les réglages de l’exercice retiré (mode libre, etc.) sur celui qui prend sa place.
  const owned = blockFromPage(page)
  for (const key of Object.keys(owned) as (keyof ExerciseBlock)[]) {
    if (first[key] === undefined) delete next[key]
  }
  return next
}

export function exerciseStartIndex(pages: PageConfig[], pageIndex: number): number {
  return pages.slice(0, pageIndex).reduce((sum, page) => sum + pageBlocks(page).length, 1)
}
