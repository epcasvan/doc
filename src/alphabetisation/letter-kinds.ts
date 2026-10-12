/**
 * Types d’exercice Alphabétisation — leçons lettre / son (ordre des pages de la fiche).
 * Les kinds `ecouter`, `syllabe-son`, `associer-*` réutilisent le générateur Soutien FR.
 */
import type { SoutienKindId } from '@/francais/soutien/kinds'

export const ALPHA_LETTER_KINDS = [
  {
    id: 'mots',
    label: '1 · Mots et images',
    description: '4 mots (lecture + Voc) avec image agrandie.',
    instruction: 'Observez les images et lisez les mots où l’on entend le son.',
    preferredColumns: 1 as const,
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
    description: '8 mots encadrés (majuscules) ; souligner la lettre du son à la main.',
    instruction: 'Soulignez la lettre du son dans les mots.',
    preferredColumns: 1 as const,
  },
  {
    id: 'souligner-min',
    label: '5 · Souligner la lettre (minuscules)',
    description: '8 mots encadrés (minuscules) ; souligner la lettre du son à la main.',
    instruction: 'Soulignez la lettre du son dans les mots.',
    preferredColumns: 1 as const,
  },
  {
    id: 'ecouter',
    label: '6 · Entendre le son',
    description:
      'Grille (1–3 col.) + QR ; 9 mots / 3 colonnes par défaut (max. 30) ; audio téléchargeable.',
    instruction: 'Écoutez les mots et cochez quand vous entendez le son.',
    preferredColumns: 1 as const,
  },
  {
    id: 'ecouter-image',
    label: '7 · Entendre avec image',
    description:
      'Grille images (3–5 col.) ; 15 mots / 5 colonnes par défaut (max. 30) ; cadre type 1.',
    instruction: 'Écoutez. Cochez quand vous entendez le son (regardez l’image).',
    preferredColumns: 1 as const,
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
      'Grille (1–3 col.) ; 18 mots par défaut ; mots ≥ 2 syllabes ; découpe scolaire.',
    instruction: 'À quelle syllabe entendez-vous le son ?',
    preferredColumns: 1 as const,
  },
  {
    id: 'associer-syllabe',
    label: '10 · Classer les syllabes',
    description: '5 QR + 5 syllabes cadrées ; 2 séries (défaut).',
    instruction: 'Écoutez et classez les syllabes dans l’ordre.',
    preferredColumns: 1 as const,
  },
  {
    id: 'syllabes-cv',
    label: '11 · Syllabes CV / VC',
    description: 'Syllabes simples (2 lettres) : 5 par ligne, 4 lignes.',
    instruction: 'Lisez les syllabes ci-dessous.',
    preferredColumns: 1 as const,
  },
  {
    id: 'syllabes-long',
    label: '12 · Syllabes 3–4 lettres',
    description: 'Syllabes plus longues (3–4 lettres) : 5 par ligne, 4 lignes.',
    instruction: 'Lisez les syllabes ci-dessous.',
    preferredColumns: 1 as const,
  },
  {
    id: 'syllabes-prononcer',
    label: '13 · Prononcer les syllabes',
    description: 'Mot découpé en syllabes + QR avant chaque ligne.',
    instruction: 'Prononcez les syllabes des mots.',
    preferredColumns: 1 as const,
  },
  {
    id: 'associer-audio',
    label: '14 · Classer les mots',
    description:
      '5 QR numérotés + 5 mots cadrés avec trait ; 1 à 3 séries (défaut 2) ; hors mots type 1.',
    instruction: 'Écoutez et classez les mots dans l’ordre.',
    preferredColumns: 1 as const,
  },
  {
    id: 'associer-image',
    label: '15 · Classer les images',
    description: 'Comme le type 14 (5 images type 1) ; 1 série par défaut (max. 3).',
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
