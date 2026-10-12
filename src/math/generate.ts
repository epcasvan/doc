/**
 * Orchestrateur de fiches : buildPage / buildWorksheets.
 * Tirage maths purs → `./generate-items` ; colonnes → `./column-arith`.
 */
import { tryGenerateAlgebraBatch } from './algebra'
import { exerciseTypeById, topicById } from './catalog'
import { numberRangeFrom } from './difficulty'
import { generateConstruire } from './coord-construire'
import { generateDroites } from './coord-droites'
import { tryGenerateReperage } from './coord-reperage'
import { generateTransformations, isTransformationExercise } from './coord-transformations'
import { tryGenerateSoutienBatch } from '@/francais/soutien/generate'
import { parseSoutienType } from '@/francais/soutien/kinds'
import { parseAlphaType } from '@/alphabetisation/kinds'
import { ALGEBRA_GLOSSARY, GEOMETRY_GLOSSARY } from './glossary-banks'
import { tryGenerateAlphabetisationBatch } from '@/alphabetisation/generate'
import { tryGenerateLectureBatch } from '@/francais/lecture'
import { tryGeneratePhraseBatch } from '@/francais/phrase'
import { tryGenerateCalligraphieBatch } from '@/calligraphie/generate'
import { tryGenerateJeuxBatch } from '@/jeux/generate'
import { pageAsConfig, pageBlocks } from './page-model'
import { TCM_MAX_SCORE } from '@/tcm/test'
import { generateTcmInformations } from '@/tcm/informations'
import { tryGenerateTcfBlock } from '@/tcf/generate'
import { isTcfConsignesType, TCF_DOMAIN } from '@/tcf/catalog'
import { tryGenerateGrammaireBlock } from '@/grammaire/generate'
import { isGrammaireTheoryType } from '@/grammaire/types'
import { tryGenerateAcmBlock } from '@/acm/generate'
import { tryGenerateSanteBlock } from '@/sante/generate'
import { tryGenerateSocieteBlock } from '@/societe/generate'
import { isTcmCfrConsignesType, TCM_CFR_MAX_SCORE } from '@/tcm-cfr/test'
import { tryGenerateTcmCscBlock } from '@/tcm-csc/generate'
import { isTcmCscConsignesType } from '@/tcm-csc/test'
import { tryGenerateVocabulaireBlock } from '@/vocabulaire/generate'
import { isGrammarTheoryType } from '@/francais/grammar-theory'
import { createRng, shuffle } from './rng'
import type {
  AlgebraGiven,
  MathItem,
  PageConfig,
  WorksheetBlock,
  WorksheetDocument,
  WorksheetPage,
} from './types'
import { generateItems } from './generate-items'

function buildSingleBlock(
  config: PageConfig,
  seed: number,
  worksheetSeed = seed,
): {
  title: string
  instruction: string
  items: MathItem[]
  givens?: AlgebraGiven[]
  document?: WorksheetDocument
  bankQuestionCap?: number
} {
  const rng = createRng(seed)
  const topic = topicById[config.topic]
  const type = exerciseTypeById[config.exerciseType]
  const difficulty = config.difficulty ?? 'moyen'
  const fallbackTitle = type?.label ?? topic?.label ?? 'Exercices'
  if (config.exerciseType === 'tcm-consignes') {
    return {
      title: 'Informations',
      instruction: type?.instruction ?? 'Lisez les consignes avant de commencer le test.',
      items: generateTcmInformations('tcm', TCM_MAX_SCORE),
    }
  }
  if (isTcmCscConsignesType(config.exerciseType)) {
    return {
      title: 'Informations',
      instruction: type?.instruction ?? 'Lisez les consignes avant de commencer le test.',
      items: generateTcmInformations('tcm-csc', 0),
    }
  }
  const tcf = tryGenerateTcfBlock(config, rng)
  if (tcf) {
    return { title: fallbackTitle, instruction: tcf.instruction, items: tcf.items }
  }
  const grammaire = tryGenerateGrammaireBlock(config)
  if (grammaire) {
    return {
      title: fallbackTitle,
      instruction: grammaire.instruction,
      items: grammaire.items,
    }
  }
  const vocabulaire = tryGenerateVocabulaireBlock(config)
  if (vocabulaire) {
    return {
      title: fallbackTitle,
      instruction: vocabulaire.instruction,
      items: vocabulaire.items,
    }
  }
  const societe = tryGenerateSocieteBlock(config)
  if (societe) {
    return {
      title: fallbackTitle,
      instruction: societe.instruction,
      items: societe.items,
    }
  }
  const sante = tryGenerateSanteBlock(config)
  if (sante) {
    return {
      title: fallbackTitle,
      instruction: sante.instruction,
      items: sante.items,
    }
  }
  const acm = tryGenerateAcmBlock(config)
  if (acm) {
    return {
      title: fallbackTitle,
      instruction: acm.instruction,
      items: acm.items,
    }
  }
  const tcmCsc = tryGenerateTcmCscBlock(config)
  if (tcmCsc) {
    return {
      title: fallbackTitle,
      instruction: tcmCsc.instruction,
      items: tcmCsc.items,
    }
  }
  if (isTcmCfrConsignesType(config.exerciseType)) {
    return {
      title: 'Informations',
      instruction: type?.instruction ?? 'Lisez les consignes avant de commencer le test.',
      items: generateTcmInformations('tcm-cfr', TCM_CFR_MAX_SCORE),
    }
  }
  if (config.exerciseType === 'reperage-droites') {
    const droites = generateDroites(config, rng)
    return { title: fallbackTitle, instruction: droites.instruction, items: droites.items }
  }
  if (config.exerciseType === 'reperage-construire') {
    const construire = generateConstruire(config, rng)
    return { title: fallbackTitle, instruction: construire.instruction, items: construire.items }
  }
  if (isTransformationExercise(config.exerciseType)) {
    const tr = generateTransformations(config, rng)
    return { title: fallbackTitle, instruction: tr.instruction, items: tr.items }
  }
  if (config.exerciseType === 'glossaire-algebre-mots' || config.exerciseType === 'glossaire-geometrie-mots') {
    const bank = config.exerciseType === 'glossaire-algebre-mots' ? ALGEBRA_GLOSSARY : GEOMETRY_GLOSSARY
    const count = Math.max(1, Math.min(config.count || 8, bank.length))
    const picked = shuffle(rng, [...bank]).slice(0, count)
    return {
      title: fallbackTitle,
      instruction: type?.instruction ?? 'Lisez chaque mot, sa définition et le schéma.',
      items: picked.map((entry) => ({
        layout: 'glossary' as const,
        prompt: entry.term,
        glossary: {
          term: entry.term,
          definition: entry.definition,
          figure: entry.figure,
        },
        answer: entry.definition,
      })),
    }
  }
  const reperage = tryGenerateReperage(config, rng)
  if (reperage) {
    return { title: fallbackTitle, instruction: reperage.instruction, items: reperage.items }
  }
  const soutien = tryGenerateSoutienBatch(config.exerciseType, config.count, rng, difficulty, {
    soutienMotsLibre: config.soutienMotsLibre,
    soutienMotsEntries: config.soutienMotsEntries,
    columns: config.columns,
    soutienCompleterLibre: config.soutienCompleterLibre,
    soutienCompleterEntries: config.soutienCompleterEntries,
    excludeWords: config.soutienExcludeWords,
    type1Words: config.soutienType1Words,
    type5Words: config.soutienType5Words,
    level: config.soutienLevel,
  })
  if (soutien) {
    return {
      title: fallbackTitle,
      instruction: soutien.instruction ?? type?.instruction ?? 'Complétez.',
      items: soutien.items,
    }
  }
  const alphabetisation = tryGenerateAlphabetisationBatch(
    config.exerciseType,
    config.count,
    rng,
    difficulty,
    {
      soutienMotsLibre: config.soutienMotsLibre,
      soutienMotsEntries: config.soutienMotsEntries,
      columns: config.columns,
      soutienCompleterLibre: config.soutienCompleterLibre,
      soutienCompleterEntries: config.soutienCompleterEntries,
      excludeWords: config.soutienExcludeWords,
      type1Words: config.soutienType1Words,
      type5Words: config.soutienType5Words,
      level: config.soutienLevel,
    },
  )
  if (alphabetisation) {
    return {
      title: fallbackTitle,
      instruction: alphabetisation.instruction ?? type?.instruction ?? 'Complétez.',
      items: alphabetisation.items,
    }
  }
  const lecture = tryGenerateLectureBatch(config.exerciseType, config.count, rng, difficulty)
  if (lecture) {
    return {
      title: fallbackTitle,
      instruction: lecture.instruction ?? type?.instruction ?? 'Complétez.',
      items: lecture.items,
    }
  }
  const phrase = tryGeneratePhraseBatch(
    config.exerciseType,
    config.count,
    rng,
    difficulty,
    config.verbGroup ?? 'er',
  )
  if (phrase) {
    const libre =
      config.verbGroup === 'libre' &&
      Array.isArray(config.phraseItems) &&
      config.phraseItems.length > 0
    return {
      title: fallbackTitle,
      instruction: libre
        ? (config.phraseInstruction ?? phrase.instruction ?? type?.instruction ?? 'Complétez.')
        : (phrase.instruction ?? type?.instruction ?? 'Complétez.'),
      items: libre ? config.phraseItems! : phrase.items,
    }
  }
  const algebra = tryGenerateAlgebraBatch(config.exerciseType, config.count, rng, difficulty)
  if (algebra) {
    return {
      title: fallbackTitle,
      instruction: algebra.instruction ?? type?.instruction ?? 'Calculez.',
      items: algebra.items,
      givens: algebra.givens,
    }
  }
  const jeux = tryGenerateJeuxBatch(config.exerciseType, rng, {
    gameEntries: config.gameEntries,
    gameBackColor: config.gameBackColor,
    gameTopic: config.gameTopic,
    gameSeriesName: config.gameSeriesName,
    gameBorderId: config.gameBorderId,
    gameBorderRectoId:
      config.gameBorderRectoId !== undefined
        ? config.gameBorderRectoId
        : config.gameBorderId,
    gameBorderVersoId:
      config.gameBorderVersoId !== undefined
        ? config.gameBorderVersoId
        : config.gameBorderId,
    gameFontSize: config.gameFontSize,
    gameAlpha: config.gameAlpha,
  })
  if (jeux) {
    return {
      title: fallbackTitle,
      instruction: jeux.instruction,
      items: jeux.items,
    }
  }
  const calligraphie = tryGenerateCalligraphieBatch(
    config.exerciseType,
    config.calliText,
    config.calliFont,
    config.calliSize,
  )
  if (calligraphie) {
    return {
      title: fallbackTitle,
      instruction: calligraphie.instruction,
      items: calligraphie.items,
    }
  }
  return {
    title: fallbackTitle,
    instruction: type?.instruction ?? 'Calculez, complète ou simplifiez chaque expression.',
    items: generateItems(
      config.exerciseType,
      config.count,
      rng,
      difficulty,
      numberRangeFrom(config),
      config.quadLibre ? config.quadShapes : undefined,
      worksheetSeed,
    ),
  }
}

/** Page « Informations » d’un test (TCM / CFR / CSC / TCF) : ni numéro d’exercice ni points. */
function isInfoPageType(typeId: string): boolean {
  return (
    typeId === 'tcm-consignes' ||
    isTcmCfrConsignesType(typeId) ||
    isTcmCscConsignesType(typeId) ||
    isTcfConsignesType(typeId)
  )
}

export function buildPage(
  config: PageConfig,
  seed: number,
  startExercise = 1,
  worksheetSeed = seed,
): WorksheetPage {
  const blocksIn = pageBlocks(config)
  let exerciseCursor = startExercise
  const built: WorksheetBlock[] = blocksIn.map((block, index) => {
    const single = pageAsConfig(config, block)
    const local = block.contentSeed ?? 0
    const result = buildSingleBlock(single, seed + index * 10007 + local, worksheetSeed)
    const isTheory = isGrammarTheoryType(block.exerciseType) || isGrammaireTheoryType(block.exerciseType)
    const isJeux = block.exerciseType.startsWith('jeux-')
    const isTcmConsignes = isInfoPageType(block.exerciseType)
    const libre =
      Array.isArray(block.libreItems) && block.libreItems.length > 0
        ? {
            items: block.libreItems,
            instruction: block.libreInstruction ?? result.instruction,
          }
        : null
    let exerciseIndex = 0
    if (!isTcmConsignes) {
      if (block.exerciseNo != null) {
        exerciseIndex = block.exerciseNo
        exerciseCursor = Math.max(exerciseCursor, block.exerciseNo + 1)
      } else {
        exerciseIndex = exerciseCursor++
      }
    }
    return {
      exerciseIndex,
      title: isTcmConsignes
        ? 'Informations'
        : isTheory
          ? ((libre?.instruction ?? result.instruction)?.replace(/^Théorie — /, '') || `Théorie`)
          : isJeux
            ? (exerciseTypeById[block.exerciseType]?.label ?? `Jeu ${exerciseIndex}`)
            : `Exercice ${exerciseIndex}`,
      instruction: libre?.instruction ?? result.instruction,
      items: libre?.items ?? result.items,
      columns: block.columns,
      exerciseType: block.exerciseType,
      pointsPerQuestion: block.pointsPerQuestion,
      givens: result.givens,
      document: result.document,
      problemDraftGrids: block.problemDraftGrids,
      oralAnswerModes: block.oralAnswerModes,
      tcfFormModes: block.tcfFormModes,
      tcfPageBreakAfter: block.tcfPageBreakAfter,
      bankQuestionCap: result.bankQuestionCap,
    }
  })
  const first = built[0]
  const topic = topicById[config.topic]
  const type = exerciseTypeById[config.exerciseType]
  const isTheoryPage =
    isGrammarTheoryType(config.exerciseType) || isGrammaireTheoryType(config.exerciseType)
  const isTcmConsignesPage = isInfoPageType(config.exerciseType)
  return {
    ...config,
    title: isTcmConsignesPage
      ? 'Informations'
      : isTheoryPage
        ? (first?.title ?? type?.label ?? 'Théorie')
        : built.length > 1
          ? (topic?.label ?? 'Exercices')
          : (type?.label ?? topic?.label ?? 'Exercices'),
    instruction: first?.instruction ?? type?.instruction ?? 'Complétez.',
    items: built.flatMap((block) => block.items),
    blocks: built,
    givens: first?.givens,
  }
}

/** Mots déjà tirés en types 1 (vocab) et 5 (compléter) sur toute la série. */
function collectSoutienReservedWords(pages: PageConfig[], seed: number): {
  reserved: string[]
  type1Words: string[]
  type5Words: string[]
} {
  const reserved = new Set<string>()
  const type1Words: string[] = []
  const type1Seen = new Set<string>()
  const type5Words: string[] = []
  const type5Seen = new Set<string>()
  pages.forEach((page, pageIndex) => {
    const pageSeed = seed + pageIndex * 7919
    pageBlocks(page).forEach((block, blockIndex) => {
      const kind =
        parseSoutienType(block.exerciseType)?.kind ??
        parseAlphaType(block.exerciseType)?.kind
      if (kind !== 'mots' && kind !== 'completer') return
      const single = pageAsConfig(page, block)
      const local = block.contentSeed ?? 0
      const result = buildSingleBlock(single, pageSeed + blockIndex * 10007 + local, seed)
      for (const item of result.items) {
        if (kind === 'mots' && item.layout === 'vocab-table') {
          for (const entry of item.vocabEntries ?? []) {
            const label = entry.label?.trim()
            if (!label) continue
            reserved.add(label.toLowerCase())
            if (!type1Seen.has(label.toLowerCase())) {
              type1Seen.add(label.toLowerCase())
              type1Words.push(label)
            }
          }
        }
        if (kind === 'completer' && item.layout === 'syllable-complete') {
          for (const row of item.syllableCompletes ?? []) {
            const word = row.word?.trim()
            if (!word) continue
            reserved.add(word.toLowerCase())
            if (!type5Seen.has(word.toLowerCase())) {
              type5Seen.add(word.toLowerCase())
              type5Words.push(word)
            }
          }
        }
      }
    })
  })
  return { reserved: [...reserved], type1Words, type5Words }
}

export function buildWorksheets(pages: PageConfig[], seed: number): WorksheetPage[] {
  let exerciseNo = 1
  const out: WorksheetPage[] = []
  const { reserved, type1Words, type5Words } = collectSoutienReservedWords(pages, seed)
  const pagesWithExclude =
    reserved.length > 0 || type1Words.length > 0 || type5Words.length > 0
      ? pages.map((page) => ({
          ...page,
          soutienExcludeWords: reserved.length > 0 ? reserved : page.soutienExcludeWords,
          soutienType1Words: type1Words.length > 0 ? type1Words : page.soutienType1Words,
          soutienType5Words: type5Words.length > 0 ? type5Words : page.soutienType5Words,
        }))
      : pages

  pagesWithExclude.forEach((page, index) => {
    const worksheet = buildPage(page, seed + index * 7919, exerciseNo, seed)
    const scoredBlocks = worksheet.blocks.filter((block) => !isInfoPageType(block.exerciseType))
    if (scoredBlocks.length) {
      exerciseNo = Math.max(...scoredBlocks.map((block) => block.exerciseIndex)) + 1
    }

    const isCom =
      page.exerciseType.includes('-com-orale') || page.exerciseType.includes('-com-ecrite')
    const isTheory =
      isGrammarTheoryType(page.exerciseType) || isGrammaireTheoryType(page.exerciseType)
    const isJeuxDuplex =
      page.exerciseType === 'jeux-vocabulaire' ||
      page.exerciseType === 'jeux-devinettes' ||
      page.exerciseType === 'jeux-memory' ||
      page.exerciseType === 'jeux-intrus' ||
      page.exerciseType === 'jeux-dominos'
    // Jeux recto-verso : une feuille A4 par grille (recto puis verso).
    // Pas « suite » : ce sont deux faces d’une même fiche, pas un débordement.
    if (isJeuxDuplex && worksheet.items.length >= 2) {
      const block = worksheet.blocks[0]
      worksheet.items.forEach((item, part) => {
        const side = part === 0 ? 'Recto' : 'Verso'
        out.push({
          ...worksheet,
          title: `${worksheet.title} — ${side}`,
          instruction: '',
          items: [item],
          blocks: block
            ? [
                {
                  ...block,
                  title: side,
                  instruction: '',
                  items: [item],
                },
              ]
            : worksheet.blocks,
          configIndex: index,
          isContinuation: false,
        })
      })
      return
    }
    // Loto : paires (page grilles + verso thème), puis lot animateur.
    if (page.exerciseType === 'jeux-loto' && worksheet.items.length > 0) {
      const block = worksheet.blocks[0]
      const pushSheet = (item: (typeof worksheet.items)[number], side: string) => {
        out.push({
          ...worksheet,
          title: side ? `${worksheet.title} — ${side}` : worksheet.title,
          instruction: '',
          items: [item],
          blocks: block
            ? [{ ...block, title: side || block.title, instruction: '', items: [item] }]
            : worksheet.blocks,
          configIndex: index,
          isContinuation: false,
        })
      }
      let i = 0
      while (i < worksheet.items.length) {
        const cur = worksheet.items[i]!
        const next = worksheet.items[i + 1]
        const kind = cur.gameBoard?.kind
        if (kind === 'loto-page' && next?.gameBoard?.kind === 'loto-back') {
          pushSheet(cur, 'Recto')
          pushSheet(next, 'Verso')
          i += 2
          continue
        }
        pushSheet(cur, kind === 'loto-call' ? 'Lot animateur' : '')
        i += 1
      }
      return
    }
    // TCF : sauts de page manuels après certaines questions (marge « Page »).
    if (page.domain === TCF_DOMAIN) {
      const sourceBlock = worksheet.blocks[0]
      const breaks = sourceBlock?.tcfPageBreakAfter ?? page.tcfPageBreakAfter
      const items = sourceBlock?.items ?? worksheet.items
      const cutAfter = new Set<number>()
      breaks?.forEach((on, i) => {
        if (on && i < items.length - 1) cutAfter.add(i)
      })
      if (cutAfter.size > 0 && sourceBlock) {
        const segments: number[][] = []
        let current: number[] = []
        items.forEach((_, i) => {
          current.push(i)
          if (cutAfter.has(i)) {
            segments.push(current)
            current = []
          }
        })
        if (current.length) segments.push(current)
        segments.forEach((indexes, part) => {
          const sliceItems = indexes.map((i) => items[i]!)
          const offset = indexes[0] ?? 0
          out.push({
            ...worksheet,
            title: part === 0 ? worksheet.title : `${worksheet.title} — suite`,
            instruction:
              part === 0 ? worksheet.instruction : 'Continuez. Répondez aux questions suivantes.',
            items: sliceItems,
            blocks: [
              {
                ...sourceBlock,
                title:
                  part === 0
                    ? sourceBlock.title
                    : `${sourceBlock.title.replace(/ \(suite\)$/, '')} (suite)`,
                instruction:
                  part === 0
                    ? sourceBlock.instruction
                    : 'Continuez. Répondez aux questions suivantes.',
                items: sliceItems,
                itemOffset: offset,
                // Tableaux complets : les callbacks UI rajoutent itemOffset.
                tcfPageBreakAfter: breaks,
                tcfFormModes: sourceBlock.tcfFormModes,
              },
            ],
            configIndex: index,
            isContinuation: part > 0,
          })
        })
        return
      }
    }

    // Théorie : ~6 blocs par feuille A4 (titres + tableaux densent vite).
    const pageCap = isTheory ? 6 : 4
    const totalItems = worksheet.items.length
    if (!page.continueOnNextPage || !(isCom || isTheory) || totalItems <= pageCap) {
      out.push({ ...worksheet, configIndex: index, isContinuation: false })
      return
    }

    const suiteInstruction = isTheory
      ? 'Suite de la théorie.'
      : 'Continuez. Répondez aux questions suivantes.'
    const suiteTitleSuffix = isTheory ? 'Suite de la théorie.' : 'Suite des questions.'

    let offset = 0
    let part = 0
    while (offset < totalItems) {
      const sliceEnd = offset + pageCap
      const headBlocks = worksheet.blocks
        .map((block) => ({
          ...block,
          title: part === 0 ? block.title : `${block.title.replace(/ \(suite\)$/, '')} (suite)`,
          instruction: part === 0 ? block.instruction : suiteInstruction,
          document: part === 0 ? block.document : undefined,
          items: block.items.slice(offset, sliceEnd),
          oralAnswerModes: block.oralAnswerModes?.slice(offset, sliceEnd),
          problemDraftGrids: block.problemDraftGrids?.slice(offset, sliceEnd),
        }))
        .filter((block) => block.items.length > 0)

      out.push({
        ...worksheet,
        title: part === 0 ? worksheet.title : `${worksheet.title} — suite`,
        instruction: part === 0 ? worksheet.instruction : suiteTitleSuffix,
        items: headBlocks.flatMap((block) => block.items),
        blocks: headBlocks,
        configIndex: index,
        isContinuation: part > 0,
      })
      offset = sliceEnd
      part++
    }
  })

  return out
}
