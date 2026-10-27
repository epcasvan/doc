/** Types d’exercices de conjugaison / transformation / association. */

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
    description: 'Un verbe à conjuguer : consigne, ou infinitif coloré entre parenthèses.',
    instruction: 'Conjuguez le verbe.',
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
  {
    id: 'associer',
    label: 'Associer',
    description: 'Relier un élément à la forme ou à la phrase qui convient.',
    instruction: 'Associez chaque élément à la réponse qui convient.',
    layout: 'fill' as const,
  },
  {
    id: 'ordre',
    label: 'Remettre dans l’ordre',
    description: 'Reconstituer la phrase à partir des mots donnés.',
    instruction: 'Remettez les mots dans l’ordre.',
    layout: 'fill' as const,
  },
  {
    id: 'transformer',
    label: 'Transformer la phrase',
    description: 'Réécrire la phrase selon le modèle (question, politesse, etc.).',
    instruction: 'Transformez la phrase comme dans l’exemple.',
    layout: 'fill' as const,
  },
  {
    id: 'corriger',
    label: 'Corriger la phrase',
    description: 'Corriger l’erreur de vocabulaire, de structure ou de ponctuation.',
    instruction: 'Corrigez la phrase.',
    layout: 'fill' as const,
  },
] as const

export type GramExerciseKindId = (typeof GRAM_EXERCISE_KINDS)[number]['id']

/** Ids du plus long au plus court (parse `gram-ex-{sub}-{kind}`). */
export const GRAM_KIND_IDS: GramExerciseKindId[] = (
  [...GRAM_EXERCISE_KINDS].map((k) => k.id) as GramExerciseKindId[]
).sort((a, b) => b.length - a.length)

export function gramKindById(id: string) {
  return GRAM_EXERCISE_KINDS.find((k) => k.id === id)
}
