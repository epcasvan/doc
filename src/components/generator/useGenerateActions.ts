import type { Dispatch, SetStateAction } from 'react'
import { isPhraseLibreEditable } from '@/francais/PhraseLibreEditor'
import { buildAlphaSeriesPages } from '@/alphabetisation/series'
import { alphaFicheTitle, resolveAlphaSelection } from '@/alphabetisation/themes'
import { buildSoutienSeriesPages, soutienFicheTitle } from '@/francais/soutien/series'
import { resolveSoutienSelection } from '@/francais/soutien/themes'
import {
  isCalligraphieType,
  reshuffleCalliContent,
} from '@/calligraphie/generate'
import { parseCalliLines } from '@/calligraphie/defaults'
import { reshuffleGameContent } from '@/jeux/bank'
import { isJeuxType } from '@/jeux/templates'
import { TCF_DOMAIN } from '@/tcf/catalog'
import { buildTcfRandomTestPages } from '@/tcf/generate'
import type { TcfNiveau } from '@/tcf/types'
import { buildWorksheets } from '@/math/generate'
import { pageBlocks, setPageBlock } from '@/math/page-model'
import { randomSeed } from '@/math/rng'
import type {
  ExerciseBlock,
  PageConfig,
  PreviewMode,
} from '@/math/types'
import type { InstitutionalHeader } from '@/components/math/PrintDocumentChrome'
import { isTcmFamilyExercise, recalcTcmLibreItems } from '@/tcm/libre-recalc'

export type UseGenerateActionsParams = {
  pages: PageConfig[]
  setPages: Dispatch<SetStateAction<PageConfig[]>>
  setSeed: Dispatch<SetStateAction<number>>
  setMode: Dispatch<SetStateAction<PreviewMode>>
  setEvalMode: Dispatch<SetStateAction<boolean>>
  setSheetIndex: Dispatch<SetStateAction<number>>
  setBlockIndex: Dispatch<SetStateAction<number>>
  setInstitutional: Dispatch<SetStateAction<InstitutionalHeader>>
  setLibreSnapshot: Dispatch<SetStateAction<PageConfig[] | null>>
  pageIndex: number
  safeBlockIndex: number
  seed: number
  libreMode: boolean
  activeBlock: ExerciseBlock
  tcfNiveau: TcfNiveau
  calliFieldsLength: number
  isPhraseDomain: boolean
  isCalliDomain: boolean
  isJeuxDomain: boolean
  isTcf: boolean
  updatePage: (patch: Partial<PageConfig>) => void
}

export function useGenerateActions({
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
  tcfNiveau,
  calliFieldsLength,
  isPhraseDomain,
  isCalliDomain,
  isJeuxDomain,
  isTcf,
  updatePage,
}: UseGenerateActionsParams) {
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
      // TCM / TCM CFR : recalcule les réponses à partir des valeurs éditées.
      if (libreMode && Array.isArray(block.libreItems) && block.libreItems.length > 0) {
        const frozen = isTcmFamilyExercise(block.exerciseType)
          ? recalcTcmLibreItems(block.libreItems, block.exerciseType)
          : block.libreItems.map((item) => ({ ...item }))
        return current.map((p, i) =>
          i !== pageIndex
            ? p
            : setPageBlock(p, safeBlockIndex, {
                contentSeed: nextLocal,
                libreItems: frozen,
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
    const sel = resolveSoutienSelection(activeBlock.topic, activeBlock.exerciseType)
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

  /** Alphabétisation : Générer prépare toutes les fiches de la leçon / du son. */
  function drawAlphaSeries() {
    const sel = resolveAlphaSelection(activeBlock.topic, activeBlock.exerciseType)
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
      documentTitle: alphaFicheTitle(sel.letter),
    }))
    setPages(buildAlphaSeriesPages(sel.sound.bankId, sel.theme.id))
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
        countHint: Math.max(parseCalliLines(activeBlock.calliText).length, calliFieldsLength),
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
        } else if (
          page.domain === TCF_DOMAIN ||
          isTcmFamilyExercise(block.exerciseType) ||
          page.domain === 'tcm' ||
          page.domain === 'tcm-cfr' ||
          page.domain === 'tcm-csc'
        ) {
          // Relâche le tirage figé pour re-mélanger (libre inclus).
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

  return {
    validateManual,
    drawTcfTest,
    drawSoutienSeries,
    drawAlphaSeries,
    generate,
    regenerateBlock,
  }
}
