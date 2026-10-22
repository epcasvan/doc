/** Les 8 types d’exercices de conjugaison / transformation. */

export const GRAM_EXERCISE_KINDS = [
  {
    id: 'qcm-conj',
    label: 'Choisissez la bonne conjugaison',
    description: 'Phrase avec un blanc et trois formes proposées.',
    instruction: 'Choisissez la bonne conjugaison.',
    layout: 'qcm' as const,
  },
  {
    id: 'fill-conj',
    label: 'Conjuguez le verbe',
    description: 'Verbe entre parenthèses ; écrire la forme conjuguée.',
    instruction: 'Conjuguez le verbe entre parenthèses.',
    layout: 'fill' as const,
  },
  {
    id: 'qcm-verbe',
    label: 'Choisissez le verbe correct',
    description: 'Phrase avec un blanc et trois verbes / formes proposés.',
    instruction: 'Choisissez le verbe correct.',
    layout: 'qcm' as const,
  },
  {
    id: 'pluriel',
    label: 'Mettre au pluriel',
    description: 'Réécrire la phrase au pluriel.',
    instruction: 'Mettez la phrase au pluriel.',
    layout: 'fill' as const,
  },
  {
    id: 'singulier',
    label: 'Mettre au singulier',
    description: 'Réécrire la phrase au singulier.',
    instruction: 'Mettez la phrase au singulier.',
    layout: 'fill' as const,
  },
  {
    id: 'negatif',
    label: 'Mettre à la forme négative',
    description: 'Transformer la phrase affirmative en négative (ne … pas).',
    instruction: 'Mettez la phrase à la forme négative.',
    layout: 'fill' as const,
  },
  {
    id: 'affirmatif',
    label: 'Mettre à la forme affirmative',
    description: 'Transformer la phrase négative en affirmative.',
    instruction: 'Mettez la phrase à la forme affirmative.',
    layout: 'fill' as const,
  },
  {
    id: 'ecrire',
    label: 'Écrire une phrase',
    description: 'Écrire une phrase avec le verbe et le mot donnés.',
    instruction: 'Écrivez une phrase avec le verbe et le mot proposés.',
    layout: 'write' as const,
  },
] as const

export type GramExerciseKindId = (typeof GRAM_EXERCISE_KINDS)[number]['id']

export function gramKindById(id: string) {
  return GRAM_EXERCISE_KINDS.find((k) => k.id === id)
}
