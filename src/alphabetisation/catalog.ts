import type { ExerciseType, Topic } from '@/math/types'
import {
  ALPHA_LETTER_KINDS,
  ALPHA_SPECIAL_KINDS,
  isAlphaLetterKind,
  type AlphaKindId,
} from './kinds'
import { ALPHA_THEMES, allAlphaBankDefs } from './themes'

export const ALPHABETISATION_DOMAIN = 'alphabetisation' as const

export const ALPHABETISATION_TOPICS: Topic[] = ALPHA_THEMES.map((theme) => ({
  id: theme.id,
  label: theme.label,
  domain: 'alphabetisation',
}))

const t = (
  id: string,
  topic: string,
  label: string,
  description: string,
  instruction: string,
  preferredColumns: number,
): ExerciseType => ({
  id,
  topic,
  label,
  description,
  instruction,
  visual: 'texte',
  preferredColumns,
})

function kindsForMode(mode: 'letter' | 'special', themeId: string): Array<{
  id: AlphaKindId
  label: string
  description: string
  instruction: string
  preferredColumns: number
}> {
  if (mode === 'letter') {
    return ALPHA_LETTER_KINDS.map((k) => ({
      id: k.id,
      label: k.label,
      description: k.description,
      instruction: k.instruction,
      preferredColumns: k.preferredColumns,
    }))
  }
  if (themeId === 'alpha-alphabet') {
    return ALPHA_SPECIAL_KINDS.filter((k) => k.id.startsWith('alphabet-')).map((k) => ({
      id: k.id,
      label: k.label,
      description: k.description,
      instruction: k.instruction,
      preferredColumns: k.preferredColumns,
    }))
  }
  if (themeId === 'alpha-phrases') {
    return ALPHA_SPECIAL_KINDS.filter((k) =>
      ['lire-phrases', 'ordre-phrases', 'entourer', 'dictee-mots'].includes(k.id),
    ).map((k) => ({
      id: k.id,
      label: k.label,
      description: k.description,
      instruction: k.instruction,
      preferredColumns: k.preferredColumns,
    }))
  }
  if (themeId === 'alpha-syllabes') {
    return ALPHA_SPECIAL_KINDS.filter((k) =>
      ['lire-grille', 'lire-cursive', 'entourer', 'former', 'dictee-mots'].includes(k.id),
    ).map((k) => ({
      id: k.id,
      label: k.label,
      description: k.description,
      instruction: k.instruction,
      preferredColumns: k.preferredColumns,
    }))
  }
  // mots
  return ALPHA_SPECIAL_KINDS.filter((k) =>
    ['lire-grille', 'lire-cursive', 'entourer', 'classer', 'former', 'dictee-mots'].includes(
      k.id,
    ),
  ).map((k) => ({
    id: k.id,
    label: k.label,
    description: k.description,
    instruction: k.instruction,
    preferredColumns: k.preferredColumns,
  }))
}

export const ALPHABETISATION_EXERCISE_TYPES: ExerciseType[] = []

for (const def of allAlphaBankDefs()) {
  const kinds = kindsForMode(def.mode, def.themeId)
  for (const kind of kinds) {
    const phonemeHint =
      def.sound.phoneme && isAlphaLetterKind(kind.id)
        ? kind.description.replace('le son', `le son ${def.sound.phoneme}`)
        : kind.description
    ALPHABETISATION_EXERCISE_TYPES.push(
      t(
        `alpha-${def.sound.bankId}-${kind.id}`,
        def.themeId,
        kind.label,
        phonemeHint,
        kind.instruction,
        kind.preferredColumns,
      ),
    )
  }
}
