/** Lexique Voc : mots sélectionnés + métadonnées d’exercices. */
import { vocabBankForTopic, type VocabSubgroup } from './vocab-registry'
import type { Difficulty } from '@/math/types'

export type VocabLevel = 'a1' | 'a2' | 'b1'

export type VocabSentenceKind = 'trous' | 'phrase' | 'dictee'

export type VocabWordEntry = {
  id: string
  label: string
  imageSrc?: string
  audio?: string
  definition: string
  syllables: string[]
  synonym?: string
  antonym?: string
  masculine?: string
  feminine?: string
  subgroup?: string
  sentences: {
    trous: Record<VocabLevel, string[]>
    phrase: Record<VocabLevel, string[]>
    dictee?: Record<VocabLevel, string[]>
  }
}

/** Alias historique pour le tableau « Mots à apprendre ». */
export type VocabLearnWord = Pick<VocabWordEntry, 'id' | 'label' | 'imageSrc'>

export const VOCAB_EXERCISE_KINDS = [
  'assoc-image',
  'assoc-def',
  'qcm-def',
  'trous',
  'def-ecrire',
  'phrase',
  'dictee',
  'syllabes',
  'syn-ant',
  'genre',
] as const

export type VocabExerciseKind = (typeof VOCAB_EXERCISE_KINDS)[number]

export function vocabLevelFromDifficulty(difficulty: Difficulty | undefined): VocabLevel {
  if (difficulty === 'facile') return 'a1'
  if (difficulty === 'avance') return 'b1'
  return 'a2'
}

export function vocabSubgroupsFor(topic: string): VocabSubgroup[] {
  return vocabBankForTopic(topic)?.subgroups ?? []
}

export function vocabLearnWordsFor(topic: string, subgroupId?: string): VocabWordEntry[] {
  const bank = vocabBankForTopic(topic)
  if (!bank) return []
  const groups = bank.subgroups
  if (!groups.length) return []
  const group =
    (subgroupId ? groups.find((g) => g.id === subgroupId) : undefined) ?? groups[0]
  return group?.words ?? []
}

/** Tous les mots du thème (tous sous-groupes), tri alpha. */
export function vocabAllWordsFor(topic: string): VocabWordEntry[] {
  const bank = vocabBankForTopic(topic)
  if (!bank) return []
  const all = bank.subgroups.flatMap((g) => g.words)
  return [...all].sort((a, b) => a.label.localeCompare(b.label, 'fr'))
}

export function defaultVocabSubgroup(topic: string): string | undefined {
  return vocabSubgroupsFor(topic)[0]?.id
}

export function isVocabLearnType(typeId: string): boolean {
  return typeId.endsWith('-voc-mots')
}

export function isVocabPoolType(typeId: string): boolean {
  return /-(voc)-(mots|assoc-image|assoc-def|qcm-def|trous|def-ecrire|phrase|dictee|syllabes|syn-ant|genre)$/.test(
    typeId,
  )
}

export function isVocabProductionType(typeId: string): boolean {
  return /-(voc)-(trous|def-ecrire|phrase|dictee)$/.test(typeId)
}

export function parseVocabKind(typeId: string): VocabExerciseKind | 'mots' | null {
  const match = /-voc-([a-z-]+)$/.exec(typeId)
  if (!match) return null
  const kind = match[1]!
  if (kind === 'mots') return 'mots'
  if ((VOCAB_EXERCISE_KINDS as readonly string[]).includes(kind)) return kind as VocabExerciseKind
  return null
}

export function defaultVocabSelected(
  topic: string,
  rows = 3,
  cols = 3,
  subgroupId?: string,
): string[] {
  const words = vocabLearnWordsFor(topic, subgroupId)
  const n = Math.max(1, rows) * Math.max(1, cols)
  return words.slice(0, n).map((word) => word.id)
}

export function resolveVocabEntries(
  topic: string,
  selectedIds: string[] | undefined,
  rows: number,
  cols: number,
  subgroupId?: string,
  custom: VocabWordEntry[] = [],
): VocabLearnWord[] {
  return resolveVocabPool(topic, selectedIds, subgroupId, custom).slice(
    0,
    Math.max(1, rows) * Math.max(1, cols),
  )
}

/** Pool de mots cochés pour les exercices Voc (hors capacité tableau). */
export function resolveVocabPool(
  topic: string,
  selectedIds: string[] | undefined,
  subgroupId?: string,
  custom: VocabWordEntry[] = [],
): VocabWordEntry[] {
  const bank = [...vocabLearnWordsFor(topic, subgroupId), ...custom]
  if (bank.length === 0) return []
  const byId = new Map(bank.map((word) => [word.id, word]))
  const ids =
    selectedIds && selectedIds.length > 0
      ? selectedIds.filter((id) => byId.has(id))
      : defaultVocabSelected(topic, 3, 3, subgroupId)
  return ids.map((id) => byId.get(id)!).filter(Boolean)
}

export function wordHasSynAnt(word: VocabWordEntry): boolean {
  return Boolean(word.synonym || word.antonym)
}

export function wordHasGender(word: VocabWordEntry): boolean {
  return Boolean(word.masculine && word.feminine && word.masculine !== word.feminine)
}

export function makeCustomVocabWord(label: string, imageSrc?: string): VocabWordEntry {
  const slug = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const id = `custom-${slug}-${Date.now().toString(36)}`
  const blank = {
    a1: [`J’écris le mot ___.`, `Voici ___.`, `C’est ___.`, `Je dis ___.`, `Regardez ___.`],
    a2: [
      `Ce matin, j’ai appris le mot ___.`,
      `Nous avons vu ___ en classe.`,
      `J’utilise ___ dans une phrase.`,
      `Le professeur a expliqué ___.`,
      `J’associe ___ à une image.`,
    ],
    b1: [
      `Bien que ce soit nouveau, j’emploie ___.`,
      `Comme j’ai révisé, je me souviens de ___.`,
      `Si je dois donner un exemple, je choisis ___.`,
      `Après la leçon, j’ai noté ___.`,
      `Afin d’être précis, j’utilise ___.`,
    ],
  }
  const phrases = {
    a1: [`Je vois ${label}.`, `Voici ${label}.`, `C’est ${label}.`, `J’aime ${label}.`, `Il y a ${label}.`],
    a2: [
      `Ce matin, j’ai vu ${label}.`,
      `Nous avons parlé de ${label}.`,
      `Le professeur a montré ${label}.`,
      `J’explique ${label} à mon camarade.`,
      `Après la leçon, j’ai noté ${label}.`,
    ],
    b1: [
      `Bien que ce soit courant, j’emploie ${label} avec soin.`,
      `Si je dois donner un exemple, je choisis ${label}.`,
      `Après avoir révisé, j’utilise ${label} spontanément.`,
      `Lorsque je raconte mon histoire, je mentionne ${label}.`,
      `Afin d’être précis, je préfère dire ${label}.`,
    ],
  }
  return {
    id,
    label,
    imageSrc,
    definition: `Mot ajouté : ${label}.`,
    syllables: [label],
    subgroup: 'custom',
    sentences: { trous: blank, phrase: phrases, dictee: phrases },
  }
}
