import { isOralComprehensionExercise } from '@/components/generator/page-helpers'
import { maxQuestionsFor } from '@/components/generator/generator-derived'
import {
  defaultCalliPhraseCount,
  defaultCalliWordCount,
  isCalliPhrasesType,
  normalizeCalliFields,
  parseCalliLines,
} from '@/calligraphie/defaults'
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
import { soutienBankById } from '@/francais/soutien/banks'
import { type1WordPool, type1Words } from '@/francais/soutien/generate'
import { parseAlphaType } from '@/alphabetisation/kinds'
import { resolveAlphaSelection } from '@/alphabetisation/themes'
import { parseSoutienType } from '@/francais/soutien/kinds'
import { resolveSoutienSelection } from '@/francais/soutien/themes'
import {
  isReperageCadrans,
  isReperageComposer,
  isReperageConstruire,
  isReperageDroites,
  isReperageFormes,
  isReperagePage,
} from '@/math/coord-reperage'
import {
  isTransformationCentrale,
  isTransformationExercise,
  isTransformationPlacer,
} from '@/math/coord-transformations'
import { DIFFICULTY_OPTIONS } from '@/math/difficulty'
import { isQuadExercise } from '@/math/catalog'
import {
  AREA_QUAD_FIGURES,
  PERI_QUAD_FIGURES,
  VOLUME_QUAD_FIGURES,
} from '@/math/mesures'
import { TCF_DOMAIN, tcfNiveauFromDifficulty } from '@/tcf/catalog'
import { isTcmDomain } from '@/tcm/test'
import { isTcmCfrDomain } from '@/tcm-cfr/test'
import { isTcmFamilyConsignesType } from '@/tcm/informations'
import { defaultEntriesFor } from '@/jeux/defaults'
import { entriesToText } from '@/jeux/parse'
import { templateFor } from '@/jeux/templates'
import type { ExerciseBlock, PageConfig, WorksheetPage } from '@/math/types'

/** Drapeaux et dérivés du bloc / page actifs (purs). */
export function deriveBlockContext(
  activePage: PageConfig,
  activeBlock: ExerciseBlock,
  worksheets: WorksheetPage[],
  safeSheetIndex: number,
  safeBlockIndex: number,
  questionsOverflow: boolean,
) {
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
const isAlphabetisation = activePage.domain === 'alphabetisation'
const isTcm = isTcmDomain(activePage.domain)
const isTcmCfr = isTcmCfrDomain(activePage.domain)
/** TCM / TCM CFR : test multi-pages packé, UI simplifiée. */
const isTcmLike = isTcm || isTcmCfr
const isTcf = activePage.domain === TCF_DOMAIN
/** Page 1 Informations (TCM / CFR / CSC) : pas de Questions ni Colonnes. */
const isTcmInfoPage = isTcmFamilyConsignesType(activeBlock.exerciseType)
const tcfNiveau = tcfNiveauFromDifficulty(activeBlock.difficulty)
const soutienParsed = isSoutienFr
  ? parseSoutienType(activeBlock.exerciseType)
  : isAlphabetisation
    ? parseAlphaType(activeBlock.exerciseType)
    : null
const alphaParsed = isAlphabetisation ? parseAlphaType(activeBlock.exerciseType) : null
const soutienKind = soutienParsed?.kind
const soutienSelection = isSoutienFr
  ? resolveSoutienSelection(activeBlock.topic, activeBlock.exerciseType)
  : isAlphabetisation
    ? resolveAlphaSelection(activeBlock.topic, activeBlock.exerciseType)
    : null
const isSoutienMots = soutienKind === 'mots'
const isSoutienMotsMeles = soutienKind === 'mots-meles'
const isSoutienCompleter = soutienKind === 'completer'
const isSoutienEcouter =
  soutienKind === 'ecouter' ||
  soutienKind === 'ecouter-image' ||
  soutienKind === 'syllabe-son' ||
  soutienKind === 'syllabe-son-qr' ||
  soutienKind === 'lettres-phrase'
const isSoutienRelier = soutienKind === 'relier'
const isSoutienLignes =
  soutienKind === 'lettres' ||
  soutienKind === 'lettres-maj' ||
  soutienKind === 'lettres-min' ||
  soutienKind === 'syllabes' ||
  soutienKind === 'syllabes-cv' ||
  soutienKind === 'syllabes-long'
/** Types 4–11 / 15 : le champ compte des mots (pas des « questions » génériques). */
const isSoutienMotsCount =
  soutienKind === 'relier' ||
  soutienKind === 'completer' ||
  soutienKind === 'ecouter' ||
  soutienKind === 'ecouter-image' ||
  soutienKind === 'syllabe-son' ||
  soutienKind === 'syllabe-son-qr' ||
  soutienKind === 'lettres-phrase' ||
  soutienKind === 'determinants' ||
  soutienKind === 'dictee' ||
  soutienKind === 'associer-audio' ||
  soutienKind === 'associer-image' ||
  soutienKind === 'associer-syllabe' ||
  soutienKind === 'syllabes-prononcer'
/** Type 6 / 8 / 8-QR : colonnes (Alpha type 6 = 2–3 ; sinon 1–3). */
const isSoutienCols123 =
  soutienKind === 'completer' ||
  soutienKind === 'ecouter' ||
  soutienKind === 'syllabe-son' ||
  soutienKind === 'syllabe-son-qr'
/** Type 7 : grille images 3–5 colonnes. */
const isSoutienCols345 = soutienKind === 'ecouter-image'
/** Type 1 Alpha : 2 ou 3 colonnes (4 ou 6 mots). */
const isAlphaMotsCols = isAlphabetisation && soutienKind === 'mots'
/** Types 11–12 Alpha : lecture de syllabes 4 / 5 / 6 colonnes. */
const isAlphaSyllabeTableCols =
  isAlphabetisation &&
  (soutienKind === 'syllabes-cv' || soutienKind === 'syllabes-long')
/** Type 13 Alpha : prononcer 1 ou 2 colonnes. */
const isAlphaPrononcerCols = isAlphabetisation && soutienKind === 'syllabes-prononcer'
/** Types sans option colonnes (lettre / souligner). */
const hideColumnsOption =
  soutienKind === 'lettres-maj' ||
  soutienKind === 'lettres-min' ||
  soutienKind === 'souligner-maj' ||
  soutienKind === 'souligner-min' ||
  soutienKind === 'lettres' ||
  soutienKind === 'syllabes' ||
  soutienKind === 'associer-syllabe' ||
  soutienKind === 'associer-audio' ||
  soutienKind === 'associer-image' ||
  soutienKind === 'mots' && !isAlphabetisation
const soutienBank =
  isSoutienFr || isAlphabetisation
    ? soutienBankById(
        soutienParsed?.bankId ??
          alphaParsed?.bankId ??
          soutienSelection?.sound.bankId ??
          'a',
      )
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
const maxQuestions = maxQuestionsFor({
  isComposer,
  isFormes,
  isTransform,
  isReperage,
  soutienKind,
})
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
  const quadPool = activeBlock.exerciseType.startsWith('volumes-')
    ? VOLUME_QUAD_FIGURES
    : activeBlock.exerciseType.startsWith('aires-')
      ? AREA_QUAD_FIGURES
      : PERI_QUAD_FIGURES

  return {
    isReperage,
    isPhraseChart,
    isVocabLearn,
    isVocabPool,
    isVocabProd,
    isGramTheory,
    isPhraseDomain,
    isJeuxDomain,
    isCalliDomain,
    isSoutienFr,
    isAlphabetisation,
    isTcm,
    isTcmCfr,
    isTcmLike,
    isTcf,
    isTcmInfoPage,
    tcfNiveau,
    soutienParsed,
    soutienKind,
    soutienSelection,
    isSoutienMots,
    isSoutienMotsMeles,
    isSoutienCompleter,
    isSoutienEcouter,
    isSoutienRelier,
    isSoutienLignes,
    isSoutienMotsCount,
    isSoutienCols123,
    isSoutienCols345,
    isAlphaMotsCols,
    isAlphaSyllabeTableCols,
    isAlphaPrononcerCols,
    hideColumnsOption,
    soutienBank,
    soutienType1Words,
    soutienType1WordPool,
    calliFrTopic,
    calliIsLibre,
    calliIsPhrases,
    vocabSubgroups,
    activeVocabSubgroup,
    vocabBankWords,
    vocabCustomWords,
    vocabLearnWords,
    vocabSelectedIds,
    usesCefrLevel,
    vocabDifficultyOptions,
    calliDefaultCount,
    calliFields,
    jeuxTemplate,
    jeuxText,
    isCadrans,
    isComposer,
    isFormes,
    isDroites,
    isConstruire,
    isTransform,
    isTransformCentrale,
    isTransformPlacer,
    maxQuestions,
    activeSheetBlock,
    bankQuestionCap,
    bankOverflow,
    questionsInputOverflow,
    isQuadType,
    isNumberLibreDomain,
    quadPool,
  }
}
