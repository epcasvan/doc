import {
  isCalliPhrasesType,
} from '@/calligraphie/defaults'
import {
  DEFAULT_CALLI_FONT,
  DEFAULT_CALLI_SIZE,
} from '@/calligraphie/fonts'
import {
  initialCalliText,
  isCalligraphieType,
} from '@/calligraphie/generate'
import { frTopicFromCalliTopic } from '@/calligraphie/topics'
import { frTopicFromJeuxTopic, isJeuxLibreTopic } from '@/jeux/topics'
import {
  defaultVocabSelected,
  defaultVocabSubgroup,
  isVocabLearnType,
  isVocabPoolType,
  isVocabProductionType,
  vocabLearnWordsFor,
} from '@/francais/vocab-learn'
import { isGrammarTheoryType } from '@/francais/grammar-theory'
import { parseSoutienType } from '@/francais/soutien/kinds'
import { defaultThemeGameContent, isGameBankType } from '@/jeux/bank'
import { defaultEntriesFor } from '@/jeux/defaults'
import { DEFAULT_GAME_FONT_SIZE } from '@/jeux/font-size'
import { entriesToText } from '@/jeux/parse'
import { isJeuxType } from '@/jeux/templates'
import {
  AXES_DEFAULT_COLS,
  AXES_DEFAULT_ROWS,
  DEFAULT_CELL_MM,
  DEFAULT_FORMES_CELL_MM,
  DEFAULT_UNIT_SQUARES,
  coordSizeFor,
  isReperageCadrans,
  isReperageConstruire,
  isReperageDroites,
  isReperageFormes,
} from '@/math/coord-reperage'
import { isTransformationExercise } from '@/math/coord-transformations'
import { isDraftPadExercise } from '@/math/catalog'
import type { ExerciseBlock, ExerciseType } from '@/math/types'

export function applyType(type: ExerciseType, prev?: ExerciseBlock): Partial<ExerciseBlock> {
  const isProblem = type.id.includes('problemes')
  const isEquation = type.id.startsWith('equations-')
  const isLongMul = type.id.startsWith('multiplication-2chiffres')
  const isDivisionCol = type.id.startsWith('division-colonne')
  const isLectureDense = type.id.endsWith('-entourer') || type.id.endsWith('-cocher')
  const isLecture = type.topic === 'alphabet' || type.topic.startsWith('voyelle-')
  const isSoutienFr = type.topic.startsWith('soutien-')
  const soutienKind = isSoutienFr ? parseSoutienType(type.id)?.kind : undefined
  const isPhrase = type.topic.startsWith('phrase-')
  const isPhraseChart = type.id.startsWith('phrase-tableau-')
  const isFormes = isReperageFormes(type.id)
  const isCadrans = isReperageCadrans(type.id)
  const isDroites = isReperageDroites(type.id)
  const isConstruire = isReperageConstruire(type.id)
  const isTransform = isTransformationExercise(type.id)
  const isGeoCalc = isDraftPadExercise(type.id) && !isProblem && !isEquation
  const isFrenchCom = type.track === 'com'
  const isComQcm =
    type.id.includes('-com-orale') || type.id.includes('-com-ecrite')
  const isTheory = isGrammarTheoryType(type.id)
  const isFrenchLang = type.track === 'voc' || type.track === 'gram'
  const isVocabLearn = isVocabLearnType(type.id)
  const isVocabPool = isVocabPoolType(type.id)
  const isVocabProd = isVocabProductionType(type.id)
  const isJeux = isJeuxType(type.id)
  const isCalli = isCalligraphieType(type.id)
  const isCountIcons = type.id === 'nombres-compter-formes'
  const vocabSubgroup =
    prev?.topic === type.topic && prev.vocabSubgroup
      ? prev.vocabSubgroup
      : defaultVocabSubgroup(type.topic)
  const bankIds = new Set(
    vocabLearnWordsFor(type.topic, vocabSubgroup).map((word) => word.id),
  )
  const preservedSelected =
    prev?.topic === type.topic && prev.vocabSelected?.length
      ? prev.vocabSelected.filter((id) => bankIds.has(id) || id.startsWith('custom-'))
      : []
  const vocabSelected =
    preservedSelected.length > 0
      ? preservedSelected
      : defaultVocabSelected(type.topic, 3, 3, vocabSubgroup)
  const vocabCustomEntries =
    prev?.topic === type.topic ? prev.vocabCustomEntries : undefined
  const preservedGame =
    prev?.exerciseType === type.id && prev.gameEntries?.length
      ? prev.gameEntries
      : undefined
  const jeuxFrTopic = isJeux ? frTopicFromJeuxTopic(type.topic) : undefined
  const themeGame =
    isJeux && isGameBankType(type.id) && jeuxFrTopic
      ? defaultThemeGameContent(type.id, jeuxFrTopic)
      : isJeux && isGameBankType(type.id) && isJeuxLibreTopic(type.topic)
        ? null
        : isJeux && isGameBankType(type.id)
          ? defaultThemeGameContent(type.id)
          : null
  const gameEntries =
    preservedGame ??
    (themeGame?.gameEntries ?? (isJeux ? defaultEntriesFor(type.id) : undefined))
  const gameText =
    prev?.exerciseType === type.id && prev.gameText != null
      ? prev.gameText
      : gameEntries
        ? entriesToText(type.id, gameEntries)
        : undefined
  const gameSource =
    prev?.exerciseType === type.id && prev.gameSource
      ? prev.gameSource
      : isJeux && isJeuxLibreTopic(type.topic)
        ? 'libre'
        : themeGame?.gameSource
  const gameTopic =
    prev?.exerciseType === type.id && prev.gameTopic
      ? prev.gameTopic
      : jeuxFrTopic ?? themeGame?.gameTopic
  const gameSelectedIds =
    prev?.exerciseType === type.id && prev.gameSelectedIds?.length
      ? prev.gameSelectedIds
      : themeGame?.gameSelectedIds
  const seriesDefaults: Record<string, string> = {
    'jeux-vocabulaire': 'Vocabulaire',
    'jeux-devinettes': 'Devinettes',
    'jeux-memory': 'Mémory',
    'jeux-intrus': 'Intrus',
    'jeux-loto': 'Loto',
    'jeux-dominos': 'Dominos',
  }
  const usesSeriesIdentity =
    type.id === 'jeux-memory' ||
    type.id === 'jeux-intrus' ||
    type.id === 'jeux-loto' ||
    type.id === 'jeux-vocabulaire' ||
    type.id === 'jeux-devinettes' ||
    type.id === 'jeux-dominos'
  const gameBackColor =
    prev?.exerciseType === type.id ? prev.gameBackColor : undefined
  const gameSeriesName =
    prev?.exerciseType === type.id && prev.gameSeriesName
      ? prev.gameSeriesName
      : seriesDefaults[type.id]
  const coordSize = coordSizeFor('moyen')
  return {
    exerciseType: type.id,
    topic: type.topic,
    track: type.track,
    columns: type.preferredColumns ?? 2,
    ...(isProblem || isEquation
      ? { count: 2 }
      : isDivisionCol
        ? { count: 3 }
        : isLongMul
          ? { count: 4 }
          : isPhraseChart || isVocabLearn || isJeux || isCalli || isTheory
            ? { count: 1 }
            : isVocabPool
              ? { count: Math.min(6, Math.max(2, vocabSelected.length)) }
              : isPhrase
                ? { count: 6 }
                : isLectureDense
                  ? { count: 4 }
                  : soutienKind === 'lettres'
                    ? { count: 5 }
                    : soutienKind === 'syllabes'
                      ? { count: 3 }
                      : soutienKind === 'relier' || soutienKind === 'completer'
                        ? { count: 12 }
                        : soutienKind === 'ecouter'
                          ? { count: 9 }
                          : soutienKind === 'ecouter-image'
                            ? { count: 15 }
                            : soutienKind === 'syllabe-son'
                              ? { count: 18 }
                              : soutienKind === 'lettres-phrase'
                                ? { count: 8 }
                                : soutienKind === 'determinants' ||
                                    soutienKind === 'ordre'
                                  ? { count: 9 }
                                : soutienKind === 'dictee' || soutienKind === 'compter'
                                  ? { count: 8 }
                                  : soutienKind === 'lire'
                                    ? { count: 20 }
                                    : soutienKind === 'associer-audio' ||
                                        soutienKind === 'associer-image'
                                      ? { count: 2 }
                                        : isLecture || isSoutienFr
                                          ? { count: 6 }
                                          : isGeoCalc || isCountIcons
                                            ? { count: 2 }
                                            : isFrenchCom
                                              ? { count: 4 }
                                              : isFrenchLang
                                                ? { count: 6 }
                                                : isFormes
                                                  ? { count: 5 }
                                                  : isCadrans
                                                    ? { count: 6 }
                                                    : isDroites || isConstruire
                                                      ? { count: 5 }
                                                      : isTransform
                                                        ? { count: 4 }
                                                        : {}),
    ...(isVocabPool
      ? {
          columns: 1,
          vocabSelected,
          vocabSubgroup,
          vocabCustomEntries,
          vocabRows: isVocabLearn ? (prev?.vocabRows ?? 3) : undefined,
          vocabCols: isVocabLearn ? (prev?.vocabCols ?? 3) : undefined,
          vocabLineCh: isVocabProd
            ? (prev?.vocabLineCh ?? (type.id.includes('phrase') || type.id.includes('dictee') ? 32 : 12))
            : undefined,
        }
      : {
          vocabRows: undefined,
          vocabCols: undefined,
          vocabSelected: undefined,
          vocabSubgroup: undefined,
          vocabCustomEntries: undefined,
          vocabLineCh: undefined,
        }),
    ...(isJeux
      ? {
          columns: 1,
          gameEntries,
          gameText,
          gameSource,
          gameTopic,
          gameSelectedIds,
          gameBackColor: usesSeriesIdentity ? gameBackColor : undefined,
          gameSeriesName: usesSeriesIdentity ? gameSeriesName : undefined,
          gameBorderId:
            prev?.exerciseType === type.id
              ? (prev.gameBorderRectoId ?? prev.gameBorderId)
              : undefined,
          gameBorderRectoId:
            prev?.exerciseType === type.id
              ? (prev.gameBorderRectoId ?? prev.gameBorderId)
              : undefined,
          gameBorderVersoId:
            prev?.exerciseType === type.id
              ? (prev.gameBorderVersoId ?? prev.gameBorderId)
              : undefined,
          gameFontSize:
            prev?.exerciseType === type.id
              ? (prev.gameFontSize ?? DEFAULT_GAME_FONT_SIZE)
              : DEFAULT_GAME_FONT_SIZE,
          gameAlpha:
            type.id === 'jeux-vocabulaire'
              ? prev?.exerciseType === type.id
                ? Boolean(prev.gameAlpha)
                : false
              : undefined,
        }
      : {
          gameEntries: undefined,
          gameText: undefined,
          gameSource: undefined,
          gameTopic: undefined,
          gameSelectedIds: undefined,
          gameBackColor: undefined,
          gameSeriesName: undefined,
          gameBorderId: undefined,
          gameBorderRectoId: undefined,
          gameBorderVersoId: undefined,
          gameFontSize: undefined,
          gameAlpha: undefined,
        }),
    ...(soutienKind === 'mots'
      ? {
          soutienMotsLibre:
            prev?.exerciseType === type.id ? Boolean(prev.soutienMotsLibre) : false,
          soutienMotsEntries:
            prev?.exerciseType === type.id ? prev.soutienMotsEntries : undefined,
        }
      : {
          soutienMotsLibre: undefined,
          soutienMotsEntries: undefined,
        }),
    ...(soutienKind === 'completer'
      ? {
          soutienCompleterLibre:
            prev?.exerciseType === type.id ? Boolean(prev.soutienCompleterLibre) : false,
          soutienCompleterEntries:
            prev?.exerciseType === type.id ? prev.soutienCompleterEntries : undefined,
        }
      : {
          soutienCompleterLibre: undefined,
          soutienCompleterEntries: undefined,
        }),
    ...(soutienKind === 'relier' || soutienKind === 'completer'
      ? {
          columns:
            prev?.exerciseType === type.id
              ? Math.min(2, Math.max(1, prev.columns ?? 2))
              : 2,
        }
      : soutienKind === 'ecouter' || soutienKind === 'syllabe-son'
        ? {
            columns:
              prev?.exerciseType === type.id
                ? Math.min(3, Math.max(1, prev.columns ?? 3))
                : 3,
          }
        : soutienKind === 'ecouter-image'
          ? {
              columns:
                prev?.exerciseType === type.id
                  ? Math.min(5, Math.max(3, prev.columns ?? 5))
                  : 5,
            }
          : {}),
    ...(isCalli
      ? (() => {
          const topic = type.topic.startsWith('calli-')
            ? type.topic
            : prev?.topic?.startsWith('calli-')
              ? prev.topic
              : type.topic
          const frTopic = frTopicFromCalliTopic(topic)
          const subgroup =
            prev?.topic === topic && prev.vocabSubgroup
              ? prev.vocabSubgroup
              : frTopic
                ? defaultVocabSubgroup(frTopic)
                : undefined
          const sameKind =
            prev != null &&
            isCalligraphieType(prev.exerciseType) &&
            isCalliPhrasesType(prev.exerciseType) === isCalliPhrasesType(type.id)
          const keepText =
            sameKind && prev.topic === topic && prev.calliText != null && prev.calliText !== ''
          return {
            columns: 1,
            topic,
            vocabSubgroup: subgroup,
            calliText: keepText
              ? prev.calliText
              : initialCalliText({
                  exerciseType: type.id,
                  topic,
                  difficulty: prev?.difficulty ?? 'moyen',
                  calliSize: prev?.calliSize ?? DEFAULT_CALLI_SIZE,
                  vocabSubgroup: subgroup,
                }),
            calliFont:
              prev != null && isCalligraphieType(prev.exerciseType) && prev.calliFont
                ? prev.calliFont
                : DEFAULT_CALLI_FONT,
            calliSize:
              prev != null && isCalligraphieType(prev.exerciseType) && prev.calliSize
                ? prev.calliSize
                : DEFAULT_CALLI_SIZE,
          }
        })()
      : { calliText: undefined, calliFont: undefined, calliSize: undefined }),
    ...(isFormes
      ? {
          coordLibre: false,
          coordCols: coordSize.cols,
          coordRows: coordSize.rows,
          coordAxis: 'letters' as const,
          coordMarks: [],
          coordRange: undefined,
          coordCellMm: DEFAULT_FORMES_CELL_MM,
          coordUnitSquares: undefined,
        }
      : isCadrans || isDroites || isConstruire || isTransform
        ? {
            coordLibre:
              isCadrans || isTransform || isDroites || isConstruire ? false : undefined,
            coordQuestionsLibre: undefined,
            coordCols: AXES_DEFAULT_COLS,
            coordRows: AXES_DEFAULT_ROWS,
            coordAxis: undefined,
            coordMarks: isCadrans || isTransform ? [] : undefined,
            coordRange: undefined,
            coordCellMm: DEFAULT_CELL_MM,
            coordUnitSquares: DEFAULT_UNIT_SQUARES,
            coordOriginCol: undefined,
            coordOriginRow: undefined,
          }
        : {
            coordLibre: undefined,
            coordQuestionsLibre: undefined,
            coordCols: undefined,
            coordRows: undefined,
            coordAxis: undefined,
            coordMarks: undefined,
            coordRange: undefined,
            coordCellMm: undefined,
            coordUnitSquares: undefined,
          }),
    continueOnNextPage: isComQcm || isTheory ? (prev?.continueOnNextPage ?? isTheory) : undefined,
    oralAnswerModes: type.id.includes('-com-orale')
      ? resizeOralAnswerModes(prev?.oralAnswerModes, 4)
      : undefined,
  }
}

export function resizeDraftGrids(prev: boolean[] | undefined, count: number): boolean[] {
  return Array.from({ length: count }, (_, i) => prev?.[i] ?? true)
}

export function resizeOralAnswerModes(
  prev: Array<'qcm' | 'text' | 'images'> | undefined,
  count: number,
): Array<'qcm' | 'text' | 'images'> {
  return Array.from({ length: count }, (_, i) => prev?.[i] ?? 'qcm')
}

export function isProblemExercise(typeId: string): boolean {
  return isDraftPadExercise(typeId)
}

export function isOralComprehensionExercise(typeId: string): boolean {
  return typeId.includes('-com-orale')
}

export function cycleOralMode(
  current: 'qcm' | 'text' | 'images',
  imagesAvailable: boolean,
): 'qcm' | 'text' | 'images' {
  if (current === 'qcm') return 'text'
  if (current === 'text') return imagesAvailable ? 'images' : 'qcm'
  return 'qcm'
}
