/**
 * Types d’exercice Alphabétisation — leçons lettre / son.
 * Ordre = apparition chronologique sur la fiche (pages 1 → 9).
 * Les kinds `ecouter`, `syllabe-son`, `associer-*` réutilisent le générateur Soutien FR.
 */
import type { SoutienKindId } from '@/francais/soutien/kinds'

export const ALPHA_LETTER_KINDS = [
  {
    id: 'mots',
    label: '1 · Mots et images',
    description: '2–4 colonnes (4 / 9 / 12 mots) ; 3 col. = 3 lignes ; audio téléchargeable.',
    instruction: 'Observez les images et lisez les mots où l’on entend le son.',
    preferredColumns: 3 as const,
  },
  {
    id: 'lettres-maj',
    label: '2 · Reconnaître la lettre (majuscules)',
    description: 'Tableau de lettres ; uniquement des majuscules.',
    instruction: 'Entourez toutes les lettres demandées.',
    preferredColumns: 1 as const,
  },
  {
    id: 'lettres-min',
    label: '3 · Reconnaître la lettre (minuscules)',
    description: 'Tableau de lettres ; uniquement des minuscules.',
    instruction: 'Entourez toutes les lettres demandées.',
    preferredColumns: 1 as const,
  },
  {
    id: 'souligner-maj',
    label: '4 · Souligner la lettre (majuscules)',
    description: '12 mots encadrés (majuscules) ; souligner la lettre du son à la main.',
    instruction: 'Soulignez la lettre majuscule du son dans les mots.',
    preferredColumns: 1 as const,
  },
  {
    id: 'souligner-min',
    label: '5 · Souligner la lettre (minuscules)',
    description: '12 mots encadrés (minuscules) ; souligner la lettre du son à la main.',
    instruction: 'Soulignez la lettre minuscule du son dans les mots.',
    preferredColumns: 1 as const,
  },
  {
    id: 'ecouter',
    label: '6 · Entendre le son',
    description:
      'Grille 2–3 col. + QR ; 8 mots / 2 colonnes par défaut (max. 30) ; audio téléchargeable.',
    instruction: 'Écoutez les mots et cochez quand vous entendez le son.',
    preferredColumns: 2 as const,
  },
  {
    id: 'ecouter-image',
    label: '7 · Entendre avec image',
    description:
      'Grille images 3–5 col. ; 12 mots / 4 colonnes par défaut ; cadre adaptatif exercice / corrigé.',
    instruction: 'Écoutez. Cochez quand vous entendez le son (regardez l’image).',
    preferredColumns: 4 as const,
  },
  {
    id: 'syllabe-son-qr',
    label: '8 · Syllabe du son (QR)',
    description: 'Comme le type 9 sans image : QR audio + syllabes.',
    instruction: 'À quelle syllabe entendez-vous le son ?',
    preferredColumns: 1 as const,
  },
  {
    id: 'syllabe-son',
    label: '9 · Syllabe du son',
    description:
      'Grille (1–3 col.) ; 18 mots par défaut ; mots ≥ 2 syllabes orales.',
    instruction: 'À quelle syllabe entendez-vous le son ?',
    preferredColumns: 1 as const,
  },
  {
    id: 'syllabes-cv',
    label: '10 · Syllabes CV / VC',
    description: 'Mélange CV et VC sans son complexe ; 6 lignes · 4–6 colonnes.',
    instruction: 'Lisez les syllabes ci-dessous.',
    preferredColumns: 5 as const,
  },
  {
    id: 'syllabes-long',
    label: '11 · Syllabes 3–4 lettres',
    description: 'Syllabes 3–4 lettres ; 6 lignes · 4–6 colonnes ; cadre par syllabe.',
    instruction: 'Lisez les syllabes ci-dessous.',
    preferredColumns: 5 as const,
  },
  {
    id: 'syllabes-prononcer',
    label: '12 · Prononcer les syllabes',
    description: '10 mots · 2 colonnes ; mots de 2 ou 3 syllabes ; cadre type 1.',
    instruction: 'Prononcez les syllabes des mots.',
    preferredColumns: 2 as const,
  },
  {
    id: 'associer-syllabe',
    label: '13 · Classer les syllabes',
    description: '4 QR + 4 syllabes cadrées ; 2 séries par défaut ; page avec le type 12.',
    instruction: 'Écoutez et classez les syllabes dans l’ordre.',
    preferredColumns: 1 as const,
  },
  {
    id: 'associer-audio',
    label: '14 · Classer les mots',
    description:
      '4 QR numérotés + 4 mots cadrés avec trait ; 1 à 3 séries (défaut 2) ; audio requis.',
    instruction: 'Écoutez et classez les mots dans l’ordre.',
    preferredColumns: 1 as const,
  },
  {
    id: 'associer-image',
    label: '15 · Classer les images',
    description: 'Comme le type 14 (4 images type 1) ; page avec le type 14.',
    instruction: 'Écoutez et classez les images dans l’ordre.',
    preferredColumns: 1 as const,
  },
] as const

export type AlphaLetterKindId = (typeof ALPHA_LETTER_KINDS)[number]['id']

/** Délégation vers le générateur Soutien FR (même logique). */
export const ALPHA_KIND_TO_SOUTIEN: Partial<Record<AlphaLetterKindId, SoutienKindId>> = {
  mots: 'mots',
  ecouter: 'ecouter',
  'ecouter-image': 'ecouter-image',
  'syllabe-son': 'syllabe-son',
  'associer-audio': 'associer-audio',
  'associer-image': 'associer-image',
}

export function isAlphaLetterKind(kind: string): kind is AlphaLetterKindId {
  return ALPHA_LETTER_KINDS.some((k) => k.id === kind)
}
