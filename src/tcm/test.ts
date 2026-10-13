/**
 * Test de placement mathématiques (TCM) — chronologie calquée sur
 * soutien-scolaire `PLACEMENT_MATH_EXERCISES` (36 exercices).
 * Chaque étape réutilise un type déjà présent en algèbre / géométrie
 * (ou un type TCM dédié pour les premiers exercices).
 */
import type { Difficulty, Domain, ExerciseBlock, PageConfig } from '@/math/types'
import { exerciseTypeById, isDraftPadExercise } from '@/math/catalog'

export const TCM_DOMAIN: Domain = 'tcm'

export const TCM_DOCUMENT_TITLE = 'Test de connaissance de mathématiques'

type TcmBlockSpec = {
  exerciseType: string
  count: number
  columns?: 1 | 2 | 3
  /** Points par question (défaut 1). */
  pointsPerQuestion?: number
  /** N° d’exercice affiché (si différent de l’ordre chronologique). */
  exerciseNo?: number
}

type TcmStepSpec = {
  /** N° d’exercice dans le TCM (1–36, suite continue). */
  id: number
  label: string
  blocks: readonly TcmBlockSpec[]
}

/**
 * Recette chronologique TCM → types doc-prof.
 * counts / columns repris des printQuestions / printColumns soutien-scolaire
 * quand disponibles ; géométrie périmètre+aire = 2 blocs.
 */
export const TCM_STEPS: readonly TcmStepSpec[] = [
  { id: 1, label: 'Compter les formes', blocks: [{ exerciseType: 'nombres-compter-formes', count: 2, columns: 2 }] },
  {
    id: 2,
    label: 'Comparer (10–100)',
    blocks: [{ exerciseType: 'tcm-comparer', count: 2, columns: 2, pointsPerQuestion: 1 }],
  },
  { id: 3, label: 'Suites numériques', blocks: [{ exerciseType: 'tcm-suite', count: 2, columns: 2 }] },
  {
    id: 4,
    label: 'Additions et soustractions',
    blocks: [{ exerciseType: 'tcm-operations', count: 6, columns: 2, pointsPerQuestion: 1 }],
  },
  {
    id: 5,
    label: 'Colonnes (+ / −) 3 chiffres',
    blocks: [{ exerciseType: 'tcm-add-sub-col-3', count: 2, columns: 2 }],
  },
  {
    id: 6,
    label: 'Décomposer (11–99)',
    blocks: [{ exerciseType: 'tcm-decompose-99', count: 2, columns: 1 }],
  },
  {
    id: 7,
    label: 'Comparer (101–999)',
    blocks: [{ exerciseType: 'nombres-comparer', count: 2, columns: 2, pointsPerQuestion: 1 }],
  },
  {
    id: 8,
    label: 'Grandes suites',
    blocks: [{ exerciseType: 'tcm-grandes-suites', count: 2, columns: 1 }],
  },
  {
    id: 9,
    label: 'Calcul mixte (+ − × ÷)',
    blocks: [{ exerciseType: 'tcm-quatre-ops', count: 6, columns: 2, pointsPerQuestion: 0.5 }],
  },
  {
    id: 10,
    label: 'Décomposer (1000–9999)',
    blocks: [{ exerciseType: 'tcm-decompose-9999', count: 2, columns: 1 }],
  },
  {
    id: 11,
    label: 'Colonnes (+ / −) 4 chiffres',
    blocks: [{ exerciseType: 'tcm-add-sub-col-4', count: 2, columns: 2 }],
  },
  {
    id: 12,
    label: 'Multiplication et division en colonnes',
    blocks: [{ exerciseType: 'tcm-mul-div-col', count: 2, columns: 2 }],
  },
  {
    id: 13,
    label: 'Rectangle (périmètre et aire)',
    blocks: [{ exerciseType: 'tcm-rect-peri-aire', count: 1, columns: 1, pointsPerQuestion: 2 }],
  },
  {
    id: 14,
    label: 'Suites (6 termes)',
    blocks: [{ exerciseType: 'tcm-suites-6', count: 2, columns: 1 }],
  },
  {
    id: 15,
    label: 'Trier des nombres',
    blocks: [{ exerciseType: 'tcm-ranger', count: 2, columns: 1 }],
  },
  {
    id: 16,
    label: 'Additions et soustractions décimales',
    blocks: [{ exerciseType: 'tcm-dec-add-sub', count: 2, columns: 2 }],
  },
  {
    id: 17,
    label: 'Multiplications posées (entier et décimal)',
    blocks: [{ exerciseType: 'tcm-mul-mixte', count: 2, columns: 2 }],
  },
  {
    id: 18,
    label: 'Divisions posées (entier et décimal)',
    blocks: [{ exerciseType: 'tcm-div-mixte', count: 2, columns: 2 }],
  },
  {
    id: 19,
    label: 'Colorier les fractions',
    blocks: [{ exerciseType: 'tcm-frac-color', count: 2, columns: 2, pointsPerQuestion: 1 }],
  },
  {
    id: 20,
    label: 'Lire les fractions',
    blocks: [{ exerciseType: 'tcm-frac-read', count: 2, columns: 2, pointsPerQuestion: 1 }],
  },
  {
    id: 21,
    label: 'Conversions de longueur',
    blocks: [{ exerciseType: 'conversions-longueur', count: 6, columns: 2 }],
  },
  {
    id: 22,
    label: 'Parallélogramme (périmètre et aire)',
    blocks: [{ exerciseType: 'tcm-para-peri-aire', count: 1, columns: 1, pointsPerQuestion: 2 }],
  },
  {
    id: 23,
    label: 'Triangle (périmètre et aire)',
    blocks: [{ exerciseType: 'tcm-tri-peri-aire', count: 1, columns: 1, pointsPerQuestion: 2 }],
  },
  {
    id: 24,
    label: 'Losange (périmètre et aire)',
    blocks: [{ exerciseType: 'tcm-rhombus-peri-aire', count: 1, columns: 1, pointsPerQuestion: 2 }],
  },
  {
    id: 25,
    label: 'Opérations décimales',
    blocks: [{ exerciseType: 'tcm-ops-decimales', count: 6, columns: 2 }],
  },
  {
    id: 26,
    label: 'Puissances et racines',
    blocks: [{ exerciseType: 'tcm-puissances-mixte', count: 4, columns: 2 }],
  },
  {
    id: 27,
    label: 'Priorité des opérations',
    blocks: [{ exerciseType: 'tcm-priorite-ops', count: 2, columns: 1, pointsPerQuestion: 1.5 }],
  },
  {
    id: 28,
    label: 'Nombres relatifs',
    blocks: [{ exerciseType: 'tcm-relatifs-ops', count: 4, columns: 2 }],
  },
  {
    id: 29,
    label: 'Fractions',
    blocks: [{ exerciseType: 'tcm-fractions-mixte', count: 6, columns: 2 }],
  },
  {
    id: 30,
    label: 'Pourcentage et règle de trois',
    blocks: [{ exerciseType: 'tcm-proportion-kg', count: 2, columns: 1, pointsPerQuestion: 1 }],
  },
  {
    id: 31,
    label: 'Simplification algébrique',
    blocks: [{ exerciseType: 'tcm-expressions-reduire', count: 2, columns: 1, pointsPerQuestion: 1 }],
  },
  {
    id: 32,
    label: 'Évaluer des expressions',
    blocks: [{ exerciseType: 'tcm-expressions-evaluer', count: 2, columns: 1, pointsPerQuestion: 2 }],
  },
  {
    id: 33,
    label: 'Résoudre des équations',
    blocks: [{ exerciseType: 'tcm-equations', count: 2, columns: 1, pointsPerQuestion: 2 }],
  },
  {
    id: 34,
    label: 'Conversions d’unités',
    blocks: [{ exerciseType: 'tcm-conversions-mixte', count: 4, columns: 2 }],
  },
  {
    id: 35,
    label: 'Trapèze (périmètre et aire)',
    blocks: [{ exerciseType: 'tcm-trap-peri-aire', count: 1, columns: 1, pointsPerQuestion: 2 }],
  },
  {
    id: 36,
    label: 'Cercle (périmètre et aire)',
    blocks: [{ exerciseType: 'tcm-circle-peri-aire', count: 1, columns: 1, pointsPerQuestion: 2 }],
  },
]

/** Points d’un bloc selon count × pointsPerQuestion (défaut 1). */
function blockSpecPoints(spec: TcmBlockSpec): number {
  return spec.count * (spec.pointsPerQuestion ?? 1)
}

/** Score maximum du test = somme des barèmes des étapes (pas un plafond fixe). */
export function computeTcmMaxScore(steps: readonly TcmStepSpec[] = TCM_STEPS): number {
  return steps.reduce(
    (sum, step) => sum + step.blocks.reduce((s, b) => s + blockSpecPoints(b), 0),
    0,
  )
}

/** Score maximum annoncé (dérivé des barèmes TCM_STEPS). */
export const TCM_MAX_SCORE = computeTcmMaxScore()

/**
 * Étapes regroupées sur une même feuille A4 (après la page consignes).
 * Page 2 : 1–4 · Page 3 : 5–8 · Page 4 : 9–11 · Page 5 : 12+13+14 ·
 * Page 6 : 15+16+17 · Page 7 : 18+19+20 · Page 8 : 21+22+23 ·
 * Page 9 : 24+25+26 · Page 10 : 27+28+29 · Page 11 : 30+31 ·
 * Page 12 : 32+33 · Page 13 : 34+35+36.
 */
const TCM_PACKED_PAGES: readonly (readonly number[])[] = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11],
  [12, 13, 14],
  [15, 16, 17],
  [18, 19, 20],
  [21, 22, 23],
  [24, 25, 26],
  [27, 28, 29],
  [30, 31],
  [32, 33],
  [34, 35, 36],
]

function blockFromSpec(
  spec: TcmBlockSpec,
  difficulty: Difficulty = 'moyen',
  exerciseNo?: number,
): ExerciseBlock {
  const type = exerciseTypeById[spec.exerciseType]
  if (!type) {
    throw new Error(`TCM : type d’exercice inconnu « ${spec.exerciseType} »`)
  }
  const columns = spec.columns ?? type.preferredColumns ?? 2
  return {
    topic: type.topic,
    exerciseType: type.id,
    difficulty,
    count: spec.count,
    columns: Math.max(1, Math.min(3, columns)) as 1 | 2 | 3,
    ...(isDraftPadExercise(type.id)
      ? { problemDraftGrids: Array.from({ length: spec.count }, () => false) }
      : {}),
    ...(spec.pointsPerQuestion != null ? { pointsPerQuestion: spec.pointsPerQuestion } : {}),
    ...(exerciseNo != null || spec.exerciseNo != null
      ? { exerciseNo: spec.exerciseNo ?? exerciseNo }
      : {}),
  }
}

function pageFromBlocks(blocks: ExerciseBlock[]): PageConfig {
  const [first, ...rest] = blocks
  if (!first) throw new Error('TCM : page sans bloc')
  return {
    domain: TCM_DOMAIN,
    ...first,
    extraBlocks: rest.length ? rest : undefined,
  }
}

function buildConsignesPage(): PageConfig {
  const type = exerciseTypeById['tcm-consignes']
  if (!type) throw new Error('TCM : type tcm-consignes manquant')
  return {
    domain: TCM_DOMAIN,
    topic: type.topic,
    exerciseType: type.id,
    difficulty: 'moyen',
    count: 1,
    columns: 1,
    pointsPerQuestion: 0,
  }
}

/** Feuille consignes + exercices (pages regroupées via TCM_PACKED_PAGES). */
export function buildTcmTestPages(): PageConfig[] {
  const byId = new Map(TCM_STEPS.map((step) => [step.id, step]))
  const packedPages = TCM_PACKED_PAGES.map((ids) => {
    const blocks = ids.flatMap((id) => {
      const step = byId.get(id)
      if (!step) throw new Error(`TCM : étape ${id} introuvable`)
      return step.blocks.map((b) => blockFromSpec(b, 'moyen', id))
    })
    return pageFromBlocks(blocks)
  })

  const packedIds = new Set(TCM_PACKED_PAGES.flat())
  const rest = TCM_STEPS.filter((step) => !packedIds.has(step.id)).map((step) =>
    pageFromBlocks(step.blocks.map((b) => blockFromSpec(b, 'moyen', step.id))),
  )

  return [buildConsignesPage(), ...packedPages, ...rest]
}

export function isTcmDomain(domain: Domain | undefined): boolean {
  return domain === TCM_DOMAIN
}

export function isTcmConsignesType(exerciseType: string | undefined): boolean {
  return exerciseType === 'tcm-consignes'
}

/** Total de points d’un bloc (ignore les items théorie / consignes). */
export function blockPointsTotal(
  items: ReadonlyArray<{ layout?: string; noPoints?: boolean; points?: number }>,
  pointsPerQuestion: number,
): number {
  if (pointsPerQuestion === 0) return 0
  return items
    .filter((item) => item.layout !== 'theory' && !item.noPoints)
    .reduce((sum, item) => sum + (item.points ?? pointsPerQuestion), 0)
}

export function formatPointsLabel(points: number): string {
  const text = Number.isInteger(points) ? String(points) : String(points).replace('.', ',')
  const unit = points > 1 ? 'points' : 'point'
  return `${text} ${unit}`
}

/** Badge d’exercice : total de l’exercice (questions notées × points par question). */
export function formatBlockPointsBadge(perQuestion: number, questionCount: number): string {
  return formatPointsLabel(questionCount * perQuestion)
}
