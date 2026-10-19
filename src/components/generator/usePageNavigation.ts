import type { Dispatch, SetStateAction } from 'react'
import { useEffect } from 'react'
import {
  accountCanAccessDomain,
} from '@/access'
import { applyType, isOralComprehensionExercise, isProblemExercise } from '@/components/generator/page-helpers'
import {
  defaultPage,
  exerciseTypeById,
  firstTypeFor,
  isQuadExercise,
  typesForTopic,
} from '@/math/catalog'
import {
  TCF_DOCUMENT_TITLE,
  TCF_DOMAIN,
  TCF_SLOTS,
} from '@/tcf/catalog'
import { tcfConsignesPage, tcfPage } from '@/tcf/generate'
import {
  buildTpmTestPages,
  isTpmDomain,
  TPM_DOCUMENT_TITLE,
} from '@/tpm/test'
import {
  buildTcmCfrTestPages,
  isTcmCfrDomain,
  TCM_CFR_DOCUMENT_TITLE,
} from '@/tcm-cfr/test'
import {
  isCalliPhrasesType,
} from '@/calligraphie/defaults'
import { frTopicFromCalliTopic } from '@/calligraphie/topics'
import { defaultVocabSubgroup } from '@/francais/vocab-learn'
import { isJeuxType } from '@/jeux/templates'
import { DEFAULT_GAME_FONT_SIZE } from '@/jeux/font-size'
import { parseAlphaType } from '@/alphabetisation/kinds'
import {
  alphaExerciseTypeId,
  alphaFicheTitle,
  alphaThemeById,
  resolveAlphaSelection,
} from '@/alphabetisation/themes'
import { parseSoutienType } from '@/francais/soutien/kinds'
import { soutienFicheTitle } from '@/francais/soutien/series'
import {
  resolveSoutienSelection,
  soutienExerciseTypeId,
  soutienThemeById,
} from '@/francais/soutien/themes'
import { addPageBlock, pageBlocks, stampExerciseNumbers } from '@/math/page-model'
import type { InstitutionalHeader } from '@/components/math/PrintDocumentChrome'
import type {
  Domain,
  ExerciseBlock,
  PageConfig,
  PreviewMode,
  WorksheetPage,
} from '@/math/types'

export type UsePageNavigationParams = {
  accessAccount: ReturnType<typeof import('@/access').readAccessAccount>
  allowedDomains: Domain[]
  activePage: PageConfig
  activeBlock: ExerciseBlock
  pageIndex: number
  pageExerciseBlocks: ExerciseBlock[]
  worksheets: WorksheetPage[]
  soutienSelection:
    | ReturnType<typeof resolveSoutienSelection>
    | ReturnType<typeof resolveAlphaSelection>
  soutienParsed: ReturnType<typeof parseSoutienType> | ReturnType<typeof parseAlphaType>
  updatePage: (patch: Partial<PageConfig>) => void
  setPages: Dispatch<SetStateAction<PageConfig[]>>
  setSheetIndex: Dispatch<SetStateAction<number>>
  setBlockIndex: Dispatch<SetStateAction<number>>
  setEvalMode: Dispatch<SetStateAction<boolean>>
  setPointsPerQuestion: Dispatch<SetStateAction<number>>
  setMode: Dispatch<SetStateAction<PreviewMode>>
  setInstitutional: Dispatch<SetStateAction<InstitutionalHeader>>
}

export function usePageNavigation({
  accessAccount,
  allowedDomains,
  activePage,
  activeBlock,
  pageIndex,
  pageExerciseBlocks,
  worksheets,
  soutienSelection,
  soutienParsed,
  updatePage,
  setPages,
  setSheetIndex,
  setBlockIndex,
  setEvalMode,
  setPointsPerQuestion,
  setMode,
  setInstitutional,
}: UsePageNavigationParams) {
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
    // Insérée juste après la page active, pas en fin de document.
    setPages((current) => [...current.slice(0, pageIndex + 1), next, ...current.slice(pageIndex + 1)])
    setSheetIndex(worksheets.filter((sheet) => (sheet.configIndex ?? 0) <= pageIndex).length)
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
      current.map((page, index) => {
        if (index !== pageIndex) return page
        const blocks = pageBlocks(page)
        const sheet = worksheets.find(
          (item) => (item.configIndex ?? 0) === pageIndex && item.blocks.length === blocks.length,
        )
        const numbers = blocks.map(
          (block, blockIdx) =>
            sheet?.blocks[blockIdx]?.exerciseIndex ?? block.exerciseNo ?? blockIdx + 1,
        )
        const nextNo = Math.max(0, ...numbers) + 1
        return addPageBlock(stampExerciseNumbers(page, numbers), { ...newBlock, exerciseNo: nextNo })
      }),
    )
    setBlockIndex(pageExerciseBlocks.length)
  }

  function changeDomain(next: Domain) {
    if (!accountCanAccessDomain(accessAccount, next)) return
    setBlockIndex(0)
    if (isTpmDomain(next)) {
      setSheetIndex(0)
      setPages(buildTpmTestPages())
      setEvalMode(true)
      setPointsPerQuestion(1)
      setMode('student')
      setInstitutional((current) => ({
        ...current,
        course: 'Mathématiques',
        documentTitle: TPM_DOCUMENT_TITLE,
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
    const leavingTpm =
      isTpmDomain(activePage.domain) ||
      isTcmCfrDomain(activePage.domain) ||
      activePage.domain === TCF_DOMAIN
    if (leavingTpm) {
      setSheetIndex(0)
      setPages([{ ...defaultPage(next), ...applyType(type), domain: next }])
    } else {
      updatePage({ domain: next, ...applyType(type) })
    }
    if (
      next === 'français' ||
      next === 'alphabetisation' ||
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
    if (next === 'jeux' || next === 'calligraphie' || next === 'soutien-fr' || next === 'alphabetisation') {
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
    if (next === 'alphabetisation') {
      const sel = resolveAlphaSelection(type.topic, type.id)
      if (sel) {
        setInstitutional((current) => ({
          ...current,
          course: 'Français',
          documentTitle: alphaFicheTitle(sel.letter),
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
    if (activePage.domain === 'alphabetisation') {
      const parsed = parseAlphaType(activeBlock.exerciseType)
      const theme = alphaThemeById(topic)
      const firstLetter = theme?.letters[0]
      const firstSound = firstLetter?.sounds[0]
      const preferredKind = parsed?.kind ?? 'mots'
      const candidateId = firstSound
        ? alphaExerciseTypeId(firstSound.bankId, preferredKind)
        : undefined
      const type =
        (candidateId ? exerciseTypeById[candidateId] : undefined) ??
        firstTypeFor('alphabetisation', topic)
      if (firstLetter) {
        setInstitutional((current) => ({
          ...current,
          course: 'Français',
          documentTitle: alphaFicheTitle(firstLetter),
        }))
      }
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
    const isAlpha = activePage.domain === 'alphabetisation'
    const nextId = isAlpha
      ? alphaExerciseTypeId(sound.bankId, kind)
      : soutienExerciseTypeId(sound.bankId, kind)
    const type =
      exerciseTypeById[nextId] ??
      (isAlpha ? firstTypeFor('alphabetisation', soutienSelection.theme.id) : undefined)
    if (!type) return
    setInstitutional((current) => ({
      ...current,
      course: 'Français',
      documentTitle: isAlpha ? alphaFicheTitle(letter) : soutienFicheTitle(letter),
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
    const isAlpha = activePage.domain === 'alphabetisation'
    const nextId = isAlpha
      ? alphaExerciseTypeId(sound.bankId, kind)
      : soutienExerciseTypeId(sound.bankId, kind)
    const type = exerciseTypeById[nextId]
    if (!type) return
    setInstitutional((current) => ({
      ...current,
      course: 'Français',
      documentTitle: isAlpha
        ? alphaFicheTitle(soutienSelection.letter)
        : soutienFicheTitle(soutienSelection.letter),
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

  return {
    createNextExerciseBlock,
    addPage,
    removePage,
    addExerciseOnPage,
    changeDomain,
    changeTopic,
    changeSoutienLetter,
    changeSoutienSound,
  }
}
