import {
  algebraTopics,
  calligraphieTopics,
  exerciseTypeById,
  geometryTopics,
  gattegnoTopics,
  grammaireTopics,
  jeuxTopics,
  alphabetisationTopics,
  logiqueTopics,
  santeTopics,
  societeTopics,
  soutienFrTopics,
  acmTopics,
  tcmCscTopics,
  tcmCfrTopics,
  tcfTopics,
  tpmTopics,
  typesForTopic,
  vocabulaireTopics,
} from '@/math/catalog'
import { TCF_DOMAIN } from '@/tcf/catalog'
import { blockPointsTotal, isTpmDomain } from '@/tpm/test'
import {
  ALPHA_LETTER_KINDS,
  ALPHA_SPECIAL_KINDS,
  parseAlphaType,
} from '@/alphabetisation/kinds'
import {
  alphaExerciseTypeId,
  alphaThemeById,
  resolveAlphaSelection,
} from '@/alphabetisation/themes'
import { SOUTIEN_KINDS, parseSoutienType } from '@/francais/soutien/kinds'
import {
  resolveSoutienSelection,
  soutienExerciseTypeId,
} from '@/francais/soutien/themes'
import {
  gramExerciseTypeId,
  resolveGramSubthemeAll,
  subthemesForTopicAll,
} from '@/grammaire/exercises'
import { GRAM_EXERCISE_KINDS } from '@/grammaire/exercises/kinds'
import { COORD_LETTER_MAX, COORD_SHAPES } from '@/math/coord-reperage'
import { TRANSFORM_MAX_POINTS } from '@/math/coord-transformations'
import type { Domain, ExerciseBlock, WorksheetPage } from '@/math/types'

/** Thèmes du sélecteur selon le domaine actif. */
export function topicsForDomain(domain: Domain) {
  return domain === 'algèbre'
    ? algebraTopics
    : domain === 'géométrie'
      ? geometryTopics
      : domain === 'gattegno'
        ? gattegnoTopics
        : domain === 'grammaire'
          ? grammaireTopics
          : domain === 'vocabulaire'
            ? vocabulaireTopics
            : domain === 'société'
              ? societeTopics
              : domain === 'santé'
                ? santeTopics
                : domain === 'acm'
                  ? acmTopics
                  : domain === 'tcm-csc'
                    ? tcmCscTopics
                    : domain === 'tcm-cfr'
                      ? tcmCfrTopics
                      : domain === 'jeux'
                        ? jeuxTopics
                        : domain === 'calligraphie'
                          ? calligraphieTopics
                          : domain === 'soutien-fr'
                            ? soutienFrTopics
                            : domain === 'alphabetisation'
                              ? alphabetisationTopics
                              : domain === 'logique'
                                ? logiqueTopics
                                : isTpmDomain(domain)
                                  ? tpmTopics
                                  : domain === TCF_DOMAIN
                                    ? tcfTopics
                                    : algebraTopics
}

/** Types d’exercice proposés pour le bloc actif. */
export function typeChoicesForBlock(
  domain: Domain,
  block: Pick<ExerciseBlock, 'exerciseType' | 'topic' | 'track'>,
) {
  if (domain === 'soutien-fr') {
    const bankId =
      parseSoutienType(block.exerciseType)?.bankId ??
      resolveSoutienSelection(block.topic, block.exerciseType)?.sound.bankId ??
      'a'
    return SOUTIEN_KINDS.map(
      (kind) => exerciseTypeById[soutienExerciseTypeId(bankId, kind.id)],
    ).filter((t): t is NonNullable<typeof t> => Boolean(t))
  }
  if (domain === 'alphabetisation') {
    const bankId =
      parseAlphaType(block.exerciseType)?.bankId ??
      resolveAlphaSelection(block.topic, block.exerciseType)?.sound.bankId ??
      'a'
    const theme = alphaThemeById(block.topic)
    const kinds =
      theme?.mode === 'special'
        ? ALPHA_SPECIAL_KINDS.filter((k) =>
            Boolean(exerciseTypeById[alphaExerciseTypeId(bankId, k.id)]),
          )
        : ALPHA_LETTER_KINDS
    return kinds
      .map((kind) => exerciseTypeById[alphaExerciseTypeId(bankId, kind.id)])
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
  }
  if (domain === 'grammaire') {
    const sub =
      resolveGramSubthemeAll(block.topic, block.exerciseType) ??
      subthemesForTopicAll(block.topic)[0]
    if (!sub) {
      return typesForTopic(block.topic)
    }
    const theory = sub.theoryTypeIds
      .map((id) => exerciseTypeById[id])
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((t) => ({ ...t, label: 'Théorie' }))
    const practice = GRAM_EXERCISE_KINDS.map((kind) => {
      const id = gramExerciseTypeId(sub.id, kind.id)
      return exerciseTypeById[id]
    }).filter((t): t is NonNullable<typeof t> => Boolean(t))
    return [...theory, ...practice]
  }
  return typesForTopic(
    block.topic,
    domain === 'français' ? (block.track ?? 'voc') : undefined,
  )
}

type MaxQuestionsFlags = {
  isComposer: boolean
  isFormes: boolean
  isTransform: boolean
  isReperage: boolean
  soutienKind: string | undefined
}

/** Plafond du champ Questions / Mots / Lignes selon le type. */
export function maxQuestionsFor({
  isComposer,
  isFormes,
  isTransform,
  isReperage,
  soutienKind,
}: MaxQuestionsFlags): number {
  if (isComposer) return COORD_LETTER_MAX - 1
  if (isFormes) return COORD_SHAPES.length
  if (isTransform) return TRANSFORM_MAX_POINTS
  if (isReperage) return COORD_LETTER_MAX
  if (soutienKind === 'lettres' || soutienKind === 'lettres-maj' || soutienKind === 'lettres-min')
    return 15
  if (soutienKind === 'syllabes' || soutienKind === 'syllabes-cv' || soutienKind === 'syllabes-long')
    return 10
  if (
    soutienKind === 'souligner-maj' ||
    soutienKind === 'souligner-min' ||
    soutienKind === 'syllabes-prononcer'
  ) {
    return 16
  }
  if (soutienKind === 'relier') return 16
  if (
    soutienKind === 'completer' ||
    soutienKind === 'syllabe-son' ||
    soutienKind === 'syllabe-son-qr'
  ) {
    return 18
  }
  if (soutienKind === 'ecouter' || soutienKind === 'ecouter-image') return 30
  if (
    soutienKind === 'lettres-phrase' ||
    soutienKind === 'determinants' ||
    soutienKind === 'dictee'
  ) {
    return 16
  }
  if (soutienKind === 'compter' || soutienKind === 'ordre') return 12
  if (soutienKind === 'lire') return 19
  if (
    soutienKind === 'associer-audio' ||
    soutienKind === 'associer-image' ||
    soutienKind === 'associer-syllabe'
  ) {
    return 3
  }
  return 30
}

/** Total des points du document (toutes les feuilles de l’aperçu). */
export function sheetTotalPoints(
  previewWorksheets: WorksheetPage[],
  pointsPerQuestion: number,
): number {
  return previewWorksheets.reduce(
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
  )
}
