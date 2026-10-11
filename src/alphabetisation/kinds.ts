/**
 * Types d’exercice Alphabétisation.
 * Les kinds lettre/son reprennent ceux de Soutien FR ; Syllabes / Mots / Phrases
 * ont des kinds propres.
 */
import { SOUTIEN_KINDS, type SoutienKindId } from '@/francais/soutien/kinds'

export const ALPHA_LETTER_KINDS = SOUTIEN_KINDS

export type AlphaLetterKindId = SoutienKindId

/** Kinds pour les thèmes Syllabes, Mots, Phrases, Alphabet. */
export const ALPHA_SPECIAL_KINDS = [
  {
    id: 'lire-grille',
    label: '1 · Lire la grille',
    description: 'Grille de syllabes ou de mots à lire (script).',
    instruction: 'Lisez à voix haute.',
    preferredColumns: 1 as const,
  },
  {
    id: 'lire-cursive',
    label: '2 · Lire en cursive',
    description: 'Même contenu en écriture cursive (Playwrite).',
    instruction: 'Lisez les syllabes ou les mots.',
    preferredColumns: 1 as const,
  },
  {
    id: 'entourer',
    label: '3 · Entourer',
    description: 'Repérer la lettre, la syllabe ou le mot cible.',
    instruction: 'Entourez les formes demandées.',
    preferredColumns: 1 as const,
  },
  {
    id: 'former',
    label: '4 · Former',
    description: 'Associer deux parties pour former une syllabe ou un mot.',
    instruction: 'Associez les parties et écrivez le résultat.',
    preferredColumns: 1 as const,
  },
  {
    id: 'classer',
    label: '5 · Classer',
    description: 'Trier des mots (outil / courant, longueur…).',
    instruction: 'Classez les mots dans la bonne colonne.',
    preferredColumns: 1 as const,
  },
  {
    id: 'dictee-mots',
    label: '6 · Dictée',
    description: 'Écrire les mots ou syllabes dictés.',
    instruction: 'Écrivez correctement.',
    preferredColumns: 1 as const,
  },
  {
    id: 'lire-phrases',
    label: '7 · Phrases à lire',
    description: 'Phrases d’une petite histoire adaptée.',
    instruction: 'Lisez les phrases.',
    preferredColumns: 1 as const,
  },
  {
    id: 'ordre-phrases',
    label: '8 · Remettre en ordre',
    description: 'Remettre les mots d’une phrase dans l’ordre.',
    instruction: 'Mettez les mots dans l’ordre.',
    preferredColumns: 1 as const,
  },
  {
    id: 'alphabet-ordre',
    label: '1 · Ordre alphabétique',
    description: 'Ranger des lettres dans l’ordre.',
    instruction: 'Classez les lettres par ordre alphabétique.',
    preferredColumns: 1 as const,
  },
  {
    id: 'alphabet-suivant',
    label: '2 · Lettre suivante',
    description: 'Trouver la lettre qui suit.',
    instruction: 'Quelle lettre vient juste après ?',
    preferredColumns: 2 as const,
  },
  {
    id: 'alphabet-initiale',
    label: '3 · Mot d’initiale',
    description: 'Proposer un mot qui commence par une lettre.',
    instruction: 'Écrivez un mot qui commence par la lettre demandée.',
    preferredColumns: 1 as const,
  },
] as const

export type AlphaSpecialKindId = (typeof ALPHA_SPECIAL_KINDS)[number]['id']

export type AlphaKindId = AlphaLetterKindId | AlphaSpecialKindId

const LETTER_KIND_IDS = [...ALPHA_LETTER_KINDS.map((k) => k.id)].sort(
  (a, b) => b.length - a.length,
)
const SPECIAL_KIND_IDS = [...ALPHA_SPECIAL_KINDS.map((k) => k.id)].sort(
  (a, b) => b.length - a.length,
)

export function parseAlphaType(
  typeId: string,
): { bankId: string; kind: AlphaKindId } | null {
  if (!typeId.startsWith('alpha-')) return null
  const rest = typeId.slice('alpha-'.length)
  for (const kind of [...SPECIAL_KIND_IDS, ...LETTER_KIND_IDS]) {
    const suffix = `-${kind}`
    if (!rest.endsWith(suffix)) continue
    const bankId = rest.slice(0, -suffix.length)
    if (!bankId) return null
    return { bankId, kind: kind as AlphaKindId }
  }
  return null
}

export function isAlphaLetterKind(kind: string): kind is AlphaLetterKindId {
  return ALPHA_LETTER_KINDS.some((k) => k.id === kind)
}

export function isAlphaSpecialKind(kind: string): kind is AlphaSpecialKindId {
  return ALPHA_SPECIAL_KINDS.some((k) => k.id === kind)
}
