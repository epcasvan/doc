/** 17 types d’exercice Soutien FR — identiques pour chaque document (lettre / son). */
export const SOUTIEN_KINDS = [
  {
    id: 'mots',
    label: '1 · Mots et images',
    description:
      '16 mots (lecture + Voc) filtrés par le phonème exact ; /o/ écrit = lettre o.',
    instruction: 'Observez les images et lisez les mots où l’on entend le son.',
    preferredColumns: 1 as const,
  },
  {
    id: 'lettres',
    label: '2 · Reconnaître la lettre',
    description: 'Tableau de lettres en cercles ; 8 colonnes ; 5 lignes par défaut (max. 15).',
    instruction: 'Entourez toutes les lettres demandées.',
    preferredColumns: 1 as const,
  },
  {
    id: 'syllabes',
    label: '3 · Lecture de syllabes',
    description:
      'Deux blocs cadrés (script + Playwrite) : 3 lignes par défaut, moitié CV et moitié doubles sans nasal.',
    instruction: 'Lisez les syllabes ci-dessous.',
    preferredColumns: 1 as const,
  },
  {
    id: 'relier',
    label: '4 · Relier les parties',
    description:
      'Mots du type 1 uniquement ; 12 mots / 2 colonnes par défaut ; parties à relier.',
    instruction: 'Reliez les parties et formez un mot.',
    preferredColumns: 1 as const,
  },
  {
    id: 'completer',
    label: '5 · Compléter les mots',
    description:
      'Mots type 1 ; 12 mots / 2 colonnes par défaut ; blanc CV/VC + QR ; cadre type 1.',
    instruction: 'Écoutez et Complétez les mots.',
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
    id: 'syllabe-son',
    label: '8 · Syllabe du son',
    description:
      'Grille (1–3 col.) ; 18 mots par défaut ; mots ≥ 2 syllabes ; découpe scolaire.',
    instruction: 'À quelle syllabe entendez-vous le son ?',
    preferredColumns: 1 as const,
  },
  {
    id: 'lettres-phrase',
    label: '9 · Mot dans la phrase',
    description:
      '8 phrases par défaut ; mot avec image obligatoire ; lettres sous le trait ; hors mots types 1 et 5.',
    instruction: 'Écrivez le mot correct à l’aide des lettres.',
    preferredColumns: 1 as const,
  },
  {
    id: 'determinants',
    label: '10 · Déterminants',
    description:
      '9 phrases par défaut ; l’ / le / la / les ; scènes rédigées (niveaux A1/A2/B1) ; voyelle simple colorée (Alpha).',
    instruction: 'Complétez avec les déterminants l’, le, la ou les.',
    preferredColumns: 1 as const,
  },
  {
    id: 'dictee',
    label: '11 · Dictée',
    description:
      'Grille 2 colonnes : n° + trait continu ; 8 mots par défaut (mots du type 1 de la fiche).',
    instruction: 'Dictée. Écrivez les mots correctement !',
    preferredColumns: 1 as const,
  },
  {
    id: 'compter',
    label: '12 · Compter le son',
    description:
      '8 phrases par défaut en Playwrite + compter le phonème ; trait de réponse plein.',
    instruction: 'Combien de fois entendez-vous le son ?',
    preferredColumns: 1 as const,
  },
  {
    id: 'ordre',
    label: '13 · Remettre en ordre',
    description:
      '9 phrases par défaut — pastilles Gattegno ; sans coloriage des lettres du son.',
    instruction: 'Mettez les mots dans l’ordre.',
    preferredColumns: 1 as const,
  },
  {
    id: 'lire',
    label: '14 · Phrases à lire',
    description:
      '20 phrases par défaut ; voyelle simple colorée (Alpha : pas an/au/eau…).',
    instruction: 'Lisez les phrases.',
    preferredColumns: 1 as const,
  },
  {
    id: 'associer-audio',
    label: '15 · Classer les mots',
    description:
      '5 QR numérotés + 5 mots cadrés avec trait ; 1 à 3 séries (défaut 2) ; hors mots type 1.',
    instruction: 'Écoutez et classez les mots dans l’ordre.',
    preferredColumns: 1 as const,
  },
  {
    id: 'associer-image',
    label: '16 · Classer les images',
    description:
      'Comme le type 15 (5 images type 1) ; 1 série par défaut (max. 3).',
    instruction: 'Écoutez et classez les images dans l’ordre.',
    preferredColumns: 1 as const,
  },
  {
    id: 'mots-meles',
    label: '17 · Mots mêlés',
    description:
      'Liste de 12 mots (sans bordure) + grille 15×15 ; sans image (Voc A1–B1) ; pas de ligatures Æ/Œ.',
    instruction: 'Entourez les mots dans la grille.',
    preferredColumns: 1 as const,
  },
] as const

export type SoutienKindId = (typeof SOUTIEN_KINDS)[number]['id']

const KIND_IDS_LONGEST = [...SOUTIEN_KINDS.map((k) => k.id)].sort((a, b) => b.length - a.length)

export function parseSoutienType(
  typeId: string,
): { bankId: string; kind: SoutienKindId; vowel?: string } | null {
  if (!typeId.startsWith('soutien-')) return null
  const rest = typeId.slice('soutien-'.length)
  for (const kind of KIND_IDS_LONGEST) {
    const suffix = `-${kind}`
    if (!rest.endsWith(suffix)) continue
    const bankId = rest.slice(0, -suffix.length)
    if (!bankId) return null
    const vowel = /^[aeiouy]$/.test(bankId) ? bankId : undefined
    return { bankId, kind: kind as SoutienKindId, vowel }
  }
  return null
}
