import type { ExerciseType } from '@/math/types'
import { GRAMMAIRE_THEORY_DOCS } from '../theory'
import { GRAM_EXERCISE_KINDS } from './kinds'
import {
  GRAM_SUBTHEMES,
  gramExerciseTypeId,
  parseGramExerciseType,
  theorySubthemeId,
} from './subthemes'
import { bankSize, lessonForType } from './bank'

/** Sous-thèmes dérivés des fiches théorie (PDF / notions hors conjugaison listée). */
function theoryDerivedSubthemes(): Array<{
  id: string
  label: string
  topic: string
  theoryTypeIds: string[]
}> {
  const coveredTheory = new Set<string>()
  for (const s of GRAM_SUBTHEMES) {
    for (const t of s.theoryTypeIds) coveredTheory.add(t)
  }
  const knownIds = new Set(GRAM_SUBTHEMES.map((s) => s.id))
  const out: Array<{ id: string; label: string; topic: string; theoryTypeIds: string[] }> = []
  for (const doc of GRAMMAIRE_THEORY_DOCS) {
    if (coveredTheory.has(doc.typeId)) continue
    const sid = theorySubthemeId(doc.typeId)
    if (knownIds.has(sid)) continue
    knownIds.add(sid)
    out.push({
      id: sid,
      label: doc.title,
      topic: doc.topic,
      theoryTypeIds: [doc.typeId],
    })
  }
  return out
}

export const ALL_GRAM_SUBTHEMES = [...GRAM_SUBTHEMES, ...theoryDerivedSubthemes()]

/** Ordre du menu « Sous-thème » — Se présenter (famille avant la négation a7). */
const SE_PRESENTER_SUBORDER = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'famille', 'a7', 'a8'] as const

function subthemeSortRank(topic: string, subId: string): number {
  if (topic !== 'gram-se-presenter') return 0
  const index = SE_PRESENTER_SUBORDER.indexOf(subId as (typeof SE_PRESENTER_SUBORDER)[number])
  return index === -1 ? 1000 : index
}

/** Types d’exercice (pas théorie) pour le catalogue. */
export function buildGrammairePracticeTypes(): ExerciseType[] {
  const types: ExerciseType[] = []
  const seen = new Set<string>()

  for (const sub of ALL_GRAM_SUBTHEMES) {
    for (const kind of GRAM_EXERCISE_KINDS) {
      const id = gramExerciseTypeId(sub.id, kind.id)
      if (bankSize(id) <= 0) continue
      if (seen.has(id)) continue
      seen.add(id)
      const les = lessonForType(id)
      types.push({
        id,
        topic: sub.topic,
        label: les?.label ?? kind.label,
        description: `${sub.label} — ${les?.label ?? kind.description}`,
        instruction: les?.instruction ?? kind.instruction,
        visual: 'texte',
        preferredColumns: 1,
      })
    }
  }

  return types
}

export function subthemesForTopicAll(topic: string) {
  const list = ALL_GRAM_SUBTHEMES.filter((s) => s.topic === topic)
  if (topic !== 'gram-se-presenter') return list
  return [...list].sort(
    (a, b) =>
      subthemeSortRank(topic, a.id) - subthemeSortRank(topic, b.id) ||
      a.label.localeCompare(b.label, 'fr'),
  )
}

export function resolveGramSubthemeAll(topic: string, exerciseType: string) {
  const list = subthemesForTopicAll(topic)
  if (!list.length) return undefined
  const parsed = parseGramExerciseType(exerciseType)
  if (parsed) {
    return (
      list.find((s) => s.id === parsed.subId) ??
      ALL_GRAM_SUBTHEMES.find((s) => s.id === parsed.subId)
    )
  }
  if (exerciseType.endsWith('-theorie')) {
    const hit =
      list.find((s) => s.theoryTypeIds.includes(exerciseType)) ??
      ALL_GRAM_SUBTHEMES.find((s) => s.theoryTypeIds.includes(exerciseType))
    if (hit) return hit
  }
  return list[0]
}
